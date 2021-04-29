import { getInternalShadowRoot } from "../../utils/getInternalShadowRoot";

export class AddButton extends HTMLElement {
  constructor() {
    super();

    const shadow = getInternalShadowRoot(this);
    if(!shadow) {
      throw new Error('Declarative Shadow DOM is not supported in your browser.');
    }

    this.addEventListener('click', () => {
      console.log("CLICKED!!!!");
    });
  }
}

customElements.define('add-button', AddButton);
