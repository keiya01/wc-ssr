import './element';
import { toAttr } from "../../../../wc-ssr/attribute";
import { html } from '../../../../wc-ssr/html';
import { $event } from '../../../../wc-ssr/attribute';

type Props = {
  title: string;
}

export const template = (props: Props) => html`
  <add-button ${toAttr(props)}>
    <template shadowroot="open">
      <button type="button" ${$event('click', () => {})}>${props.title}</button>
    </template>
  </add-button>
`;
