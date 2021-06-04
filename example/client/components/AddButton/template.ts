import { html, $props, $event, $shadowroot } from "wc-ssr";

type Props = {
  title: string;
  onClick?: () => void;
};

export const template = (props: Props) => html`
  <add-button ${$props(props)}>
    <template ${$shadowroot()}>
      <button type="button" ${$event("click", props.onClick)}>
        ${props.title}
      </button>
    </template>
  </add-button>
`;
