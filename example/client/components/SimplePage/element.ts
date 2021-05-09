import { BaseElement } from "wc-ssr/client";
import { template } from "./template";

export class SimplePage extends BaseElement {
  count = 0;
  state = {
    article: "",
  };
  constructor() {
    super();
  }

  static get properties() {
    return {
      article: {},
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.setState({ article: "Hello Client" });
  }

  render() {
    return template({
      article: this.state.article,
    });
  }
}

customElements.define("simple-page", SimplePage);
