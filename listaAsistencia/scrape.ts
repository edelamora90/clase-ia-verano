import { chromium, type Browser, type Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

const TARGET_URL =
  'https://siitec.colima.tecnm.mx/docencia/index.php/CMisgrupos/MisGrupos/?idgrupo=24675&id_periodo=106';
const CDP_URL = 'http://localhost:9222';
const PHOTOS_DIR = path.join(__dirname, 'photos');
const OUTPUT_FILE = path.join(__dirname, 'students.json');

interface Student {
  name: string;
  controlNumber: string;
  photoUrl: string;
}

interface ScrapedStudent {
  name: string;
  controlNumber: string;
  photoUrl: string | null;
}

const CONTROL_NUMBER_PATTERN = /\b(\d{8,10})\b/;

function resolveUrl(baseUrl: string, src: string | null | undefined): string | null {
  if (!src || src.trim() === '' || src.startsWith('data:')) {
    return null;
  }
  try {
    return new URL(src, baseUrl).href;
  } catch {
    return null;
  }
}

async function isSessionExpired(page: Page): Promise<boolean> {
  const url = page.url().toLowerCase();
  if (
    url.includes('/login') ||
    url.includes('/oauth') ||
    url.includes('/cuentas') ||
    url.includes('signin') ||
    url.includes('iniciar')
  ) {
    return true;
  }

  const loginIndicators = await page.evaluate(() => {
    const passwordInput = document.querySelector('input[type="password"]');
    const loginForm = document.querySelector('form[action*="login"], form[action*="Login"], form[action*="oauth"]');
    const bodyText = document.body?.innerText?.toLowerCase() ?? '';
    const title = document.title.toLowerCase();

    return {
      hasPasswordField: Boolean(passwordInput),
      hasLoginForm: Boolean(loginForm),
      titleLooksLikeLogin:
        title.includes('login') ||
        title.includes('iniciar') ||
        title.includes('sesión') ||
        title.includes('sesion'),
      bodyMentionsLogin:
        bodyText.includes('iniciar sesión') ||
        bodyText.includes('iniciar sesion') ||
        bodyText.includes('olvide mi contraseña') ||
        bodyText.includes('olvidé mi contraseña'),
    };
  });

  return (
    (loginIndicators.hasPasswordField && loginIndicators.hasLoginForm) ||
    loginIndicators.titleLooksLikeLogin ||
    (loginIndicators.hasPasswordField && loginIndicators.bodyMentionsLogin)
  );
}

async function waitForStudentContent(page: Page): Promise<void> {
  const selectors = [
    'table tbody tr',
    '.table tbody tr',
    '#tabla_alumnos tbody tr',
    '#tabla-alumnos tbody tr',
    '.dataTable tbody tr',
    '[class*="alumno"]',
    '[class*="estudiante"]',
    '.card img[src*="foto"]',
    'img[src*="foto"]',
  ];

  for (const selector of selectors) {
    try {
      await page.waitForSelector(selector, { timeout: 8000 });
      return;
    } catch {
      // Try next selector.
    }
  }

  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
}

async function scrapeStudentsFromPage(page: Page): Promise<ScrapedStudent[]> {
  const baseUrl = page.url();

  return page.evaluate(
    ({ controlPatternSource, pageBaseUrl }) => {
      const controlPattern = new RegExp(controlPatternSource);
      const seen = new Set<string>();
      const students: ScrapedStudent[] = [];

      const resolve = (src: string | null | undefined): string | null => {
        if (!src || src.trim() === '' || src.startsWith('data:')) return null;
        try {
          return new URL(src, pageBaseUrl).href;
        } catch {
          return null;
        }
      };

      const pickName = (textParts: string[], controlNumber: string): string => {
        const candidates = textParts
          .map((part) => part.replace(/\s+/g, ' ').trim())
          .filter(
            (part) =>
              part.length > 2 &&
              part !== controlNumber &&
              !controlPattern.test(part) &&
              !/^\d+$/.test(part) &&
              !/^(foto|imagen|ver|detalle|acciones?)$/i.test(part),
          );

        candidates.sort((a, b) => b.length - a.length);
        return candidates[0] ?? '';
      };

      const addStudent = (name: string, controlNumber: string, photoUrl: string | null) => {
        const normalizedName = name.replace(/\s+/g, ' ').trim();
        const normalizedControl = controlNumber.trim();

        if (!normalizedControl || seen.has(normalizedControl)) return;
        if (!normalizedName) return;

        seen.add(normalizedControl);
        students.push({
          name: normalizedName,
          controlNumber: normalizedControl,
          photoUrl,
        });
      };

      const rowSelectors = [
        'table tbody tr',
        '.table tbody tr',
        '#tabla_alumnos tbody tr',
        '#tabla-alumnos tbody tr',
        '.dataTable tbody tr',
        'table tr',
      ];

      for (const rowSelector of rowSelectors) {
        const rows = Array.from(document.querySelectorAll<HTMLTableRowElement>(rowSelector));
        if (rows.length === 0) continue;

        for (const row of rows) {
          const cells = Array.from(row.querySelectorAll('td, th'));
          if (cells.length === 0) continue;

          const rowText = row.innerText ?? '';
          const controlMatch = rowText.match(controlPattern);
          if (!controlMatch) continue;

          const controlNumber = controlMatch[1];
          const img =
            row.querySelector<HTMLImageElement>('img[src*="foto"]') ??
            row.querySelector<HTMLImageElement>('img[src*="Foto"]') ??
            row.querySelector<HTMLImageElement>('img[src*="alumno"]') ??
            row.querySelector<HTMLImageElement>('img');

          const photoUrl = resolve(img?.getAttribute('src') ?? img?.src ?? null);
          const textParts = cells.flatMap((cell) => (cell as HTMLElement).innerText.split('\n'));
          const name = pickName(textParts, controlNumber);

          addStudent(name, controlNumber, photoUrl);
        }

        if (students.length > 0) break;
      }

      if (students.length === 0) {
        const cardSelectors = [
          '[class*="alumno"]',
          '[class*="estudiante"]',
          '.card',
          '.panel',
          '.list-group-item',
        ];

        for (const cardSelector of cardSelectors) {
          const cards = Array.from(document.querySelectorAll(cardSelector));
          for (const card of cards) {
            const cardText = (card as HTMLElement).innerText ?? '';
            const controlMatch = cardText.match(controlPattern);
            if (!controlMatch) continue;

            const controlNumber = controlMatch[1];
            const img =
              card.querySelector<HTMLImageElement>('img[src*="foto"]') ??
              card.querySelector<HTMLImageElement>('img[src*="Foto"]') ??
              card.querySelector<HTMLImageElement>('img');

            const photoUrl = resolve(img?.getAttribute('src') ?? img?.src ?? null);
            const textParts = cardText.split('\n');
            const name = pickName(textParts, controlNumber);

            addStudent(name, controlNumber, photoUrl);
          }

          if (students.length > 0) break;
        }
      }

      return students;
    },
    {
      controlPatternSource: CONTROL_NUMBER_PATTERN.source,
      pageBaseUrl: baseUrl,
    },
  );
}

function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;

    const request = client.get(url, (response) => {
      if (
        response.statusCode &&
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers.location
      ) {
        downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }

      const fileStream = fs.createWriteStream(destPath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      fileStream.on('error', reject);
    });

    request.on('error', reject);
  });
}

