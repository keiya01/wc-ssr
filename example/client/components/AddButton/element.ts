import { BaseElement } from "wc-ssr/client";
import { template } from "./template";

export class AddButton extends BaseElement {
  constructor() {
    super();
  }

  static get properties() {
    return {
      title: {},
    };
  }

  render() {
    return template({
      title: this.props.title,
      onClick: this.props.onClick,
    });
  }
}

customElements.define("add-button", AddButton);
