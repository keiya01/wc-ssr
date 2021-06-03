const validCustomElementName =
    "[-.0-9_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}]";
const validCustomElementRegExp = new RegExp(
  `[a-z]${validCustomElementName}*-${validCustomElementName}*`,
  "u"
);

// https://html.spec.whatwg.org/multipage/custom-elements.html#valid-custom-element-name
export const isCustomElement = (tagname: string): boolean => {
  if (!tagname) {
    return false;
  }
  return validCustomElementRegExp.test(tagname.toLowerCase());
};
