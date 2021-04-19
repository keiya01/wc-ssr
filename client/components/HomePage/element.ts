export class HomePage extends HTMLElement {
  constructor() {
    super();

    // @ts-ignore
    const internals = this.attachInternals();

    let shadow = internals.shadowRoot;
    if(!shadow) {
      throw new Error('Declarative Shadow DOM is not supported in your browser.');
    }
  }
}

customElements.define('home-page', HomePage);
