/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Observable, Subscription } from 'rxjs';
import { useEffect, useRef, useState, DependencyList, useMemo, useReducer } from 'react';

export function useObservable<T, E>(
  source$: Observable<T>,
  { deps = [], initialValue }: { deps?: DependencyList, initialValue?: T } = {}
): [T, { error: E | undefined, completed: boolean, subscription: Subscription | undefined }] {

  const sourceRef = useMemo(() => source$, deps);
  const subscription = useRef(new Subscription());
  const nextValue = useRef<T | undefined>(initialValue);
  const [error, setError] = useState();
  const [completed, setCompleted] = useState<boolean>(false);
  const emitsInitialSyncValue = initialValue === undefined;
  const [_, forceUpdate] = useReducer(x => x + 1, 0);

  useMemo(() => {
    if (emitsInitialSyncValue) {
      let subscription: Subscription | null = sourceRef.subscribe(v => {
        nextValue.current = v;
      });

      subscription.unsubscribe();
      subscription = null;
    }
  }, deps);

  useEffect(() => {
    let firstEmission = true;

    subscription.current = sourceRef.subscribe({
      next(value) {
        if (emitsInitialSyncValue && firstEmission) {
          firstEmission = false;
        } else {
          nextValue.current = value;
          forceUpdate();
        }
      },
      error: setError,
      complete: setCompleted.bind(null, true)
    })

    return () => {
      subscription?.current.unsubscribe();
    }
  }, deps);


  return [nextValue.current!, { error, completed, subscription: subscription.current }];
}