export const html = (body: string, scripts: string[]) => {
  return [
    '<!DOCTYPE html>',
    '<html lang="ja">',
    '<head>',
    '<meta charset="UTF-8">',
    '<title>Declarative Shadow DOM</title>',
    scripts.map((script) => `<script defer type="module" src="${script}"></script>`).join(''),
    '</head>',
    '<body>',
    body,
    '</body>',
    '</html>',
  ].join('');
};
