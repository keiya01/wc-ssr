import { hasProperties } from "./utils";

export const ATTRIBUTE_EVENT = 1;
export const ATTRIBUTE_PROPS = 2;

// TODO: fix unknown type
export type EventHandler<E extends Event> = (ev?: E) => void;

export type EventObject<E extends Event> = {
  type: typeof ATTRIBUTE_EVENT;
  eventName: string;
  handler?: EventHandler<E>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BaseProps = Record<string, any>;

export type PropsObject = {
  type: typeof ATTRIBUTE_PROPS;
  props: BaseProps;
};

export type AttributeResult<E extends Event> = EventObject<E> | PropsObject;

export const isEvent = <E extends Event>(
  value: unknown
): value is EventObject<E> =>
  hasProperties<EventObject<E>>(value, ["type", "eventName", "handler"]) &&
  value.type === ATTRIBUTE_EVENT &&
  !!value.eventName;

export const $event = <E extends Event>(
  eventName: string,
  handler?: EventHandler<E>
): AttributeResult<E> => ({
  type: ATTRIBUTE_EVENT,
  eventName,
  handler,
});

export const isProps = (value: unknown): value is PropsObject =>
  hasProperties<PropsObject>(value, ["type", "props"]) &&
  value.type === ATTRIBUTE_PROPS &&
  !!value.props;

export const $props = <Props extends BaseProps, E extends Event>(
  props: Props
): AttributeResult<E> => ({
  type: ATTRIBUTE_PROPS,
  props,
});
