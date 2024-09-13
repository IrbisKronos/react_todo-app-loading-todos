/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useMemo, useState } from 'react';

import { Todo } from './types/Todo';
import * as todoServise from './api/todos';
import { Header, Footer, TodoList, ErrorNotification } from './components';

const filterTodos = (tasks: Todo[], filterCriteria: string) => {
  return tasks.filter(task => {
    const matchesStatus =
      filterCriteria === 'all' ||
      (filterCriteria === 'active' && !task.completed) ||
      (filterCriteria === 'completed' && task.completed);

    return matchesStatus;
  });
};

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setLoading(true);

    todoServise
      .getTodos()
      .then(setTodos)
      .catch(() => {
        setErrorMessage('Unable to load todos');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const getFilteredTodos = useMemo(() => {
    return filterTodos(todos, filter);
  }, [todos, filter]);

  function addTodo({ title, userId, completed }: Todo) {
    setLoading(true);

    todoServise
      .createTodo({ title, userId, completed })
      .then(newTodo => {
        setTodos(currentTodos => [...currentTodos, newTodo]);
      })
      .catch(() => {
        setErrorMessage('Unable to add todo');
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function updateTodo(updatedTodo: Todo) {
    setLoading(true);

    todoServise
      .updateTodo(updatedTodo)
      .then(todo => {
        setTodos(currentTodos => {
          const newTodo = [...currentTodos];
          const index = newTodo.findIndex(post => post.id === updatedTodo.id);
          newTodo.splice(index, 1, todo);

          return newTodo;
        });
      })
      .catch(() => {
        setErrorMessage('Unable to update a todo');
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function deleteTodo(todoId: number) {
    setLoading(true);

    todoServise
      .deleteTodo(todoId)
      .then(() => {
        setTodos(currentTodos =>
          currentTodos.filter(todo => todo.id !== todoId),
        );
      })
      .catch(() => {
        setErrorMessage('Unable to delete todo');
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const handleFilter = (filterType: string) => {
    setFilter(filterType);
  };

  const activeTodos = todos.filter(todo => !todo.completed).length || 0;

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header addTodo={addTodo} />

        <TodoList
          todos={getFilteredTodos}
          updateTodo={updateTodo}
          deleteTodo={deleteTodo}
        />

        {/* Hide the footer if there are no todos */}
        {!!todos.length && (
          <Footer
            handleFilter={handleFilter}
            filter={filter}
            todos={getFilteredTodos}
            deleteTodo={deleteTodo}
            activeTodos={activeTodos}
          />
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <ErrorNotification errorMessage={errorMessage} />
    </div>
  );
};
