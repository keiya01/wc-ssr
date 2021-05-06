import { BaseElement } from "wc-ssr/client";
import { template } from "./template";

export class HomePage extends BaseElement {
  count = 0;
  state = {
    title: "",
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
    this.setState({ article: "Hello World" });
  }

  handleOnClick = () => {
    this.count++;
    this.setState({ title: `${this.count}` });
  };

  render() {
    return template({
      user: null,
      article: this.state.article,
      title: this.state.title,
      handleOnClick: this.handleOnClick,
    });
  }
}

customElements.define("home-page", HomePage);
