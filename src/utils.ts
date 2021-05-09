export const hasProperties = <T extends Record<string, unknown>>(
  value: unknown,
  keys: (keyof T)[]
): value is T =>
  typeof value === "object" &&
  !!value &&
  keys.every((key) => Object.prototype.hasOwnProperty.call(value, key));
