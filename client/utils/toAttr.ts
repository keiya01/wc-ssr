export type AttrProps = Record<string, string>;

export const toAttr = (obj: AttrProps) => {
  return Object.keys(obj).reduce((attrs, key) => {
    return `${attrs} ${key}=${obj[key]}`;
  }, '');
};
