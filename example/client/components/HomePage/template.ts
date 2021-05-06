import { html } from "wc-ssr";
import { template as AddButton } from "../AddButton";

type Props = {
  user: {
    name: string;
  } | null;
  article: string;
  title?: string;
  handleOnClick?: () => void;
};

export const template = ({
  user,
  article,
  title,
  handleOnClick,
}: Props) => html`
  <home-page>
    <template shadowroot="open">
      <div>
        <article>
          <h2>Article1</h2>
          <p>${article}</p>
          ${user && html`<span>Data: ${user.name}</span>`}
        </article>
        ${AddButton({ title: title || "hey", onClick: handleOnClick })}
      </div>
    </template>
  </home-page>
`;
