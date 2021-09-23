import { useMemo, useRef, useEffect, DependencyList } from 'react';
import { Observable, Subscription } from 'rxjs';

export function useEffect$(sourceFactory$: () => Observable<unknown>, deps: DependencyList = []) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const $ = useMemo(() => sourceFactory$(), []);
  const sub = useRef<Subscription | undefined>();

  useEffect(() => {
    sub.current = $.subscribe();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return () => sub.current!.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [$, ...deps]);

  return sub.current;
}