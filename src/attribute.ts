export const ATTRIBUTE_EVENT = 1;
export const ATTRIBUTE_PROPS = 2;

export type EventHandler = () => void;

export type EventObject = {
  type: typeof ATTRIBUTE_EVENT;
  eventName: string;
  handler?: EventHandler;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type BaseProps = Record<string, any>;

export type PropsObject = {
  type: typeof ATTRIBUTE_PROPS;
  props: BaseProps;
};

export type AttributeResult = EventObject | PropsObject;

export const hasProperties = <T extends Record<string, unknown>>(
  value: unknown,
  keys: (keyof T)[]
): value is T =>
  typeof value === "object" &&
  !!value &&
  keys.every((key) => Object.prototype.hasOwnProperty.call(value, key));

export const isEvent = (value: unknown): value is EventObject =>
  hasProperties<EventObject>(value, ["type", "eventName", "handler"]) &&
  value.type === ATTRIBUTE_EVENT &&
  !!value.eventName;

// TODO: イベントは`data-wc-ssr-event=EVENT_NUMBER`のようにマークをつけておいて後から`EVENT_NUMBER`のイベントをその要素に追加すれば良いのでは？
export const $event = (
  eventName: string,
  handler?: EventHandler
): AttributeResult => ({
  type: ATTRIBUTE_EVENT,
  eventName,
  handler,
});

export const isProps = (value: unknown): value is PropsObject =>
  hasProperties<PropsObject>(value, ["type", "props"]) &&
  value.type === ATTRIBUTE_PROPS &&
  !!value.props;

export const $props = <Props extends BaseProps>(
  props: Props
): AttributeResult => ({
  type: ATTRIBUTE_PROPS,
  props,
});
