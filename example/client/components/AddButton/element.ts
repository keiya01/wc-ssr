import { BaseElement } from "wc-ssr/client";
import { template } from "./template";

export class AddButton extends BaseElement {
  count = 0;
  constructor() {
    super();
  }

  static get properties() {
    return {
      title: {},
    };
  }

  handleOnClick = () => {
    this.count++;
    this.setAttribute("title", `${this.count}`);
  };

  render() {
    return template({
      title: this.getAttribute("title")!,
      onClick: this.handleOnClick,
    });
  }
}

customElements.define("add-button", AddButton);
