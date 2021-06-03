import { BaseElement } from "wc-ssr/client";
import { template, Props } from "./template";

export class TodoItem extends BaseElement<Props> {
  render() {
    return template({
      todo: this.props.todo,
      handleToggleCheck: this.props.handleToggleCheck,
    });
  }
}

customElements.define("todo-item", TodoItem);
