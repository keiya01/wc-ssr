import { html } from "wc-ssr";

type Props = {
  article: string;
};

export const template = ({ article }: Props) => html`
  <simple-page>
    <template shadowroot="open">
      <article>
        <h2>Article</h2>
        <p>${article}</p>
      </article>
    </template>
  </simple-page>
`;
