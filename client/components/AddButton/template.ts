import './element';
import { toAttr } from "../../utils/toAttr";
import { html } from '../../../declarativeShadowDom/html';

type Props = {
  title: string;
}

export const template = (props: Props) => html`
  <add-button ${toAttr(props)}>
    <template shadowroot="open">
      <button type="button">${props.title}</button>
    </template>
  </add-button>
`;
