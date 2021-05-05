import { PropertyKey } from "./properties";

export const ATTRIBUTE_EVENT = 1;
export const ATTRIBUTE_OBJECT = 2;

export type EventHandler = () => void;

export type EventObject = {
  type: typeof ATTRIBUTE_EVENT;
  eventName: string;
  handler?: EventHandler;
};

export type AttributeResult =
  | EventObject
  | {
      type: typeof ATTRIBUTE_OBJECT;
      key: string;
      value: Record<PropertyKey, unknown>;
    };

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

export const toAttr = (obj: Record<string, unknown>): string => {
  return Object.keys(obj).reduce((attrs, key) => {
    return `${attrs} ${key}=${obj[key]}`;
  }, "");
};