async function downloadPhotos(
  page: Page,
  students: Student[],
): Promise<Student[]> {
  if (!fs.existsSync(PHOTOS_DIR)) {
    fs.mkdirSync(PHOTOS_DIR, { recursive: true });
  }

  const updated: Student[] = [];

  for (const student of students) {
    const localPath = path.join('photos', `${student.controlNumber}.jpg`);
    const absolutePath = path.join(PHOTOS_DIR, `${student.controlNumber}.jpg`);

    if (!student.photoUrl) {
      updated.push({ ...student, photoUrl: localPath });
      console.warn(`⚠ No photo URL for ${student.controlNumber}, skipping download`);
      continue;
    }

    try {
      const cookies = await page.context().cookies(student.photoUrl);
      const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');

      await page.request.get(student.photoUrl, {
        headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
      }).then(async (response) => {
        if (!response.ok()) {
          throw new Error(`HTTP ${response.status()}`);
        }
        const buffer = await response.body();
        fs.writeFileSync(absolutePath, buffer);
      });

      updated.push({ ...student, photoUrl: localPath });
      console.log(`  ↳ Photo saved: ${localPath}`);
    } catch {
      try {
        await downloadFile(student.photoUrl, absolutePath);
        updated.push({ ...student, photoUrl: localPath });
        console.log(`  ↳ Photo saved: ${localPath}`);
      } catch (downloadError) {
        console.warn(
          `⚠ Could not download photo for ${student.controlNumber}: ${
            downloadError instanceof Error ? downloadError.message : downloadError
          }`,
        );
        updated.push({ ...student, photoUrl: student.photoUrl });
      }
    }
  }

  return updated;
}

async function getOrCreatePage(browser: Browser): Promise<Page> {
  const contexts = browser.contexts();
  const context = contexts[0] ?? (await browser.newContext());
  const pages = context.pages();
  return pages[0] ?? (await context.newPage());
}

async function main(): Promise<void> {
  let browser: Browser | undefined;

  try {
    browser = await chromium.connectOverCDP(CDP_URL);
  } catch {
    console.error(
      'Could not connect to Chrome on port 9222. Start Chrome with remote debugging enabled.',
    );
    process.exit(1);
  }

  try {
    const page = await getOrCreatePage(browser);

    console.log(`Navigating to ${TARGET_URL}`);
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await waitForStudentContent(page);

    if (await isSessionExpired(page)) {
      console.error('Please log in to SIITEC first in your Chrome browser');
      process.exit(1);
    }

    const scraped = await scrapeStudentsFromPage(page);

    if (scraped.length === 0) {
      const pageTitle = await page.title();
      console.error(`No students found. Page title: "${pageTitle}"`);
      console.error('The page structure may differ from expected selectors. Inspect the DOM and update scrape.ts.');
      process.exit(1);
    }

    const students: Student[] = scraped.map((student) => ({
      name: student.name,
      controlNumber: student.controlNumber,
      photoUrl: resolveUrl(page.url(), student.photoUrl) ?? '',
    }));

    console.log(`\nFound ${students.length} student(s). Downloading photos...\n`);

    for (const student of students) {
      console.log(`✓ Scraped: ${student.name} - ${student.controlNumber}`);
    }

    const studentsWithLocalPhotos = await downloadPhotos(page, students);

    fs.writeFileSync(
      OUTPUT_FILE,
      JSON.stringify(studentsWithLocalPhotos, null, 2),
      'utf-8',
    );

    console.log(`\nSaved ${studentsWithLocalPhotos.length} students to ${OUTPUT_FILE}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main().catch((error) => {
  console.error('Scraper failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
