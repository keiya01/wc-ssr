import { BaseElement } from "../../../declarativeShadowDom/baseElement";
import { template } from "./template";

export class AddButton extends BaseElement {
  count = 0;
  constructor() {
    super();

    this.addEventListener('click', () => {
      this.count++;
      this.setAttribute('title', `${this.count}`);
    });
  }

  static get properties() {
    return {
      title: {},
    }
  }

  render() {
    return template({ title: this.getAttribute('title')! });
  }
}

customElements.define('add-button', AddButton);
