import { useMemo, useEffect } from 'react';
import { Subject, MonoTypeOperatorFunction } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export function useUntilDestroyed() {
  const subject = useMemo(() => new Subject<boolean>(), []);

  const data = useMemo(() => ({
    untilDestroyed<T>(): MonoTypeOperatorFunction<T> {
      return takeUntil(subject.asObservable());
    },
    destroyed: subject.asObservable()
  }), [subject]);

  useEffect(() => {
    return () => subject.next(true);
  }, [subject]);

  return data;
}