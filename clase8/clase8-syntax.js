/* Clase 8 · resaltado tipo Colab */
document.addEventListener("DOMContentLoaded", () => {
  const blocks = document.querySelectorAll('body[data-page="clase8"] .c8edu-code-card code');

  const PY_KEYWORDS = [
    "import","from","as","for","in","if","else","elif","return","try","except",
    "with","while","True","False","None","and","or","not","class","def","print"
  ];

  const BUILTINS = [
    "pd","StringIO","str","int","float","list","dict","set","tuple","len","range"
  ];

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function highlightPython(code) {
    const protectedTokens = [];

    function tokenName(index) {
      let name = "";
      let value = index;

      do {
        name = String.fromCharCode(65 + (value % 26)) + name;
        value = Math.floor(value / 26) - 1;
      } while (value >= 0);

      return name;
    }

    function protect(text, pattern, className, escaped = false) {
      return text.replace(pattern, (match) => {
        const token = `\uE000${tokenName(protectedTokens.length)}\uE001`;
        protectedTokens.push({ className, escaped, text: match, token });
        return token;
      });
    }

    let html = protect(code, /("""[\s\S]*?"""|'''[\s\S]*?'''|"[^"\n]*"|'[^'\n]*')/g, "tok-string");
    html = protect(html, /(#.*)$/gm, "tok-comment");
    html = escapeHtml(html);

    html = protect(html, /\b(\d+(\.\d+)?)\b/g, "tok-number", true);
    html = protect(html, /(\.[a-zA-Z_][a-zA-Z0-9_]*)/g, "tok-method", true);

    const kwPattern = new RegExp(`\\b(${PY_KEYWORDS.join("|")})\\b`, "g");
    html = protect(html, kwPattern, "tok-keyword", true);

    const builtinPattern = new RegExp(`\\b(${BUILTINS.join("|")})\\b`, "g");
    html = protect(html, builtinPattern, "tok-builtin", true);

    html = protect(html, /\b(head|info|sum|copy|replace|lower|strip|normalize|encode|decode|read_csv|to_csv|duplicated|drop_duplicates|dropna|fillna|median|unique|shape|dtypes|describe)\b/g, "tok-func", true);

    protectedTokens.forEach((item) => {
      const text = item.escaped ? item.text : escapeHtml(item.text);
      html = html.split(item.token).join(`<span class="${item.className}">${text}</span>`);
    });

    return html;
  }

  blocks.forEach(block => {
    if (block.dataset.syntaxApplied === "true") return;

    const raw = block.textContent;
    block.innerHTML = highlightPython(raw);
    block.dataset.syntaxApplied = "true";
    block.classList.add("is-python");
  });
});
