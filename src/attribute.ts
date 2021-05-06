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

export const isEvent = (value: unknown): value is EventObject => {
  if (typeof value !== "object" || !value) {
    return false;
  }
  const hasProperty = Object.prototype.hasOwnProperty.bind(value);
  const isEventObject =
    hasProperty("type") && hasProperty("eventName") && hasProperty("handler");
  if (!isEventObject) {
    return false;
  }
  const eventObj = value as EventObject;
  return eventObj.type === ATTRIBUTE_EVENT && !!eventObj.eventName;
};

// TODO: イベントは`data-wc-ssr-event=EVENT_NUMBER`のようにマークをつけておいて後から`EVENT_NUMBER`のイベントをその要素に追加すれば良いのでは？
export const $event = (
  eventName: string,
  handler?: EventHandler
): AttributeResult => ({
  type: ATTRIBUTE_EVENT,
  eventName,
  handler,
});

export const isProps = (value: unknown): value is PropsObject => {
  if (typeof value !== "object" || !value) {
    return false;
  }
  const hasProperty = Object.prototype.hasOwnProperty.bind(value);
  const isPropsObject = hasProperty("type") && hasProperty("props");
  if (!isPropsObject) {
    return false;
  }
  const propsObj = value as PropsObject;
  return propsObj.type === ATTRIBUTE_PROPS && !!propsObj.props;
};

export const $props = <Props extends BaseProps>(
  props: Props
): AttributeResult => ({
  type: ATTRIBUTE_PROPS,
  props,
});
