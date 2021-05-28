import { template, Todo } from "../../components/TodoPage";

export const todos: Todo[] = [
  { id: 0, text: "todo1", isChecked: false },
  { id: 1, text: "todo2", isChecked: false },
  { id: 2, text: "todo3", isChecked: true },
  { id: 3, text: "todo4", isChecked: false },
  { id: 4, text: "todo5", isChecked: true },
];

const checkedTodos = todos.filter((todo) => todo.isChecked);
const nonCheckedTodos = todos.filter((todo) => !todo.isChecked);

export const getServerSideProps = async () => {
  return template({ todos, checkedTodos, nonCheckedTodos });
};
