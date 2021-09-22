# React RxJS

<p align="center">
 <img width="20%" height="20%" src="logo.png">
</p>

> "Plug and play" for RxJS Observables in React Apps!


```bash
npm install @ngneat/react-rxjs
```

## useObservable

Ever had an Observable holding data that you need to maintain in the state of your React App? This hook bridges that gap.

It receives an Observable, subscribes to it, and stores the current version in a react state, ensuring that it persists between re-renders.

Note that you can use it multiple times, with various Observables.

```tsx
import { interval } from 'rxjs';
import { take } from 'rxjs/operators';
import { useObservable } from '@ngneat/react-rxjs';

const interval$ = interval(1000);

function CounterComponent() {
  const [counter] = useObservable(interval$);
  const [counter, { error, completed, subscription }] = useObservable(interval$.pipe(take(3)));

  return <h1>{counter}</h1>;
}
```

`useObservable` can take the initial value as the second parameter - `useObservable(source$, initialValue)`. If the source fires synchronously immediately (like in a `BehaviorSubject`), the value will be used as the initial value.


## useUntilDestroyed

The `useUntilDestroyed` hook returns an object with two properties:

- `untilDestroyed`: An operator that unsubscribes from the `source` when the component is destroyed.

- `destroyed` - An observable that emits when the component is destroyed.


```ts
import { interval } from 'rxjs';
import { useUntilDestroyed } from '@ngneat/react-rxjs';

function CounterComponent() {
  const { untilDestroyed } = useUntilDestroyed();

  useEffect(() => {
    interval(1000).pipe(untilDestroyed()).subscribe(console.log)
  }, [])

  return ...;
}
```

## useEffect$
The `useEffect$` hook receives a function that returns an observable, subscribes to it, and unsubscribes when the component destroyed:

```ts
import { useEffect$ } from '@ngneat/react-rxjs';

function fetchTodo() {
  return fromFetch('todos').pipe(tap({
    next(todos) {
      updateStore(todos);
    }
  }));
}

function TodosComponent() {
  const [todos] = useObservable(todos$);

  useEffect$(() => fetchTodo());

  return <>{todos}</>;
}
```

## useComponentEffects
To use an effect we first need to create it by using the `createEffect` function:

```ts
import { createEffect } from '@ngneat/react-rxjs';

export const searchTodoEffect = createEffect((searchTerm$: Observable<string>) => {
  return searchTerm$.pipe(
    debounceTime(300),
    switchMap((searchTerm) => fetchTodos({ searchTerm })),
  );
});
```

Now we can register it in our component, and call it when we need:

```ts
import { useComponentEffects$ } from '@ngneat/react-rxjs';

function SearchComponent() {
  const searchTodo = useComponentEffects(searchTodoEffect);

  return <input onChange={({ target: { value } }) => searchTodo(value)} />
}
```

We can pass multiple effects.


<div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>