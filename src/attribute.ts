import { PropertyKey } from "./properties";

export const ATTRIBUTE_EVENT = 1;
export const ATTRIBUTE_OBJECT = 2;

export type EventHandler = () => void;

export type AttributeResult =
| {
    type: typeof ATTRIBUTE_EVENT,
    eventName: string,
    handler?: EventHandler,
  }
| {
    type: typeof ATTRIBUTE_OBJECT,
    key: string,
    value: Record<PropertyKey, any>
  };

// TODO: イベントは`data-wc-ssr-event=EVENT_NUMBER`のようにマークをつけておいて後から`EVENT_NUMBER`のイベントをその要素に追加すれば良いのでは？
export const $event = (eventName: string, handler?: EventHandler): AttributeResult => ({
  type: ATTRIBUTE_EVENT,
  eventName,
  handler,
});

export const toAttr = (obj: Record<string, string>) => {
  return Object.keys(obj).reduce((attrs, key) => {
    return `${attrs} ${key}=${obj[key]}`;
  }, '');
};
