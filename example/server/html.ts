export type Headers = {
  heads?: string[];
  styles?: string[];
  scripts?: string[];
};

export const html = (body: string, { heads, styles, scripts }: Headers) => {
  return [
    "<!DOCTYPE html>",
    '<html lang="ja">',
    "<head>",
    '<meta charset="UTF-8">',
    heads ? heads.join("") : "",
    '<link rel="stylesheet" href="/dist/client/main.css">',
    styles
      ? styles
          .map((style) => `<link rel="stylesheet" href="${style}">`)
          .join("")
      : "",
    "<title>Declarative Shadow DOM</title>",
    scripts
      ? scripts
          .map(
            (script) => `<script defer type="module" src="${script}"></script>`
          )
          .join("")
      : "",
    "</head>",
    "<body>",
    body,
    "</body>",
    "</html>",
  ].join("");
};
