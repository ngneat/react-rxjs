/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Observable, Subscription } from 'rxjs';
import { useEffect, useRef, useState } from 'react';

export function useObservable<T, E>(
  source$: Observable<T>,
  { initialValue }: { initialValue?: T | undefined } = {}
): [T, { error: E | undefined, completed: boolean, subscription: Subscription | undefined }] {
  const sourceRef$ = useRef<Observable<T>>(source$);
  const subscription = useRef<Subscription | undefined>();

  const emitsInitialSyncValue = initialValue === undefined;

  const [error, setError] = useState<E | undefined>();
  const [completed, setComplete] = useState<boolean>(false);

  const [next, setValue] = useState<T>(() => {
    if (emitsInitialSyncValue) {
      let firstValue: T | undefined = undefined;

      let subscription: Subscription | null = sourceRef$.current.subscribe(
        (v) => {
          firstValue = v;
        }
      );

      subscription.unsubscribe();
      subscription = null;

      return firstValue! as T;
    }

    return initialValue!;
  });

  useEffect(() => {
    const base = {
      error: setError,
      complete() {
        setComplete(true);
      },
    };
    subscription.current = sourceRef$.current.subscribe({
      next: setValue,
      ...base,
    });

    return () => {
      if (!subscription.current?.closed) {
        subscription.current?.unsubscribe();
      }
    };

  }, [emitsInitialSyncValue]);

  return [next, { error, completed, subscription: subscription.current }];
}
