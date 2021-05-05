export interface ComplexAttributeConverter<Type = unknown, TypeHint = unknown> {
  // convert attribute to property.
  fromAttribute?(value: string | null, type?: TypeHint): Type;

  // convert property to attribute.
  // For https://github.com/WICG/trusted-types.
  toAttribute?(value: Type, type?: TypeHint): unknown;
}

type AttributeConverter<Type = unknown, TypeHint = unknown> =
  | ComplexAttributeConverter<Type>
  | ((value: string | null, type?: TypeHint) => Type);

export type HasChanged = (value: unknown, old: unknown) => boolean;

/**
 * refer from https://github.com/lit/lit/blob/2a6d8c66b099a851424776f6f387a39096e083b6/packages/reactive-element/src/reactive-element.ts#L111
 */
export type PropertyDeclaration<TypeHint = unknown> = {
  readonly type?: TypeHint;
  readonly attribute?: string | boolean;
  hasChanged?: HasChanged;
  readonly converter?: AttributeConverter;
};

export type PropertyKey = string | number | symbol;

export type Properties = Record<string, PropertyDeclaration>;
