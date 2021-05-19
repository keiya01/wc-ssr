import { template, Todo } from "../../components/TodoPage";

export const todos: Todo[] = [
  { text: "todo1", isChecked: false },
  { text: "todo2", isChecked: false },
  { text: "todo3", isChecked: true },
  { text: "todo4", isChecked: false },
  { text: "todo5", isChecked: true },
];

export const getServerSideProps = async () => {
  return template({ todos });
};
