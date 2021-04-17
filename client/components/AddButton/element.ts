export class AddButton extends HTMLElement {
  constructor() {
    super();

    // @ts-ignore
    const internals = this.attachInternals();

    let shadow = internals.shadowRoot;
    if(!shadow) {
      throw new Error('Declarative Shadow DOM is not supported in your browser.');
    }

    shadow.firstElementChild.addEventListener('click', () => {
      console.log("CLICKED!!!!");
    });
  }
}

customElements.define('add-button', AddButton);
