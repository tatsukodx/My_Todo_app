import Star from "./Star";
import type { Todo } from "./types";
import TodoItem from "./TodoItem";

type Props = {
  todos: Todo[];
  updateIsDone: (id: string, value: boolean) => void;
  updateDeadline: (id: string, deadline: Date | null) => void;
  remove: (id: string) => void;
  emptyMessage: string;
};

const TodoList = (props: Props) => {
  const todos = props.todos;

  if (todos.length === 0) {
    return (
      <div className="text-gray-500">
        <Star /> {props.emptyMessage}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          updateIsDone={props.updateIsDone}
          updateDeadline={props.updateDeadline}
          remove={props.remove}
        />
      ))}
    </div>
  );
};

export default TodoList;
