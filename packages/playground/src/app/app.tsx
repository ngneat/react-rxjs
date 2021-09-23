import { createEffect, useComponentEffects, useEffect$, useObservable } from '@ngneat/react-rxjs';
import { interval, Observable } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';
import { fromFetch } from 'rxjs/fetch';
import { useState } from 'react';

const searchTodoEffect = createEffect((searchTerm$: Observable<string>) => {
  return searchTerm$.pipe(
    debounceTime(300),
    tap({
      next(v) {
        console.log(v);
      }
    })
  );
});

function SearchComponent() {
  const searchTodo = useComponentEffects(searchTodoEffect);

  return <input onChange={({ target: { value } }) => searchTodo(value)} />
}

function loadTodos() {
  return fromFetch<{ id: number }[]>('https://jsonplaceholder.typicode.com/todos', {
    selector: (response) => response.json(),
  }).pipe(
    tap({
      next(todos) {
        console.log(todos);
      },
    })
  );
}


const counter$ = interval(2000);

export function App() {
  const [show, setShow] = useState(true);
  const [sideEffect, setSideEffect] = useState(1)
  const [count] = useObservable(counter$, { initialValue: 0 });

  useEffect$(() => loadTodos(), [sideEffect]);

  return (
    <section>
      {count}
      <button onClick={() => setSideEffect(e => e + 1)}>sideEffect</button>
      <button onClick={() => setShow(show => !show)}>Toggle</button>
      {show && <SearchComponent />}
    </section>
  )
}

export default App;
