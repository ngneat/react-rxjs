<p align="center">
 <img width="20%" height="20%" src="logo.png">
</p>

> "Plug and play" for RxJS Observables in React Apps!

[![@ngneat/react-rxjs](https://github.com/ngneat/react-rxjs/actions/workflows/ci.yml/badge.svg)](https://github.com/ngneat/react-rxjs/actions/workflows/ci.yml)
![commitizen](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)
![PRs](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)
![coc-badge](https://img.shields.io/badge/codeof-conduct-ff69b4.svg?style=flat-square)
![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e5079.svg?style=flat-square]https://github.com/semantic-release/semantic-release)
![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square]https://github.com/prettier/prettier)


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

You can also pass a dependencies:

```tsx
import { useObservable } from '@ngneat/react-rxjs';

const SomeComponent = ({ id }: { id: string }) => {
  const [state] = useObservable(getStream$(id), { deps: [id] })

  return state;
}
```


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

function loadTodos() {
  return fromFetch('todos').pipe(tap({
    next(todos) {
      updateStore(todos);
    }
  }));
}

function TodosComponent() {
  const [todos] = useObservable(todos$);

  useEffect$(() => loadTodos());
  useEffect$(() => loadTodos(), deps);

  return <>{todos}</>;
}
```
## useFromEvent
It's the `fromEvent` observable, but with hooks:

```ts
export function App() {
  const [text, setText] = useState('');

  const { ref } = useFromEvent<ChangeEvent<HTMLInputElement>>('keyup', (event$) =>
    event$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      tap((event) => setText(event.target.value))
    )
  );

  return (
    <>
     <input ref={ref}>
     { text }
    </>
  )
```



<div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>