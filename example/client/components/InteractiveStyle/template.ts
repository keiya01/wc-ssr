import { html, $props, $event, $shadowroot } from "wc-ssr";

const style = html`
  <style>
    :host {
      position: relative;
    }
    .open-dialog {
      display: flex;
    }
    .close-dialog {
      display: none;
    }
    .dialog {
      position: absolute;
      height: 300px;
      width: 500px;
      background-color: #eee;
      align-items: center;
      justify-content: center;
    }
  </style>
`;

export type Props = {
  isOpenDialog: boolean;
  handleActivateDialog?: () => void;
};

export const template = (props: Props) => {
  const dialogStateClassName = props.isOpenDialog
    ? "open-dialog"
    : "close-dialog";

  return html`
    <interactive-style ${$props(props)}>
      <template ${$shadowroot()}>
        ${style}
        <div>
          <button type="button" ${$event("click", props.handleActivateDialog)}>
            open menu
          </button>
          <div class="dialog ${dialogStateClassName}">
            <span>Hello World</span>
          </div>
        </div>
      </template>
    </interactive-style>
  `;
};
