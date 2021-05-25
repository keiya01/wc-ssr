import { BaseElement } from "wc-ssr/client";
import { template, Props, Todo } from "./template";

type State = {
  todos: Todo[];
  todo: Todo;
};

let todoID = 0;

export class TodoPage extends BaseElement<Props, State> {
  state = {
    todos: [] as Todo[],
    todo: {
      id: 0,
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
    todoID = this.props.todos.slice(-1)[0].id + 1;
    this.setState({
      todos: this.props.todos,
      todo: { ...this.state.todo, id: todoID },
    });
  }

  handleAddTodo = () => {
    todoID++;
    this.setState({
      todos: [...this.state.todos, this.state.todo],
      todo: { id: todoID, text: "", isChecked: false },
    });
  };

  handleChangeTodo = (e?: InputEvent) => {
    const target = e?.target as HTMLInputElement;
    if (target) {
      this.setState({ todo: { ...this.state.todo, text: target.value } });
    }
  };

  handleToggleCheck = (id: number) => () => {
    this.setState({
      todos: this.state.todos.map((todo) => ({
        ...todo,
        isChecked: id === todo.id ? !todo.isChecked : todo.isChecked,
      })),
    });
  };

  render() {
    return template({
      todos: this.state.todos || [],
      text: this.state.todo.text,
      handleAddTodo: this.handleAddTodo,
      handleChangeTodo: this.handleChangeTodo,
      handleToggleCheck: this.handleToggleCheck,
    });
  }
}

customElements.define("todo-page", TodoPage);
