import { BaseElement } from "wc-ssr/client";
import { template } from "./template";

export class PassingStateAsPropsPage extends BaseElement {
  count = 0;
  state = {
    title: "",
  };
  constructor() {
    super();
  }

  static get properties() {
    return {
      article: {},
    };
  }

  handleOnClick = () => {
    this.count++;
    this.setState({ title: `${this.count}` });
  };

  render() {
    return template({
      title: this.state.title,
      handleOnClick: this.handleOnClick,
    });
  }
}

customElements.define("passing-state-as-props-page", PassingStateAsPropsPage);
