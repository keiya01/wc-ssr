import { BaseElement } from "wc-ssr/client";
import { template, Props } from "./template";

type State = {
  isOpenDialog: boolean;
};

export class InteractiveStyle extends BaseElement<Props, State> {
  state: State = { isOpenDialog: false };

  handleActivateDialog = () => {
    this.setState({ isOpenDialog: !this.state.isOpenDialog });
  };

  render() {
    return template({
      isOpenDialog: this.state.isOpenDialog,
      handleActivateDialog: this.handleActivateDialog,
    });
  }
}

customElements.define("interactive-style", InteractiveStyle);
