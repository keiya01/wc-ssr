export type TemplateResult = {
  strings: TemplateStringsArray,
  values: unknown[],
};

export const html = (strings: TemplateStringsArray, ...values: unknown[]) => {
  return { strings, values };
};

export const htmlToString = (result: TemplateResult) => {
  return result.strings.reduce((res, str, i) => {
    let val = result.values[i];
    if(isTemplateResult(val)) {
      val = htmlToString(val);
    }
    if(!val) {
      return res + str;
    }
    return res + str + val;
  }, '');
};

export const isTemplateResult = (obj: unknown): obj is TemplateResult => {
  if(obj && typeof obj === 'object') {
    const hasProperty = Object.prototype.hasOwnProperty.bind(obj);
    return hasProperty('strings') && hasProperty('values');
  }
  return false;
};

// TODO: check draft
export const isCustomElement = (tagname: string) => {
  return /\S\-\S/.test(tagname);
}
