import { html } from '../../../../wc-ssr/html';
import { template as AddButton } from '../AddButton';

type Props = {
  user: {
    name: string,
  } | null,
  article: string,
};

export const template = (props: Props) => html`
  <home-page>
    <template shadowroot="open">
      <div>
        <article>
          <h2>Article1</h2>
          <p>${props.article}</p>
          ${props.user && html`<span>Data: ${props.user.name}</span>`}
        </article>
        ${AddButton({ title: 'hey' })}
      </div>
    </template>
  </home-page>
`;
