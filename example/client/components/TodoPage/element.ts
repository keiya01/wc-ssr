import { BaseElement } from "wc-ssr/client";
import { template, Props, Todo } from "./template";

type State = {
  todos: Todo[];
  checkedTodos: Todo[];
  nonCheckedTodos: Todo[];
  todo: Todo;
};

let todoID = 0;

export class TodoPage extends BaseElement<Props, State> {
  state = {
    todos: [] as Todo[],
    checkedTodos: [] as Todo[],
    nonCheckedTodos: [] as Todo[],
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
      checkedTodos: { attribute: false },
      nonCheckedTodos: { attribute: false },
      todo: { attribute: false },
    };
  }

  componentDidMount() {
    todoID = this.props.todos.slice(-1)[0].id + 1;
    this.setState({
      todos: this.props.todos,
      checkedTodos: this.props.checkedTodos,
      nonCheckedTodos: this.props.nonCheckedTodos,
      todo: { ...this.state.todo, id: todoID },
    });
  }

  handleAddTodo = () => {
    todoID++;
    this.setState({
      todos: [...this.state.todos, this.state.todo],
      nonCheckedTodos: [...this.state.nonCheckedTodos, this.state.todo],
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
    const nextTodos = this.state.todos.map((todo) =>
      todo.id === id ? { ...todo, isChecked: !todo.isChecked } : todo
    );
    const nonCheckedTodos = nextTodos.filter((todo) => !todo.isChecked);
    const checkedTodos = nextTodos.filter((todo) => todo.isChecked);
    this.setState({
      todos: nextTodos,
      nonCheckedTodos,
      checkedTodos,
    });
  };

  render() {
    return template({
      todos: this.state.todos || [],
      nonCheckedTodos: this.state.nonCheckedTodos || [],
      checkedTodos: this.state.checkedTodos || [],
      text: this.state.todo.text,
      handleAddTodo: this.handleAddTodo,
      handleChangeTodo: this.handleChangeTodo,
      handleToggleCheck: this.handleToggleCheck,
    });
  }
}

customElements.define("todo-page", TodoPage);
