import { BaseElement } from "wc-ssr/client";
import { template, Props, Todo } from "./template";

type State = {
  todos: Todo[];
  todo: Todo;
};

export class TodoPage extends BaseElement<Props, State> {
  state = {
    todos: [],
    todo: {
      text: "",
      isChecked: false,
    },
  };

  constructor() {
    super();
  }

  static get properties() {
    return {
      todos: { attribute: false },
    };
  }

  componentDidMount() {
    this.setState({ todos: this.props.todos });
  }

  handleAddTodo = () => {
    this.setState({
      todos: [...this.state.todos, this.state.todo],
      todo: { text: "", isChecked: false },
    });
  };

  handleChangeTodo = (e?: InputEvent) => {
    const target = e?.target as HTMLInputElement;
    if (target) {
      this.setState({ todo: { ...this.state.todo, text: target.value } });
    }
  };

  render() {
    console.log("render: ", this.state, this.props);
    return template({
      todos: this.state.todos || [],
      text: this.state.todo.text,
      handleAddTodo: this.handleAddTodo,
      handleChangeTodo: this.handleChangeTodo,
    });
  }
}

customElements.define("todo-page", TodoPage);
