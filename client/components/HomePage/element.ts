import { BaseElement } from "../../../declarativeShadowDom/baseElement";
import { template } from "./template";

export class HomePage extends BaseElement {
  constructor() {
    super();
  }

  static get properties() {
    return {
      article: {},
    };
  }

  connectedCallback() {
    this.setAttribute('article', 'Hello World');
  }

  render() {
    return template({ user: null, article: this.getAttribute('article')! })
  }
}

customElements.define('home-page', HomePage);
