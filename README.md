# wc-ssr

**NOTE: This library is EXPERIMENTAL.**

`wc-ssr` is a simple Server Side Rendering Library with `Web Components`.

## Installation

```sh
npm install wc-ssr
```

**or**

```sh
yarn add wc-ssr
```

## Example

```ts
// client/AddButton/template.ts

import { html, $props, $event } from "wc-ssr";

type Props = {
  title: string;
  onClick?: () => void;
};

export const template = (props: Props) => html`
  ${/* You can pass props with `$props()`. */}
  <add-button ${$props(props)}>
    <template shadowroot="open">
      ${/* You can add event with `$event()`. */}
      <button type="button" ${$event("click", props.onClick)}>
        ${props.title}
      </button>
    </template>
  </add-button>
`;

```

```ts
// client/AddButton/element.ts

import { BaseElement } from "wc-ssr/client";
import { template } from "./template";

export class AddButton extends BaseElement {
  constructor() {
    super();
  }

  render() {
    // `props` is injected to `this.props`.
    return template({
      title: this.props.title,
      onClick: this.props.onClick,
    });
  }
}

customElements.define("add-button", AddButton);
```

**NOTE: When you use SSR feature, you can not load `BaseElement` on the server. You must avoid loading `BaseElement` like [this example](https://github.com/keiya01/wc-ssr/blob/master/example/babel.config.js#L10-L17)**. This is because, `BaseElement` inherit `HTMLElement`.

```ts
// client/AddButton/index.ts

export { template } from "./template";
if (IS_CLIENT) {
  import(/* webpackMode: "eager" */ "./element");
}
```

```ts
// page.ts

import { html } from 'wc-ssr';
import { template as AddButton } from './client/AddButton';

export const renderPage = () => html`
  <div>
    <h1>Hello World!</h1>
    ${AddButton({ title: 'button', onClick: () => console.log('clicked!') })}
  </div>
  `;
}
```

```ts
// server.ts

import fastify, { FastifyInstance } from "fastify";
import { Server, IncomingMessage, ServerResponse } from "http";
import { htmlToString } from "wc-ssr";
import { renderPage } from './page';

type App = FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse,
>;

const start = async () => {
  const app = fastify();

  app.get("/example", async (req, reply) => {
    reply.header("Content-Type", "text/html; charset=utf-8");
    reply.send(`
      <DOCTYPE!>
      <html>
        <body>
          ${htmlToString(renderPage())}
        </body>
      </html>
    `);
    );
  });

  try {
    await app.listen(3000);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();

```

See detail in [example](https://github.com/keiya01/wc-ssr/tree/master/example).

## Usage

- [Styling](#Styling)
- [Props](#Props)
- [Event](#Event)
- [State](#State)
- [Attribute](#Attribute)
- [Lifecycle](#Lifecycle)
- [Hydration](#Hydration)
- [Server Side Rendering](#Server-Side-Rendering)

### Styling

You can use css with style tag.  
You can set style tag inside template tag.

```ts
import { html } from "wc-ssr";

const style = html`
  <style>
    button {
      color: red;
    }
  </style>
`;

const CustomButton = html`
  <custom-button>
    <template>
      ${style}
      <button type="button">button</button>
    </template>
  </custom-button>
`;
```

### Props

You can pass props to component. And you can get props to be injected from BaseElement class.

```ts
import { html } from "wc-ssr";
import { BaseElement } from "wc-ssr/client";

const CustomElement = html`
  <custom-element>
    <template>
      <h1>Hello World</h1>
      ${
        PassProps({
          text: "This is paragraph",
        }) /* Pass props to PassProps component */
      }
    </template>
  </custom-element>
`;

class CustomElement extends BaseElement {
  /* ... */
}

const PassProps = ({ text }) => html`
  <pass-props ${$props({ text }) /* Pass props to pass-props element */}>
    <template>
      <p>${text}</p>
    </template>
  </pass-props>
`;

class PassProps extends BaseElement {
  constructor() {
    super();
  }

  render() {
    return PassProps({ ...this.props });
  }
}
```

### Event

You can add event to element by using `$event` method.

```ts
const EventElement = ({ handleOnClick }) => html`
  <event-element>
    <template>
      <button type="button" ${$event("click", handleOnClick)}>click me</button>
    </template>
  </event-element>
`;

class EventElementClass extends BaseElement {
  constructor() {
    super();
  }

  handleOnClick = () => {
    console.log("Clicked!!");
  };

  render() {
    return EventElement({ handleOnClick: this.handleOnClick });
  }
}
```

### State

You can define state like React. If you defined state and change it, `render()` is executed.

```ts
import { html } from "wc-ssr";
import { BaseElement } from "wc-ssr/client";

type Props = {
  items: string[];
  text: string;
  handleOnChangeText: (e?: InputEvent) => void;
  addItem: () => void;
};

const DefineState = ({ items, text, handleOnChangeText, addItem }) => html`
  <define-state>
    <template>
      <ul>
        ${items.map((item) => html`<li>${item}</li>`)}
      </ul>
      <input
        type="text"
        value="${text || ""}"
        ${$event("input", handleOnChangeText)}
      />
      <button type="button" ${$event("click", addItem)}>add item</button>
    </template>
  </define-state>
`;

class DefineState extends BaseElement {
  constructor() {
    super();
    this.state = {
      items: [],
      text: [],
    };
  }

  addItem = () => {
    this.setState({ items: [...this.state.items, this.state.text] });
  };

  handleOnChangeText = (e?: InputEvent) => {
    const target = e?.target as HTMLInputElement;
    if (target) {
      this.setState({ text: target.value });
    }
  };

  render() {
    return DefineState({
      items: this.state.items,
      text: this.state.text,
      handleOnChangeText: this.handleOnChangeText,
      addItem: this.addItem,
    });
  }
}
```

### Attribute

_TODO_

### Lifecycle

You can use [web components lifecycle](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks) like below.

```ts
connectedCallback() {
  super.connectedCallback();
  console.log('connected!!');
}
```

And you can use additional lifecycle.

- `componentDidMount` ... This function is invoked when all preparation of `BaseElement` is completed.

```ts
componentDidMount() {
  super.componentDidMount();
  this.setState({ text: this.props.text });
}
```

### Hydration

Hydration is performed automatically by browser.

### Server Side Rendering

You can use `htmlToString` to render html on the server.

```ts
import { htmlToString, html } from "wc-ssr";

type Props = {
  text: string;
};

const render = ({ text }: Props) => html`
  <custom-element>
    <template>
      <h1>${text}</h1>
    </template>
  </custom-element>
`;

htmlToString(render({ text: "Hello World" }));
```
