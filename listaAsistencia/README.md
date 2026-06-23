# SIITEC Student Scraper

Scrapes student names, control numbers, and profile photos from a SIITEC **Mis Grupos** page using Playwright connected to your existing Chrome session (CDP).

## Prerequisites

- Node.js 18+
- Google Chrome with an active SIITEC login session

## Setup

```bash
npm install
```

## Usage

### 1. Close Chrome completely

Quit all Chrome windows so no instance is running.

### 2. Reopen Chrome with remote debugging

**Mac:**

```bash
open -a "Google Chrome" --args --remote-debugging-port=9222
```

**Windows:**

```bash
chrome.exe --remote-debugging-port=9222
```

**Linux:**

```bash
google-chrome --remote-debugging-port=9222
```

### 3. Log in to SIITEC manually

Open [SIITEC](https://siitec.colima.tecnm.mx/) and sign in with your credentials.

### 4. Navigate to the group URL

Open the group page (or leave it for the script to open):

```
https://siitec.colima.tecnm.mx/docencia/index.php/CMisgrupos/MisGrupos/?idgrupo=24675&id_periodo=106
```

### 5. Run the scraper

```bash
npx ts-node scrape.ts
```

Or:

```bash
npm run scrape
```

## Output

- **`students.json`** — array of students with local photo paths
- **`photos/`** — downloaded profile images named `{controlNumber}.jpg`

Example `students.json`:

```json
[
  {
    "name": "Juan Pérez García",
    "controlNumber": "21460001",
    "photoUrl": "photos/21460001.jpg"
  }
]
```

## Error messages

| Message | Meaning |
|---------|---------|
| `Please log in to SIITEC first in your Chrome browser` | Session expired or login page detected |
| `No students found. Page title: "..."` | Selectors did not match; check page title for debugging |
| `Could not connect to Chrome on port 9222` | Chrome is not running with `--remote-debugging-port=9222` |

## Selectors

The scraper uses flexible selectors common on SIITEC docencia pages:

- Table rows: `table tbody tr`, `.table tbody tr`, `#tabla_alumnos`, `.dataTable`
- Card layouts: `[class*="alumno"]`, `[class*="estudiante"]`, `.card`, `.panel`
- Photos: `img[src*="foto"]`, fallback to any `img` in the row
- Control numbers: 8–10 digit pattern (e.g. `21460001`)

If your group page layout differs, update the selectors in `scrape.ts`.

## Build (optional)

```bash
npm run build
node dist/scrape.js
```
