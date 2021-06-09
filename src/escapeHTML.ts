const replacer = (char: string): string => {
  switch (char) {
    case "&":
      return "&amp;";
    case "<":
      return "&lt;";
    case ">":
      return "&gt;";
    case '"':
      return "&quot;";
    case "'":
      return "&#39;";
    default:
      return char;
  }
};

export const escapeHTML = (str: string): string => {
  return str.replace(/[<>"'&]/g, replacer);
};
