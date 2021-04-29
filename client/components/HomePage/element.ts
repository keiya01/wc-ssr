import { getInternalShadowRoot } from "../../utils/getInternalShadowRoot";

export class HomePage extends HTMLElement {
  constructor() {
    super();

    const shadow = getInternalShadowRoot(this);
    if(!shadow) {
      throw new Error('Declarative Shadow DOM is not supported in your browser.');
    }
  }
}

customElements.define('home-page', HomePage);
