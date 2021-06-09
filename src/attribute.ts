import { TemplateResult } from "./html";
import {
  ATTRIBUTE_EVENT_TYPE,
  ATTRIBUTE_PROPS_TYPE,
  ATTRIBUTE_SHADOW_ROOT_TYPE,
} from "./symbols";
import { hasProperties } from "./utils";

export type EventHandler<E extends Event> = (ev?: E) => void;

export type EventObject<E extends Event> = {
  $$typeof: symbol;
  eventName: string;
  handler?: EventHandler<E>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BaseProps = Record<string, any>;

export type PropsObject = {
  $$typeof: symbol;
  props: BaseProps;
};

export type ShadowRootAttributeObject = {
  $$typeof: symbol;
  value: ShadowRootMode;
};

export type AttributeResult<E extends Event> =
  | ShadowRootAttributeObject
  | EventObject<E>
  | PropsObject;

export const isShadowRoot = (
  value: unknown
): value is ShadowRootAttributeObject =>
  hasProperties<ShadowRootAttributeObject>(value, ["$$typeof", "value"]) &&
  value.$$typeof === ATTRIBUTE_SHADOW_ROOT_TYPE &&
  !!value.value;

export const $shadowroot = <E extends Event>(
  value?: ShadowRootMode
): AttributeResult<E> => ({
  $$typeof: ATTRIBUTE_SHADOW_ROOT_TYPE,
  value: value || "open",
});

export const hasShadowRoot = (result: TemplateResult): boolean =>
  !!result.values.find((val) => isShadowRoot(val));

export const isEvent = <E extends Event>(
  value: unknown
): value is EventObject<E> =>
  hasProperties<EventObject<E>>(value, ["$$typeof", "eventName", "handler"]) &&
  value.$$typeof === ATTRIBUTE_EVENT_TYPE &&
  !!value.eventName;

export const $event = <E extends Event>(
  eventName: string,
  handler?: EventHandler<E>
): AttributeResult<E> => ({
  $$typeof: ATTRIBUTE_EVENT_TYPE,
  eventName,
  handler,
});

export const isProps = (value: unknown): value is PropsObject =>
  hasProperties<PropsObject>(value, ["$$typeof", "props"]) &&
  value.$$typeof === ATTRIBUTE_PROPS_TYPE &&
  !!value.props;

export const $props = <Props extends BaseProps, E extends Event>(
  props: Props
): AttributeResult<E> => ({
  $$typeof: ATTRIBUTE_PROPS_TYPE,
  props,
});
