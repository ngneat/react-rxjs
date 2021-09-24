import { DependencyList, useRef, useEffect, SyntheticEvent } from 'react';
import { Observable, Subscription, Subject, fromEvent } from 'rxjs';

export function useFromEvent<Event extends SyntheticEvent, T = Event extends SyntheticEvent<infer Element> ? Element : unknown>(
  eventName: string,
  action$: (event$: Observable<Event>) => Observable<unknown>,
  { deps }: { deps: DependencyList } = { deps: [] }
) {
  const action = useRef(action$);
  const eleRef = useRef<T>(null);

  useEffect(() => {
    let subscription: Subscription | null = new Subscription();
    let subject: Subject<Event> | null = null;

    if (eleRef.current) {
      subject = new Subject<Event>();
      subscription.add(action.current(subject.asObservable()).subscribe());

      subscription.add(fromEvent(eleRef.current as unknown as Element, eventName).subscribe(v => {
        subject?.next(v as unknown as Event)
      }));
    }

    return () => {
      subscription?.unsubscribe();
      subscription = null;
      subject = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eleRef.current, ...deps, eventName]);

  return { ref: eleRef }
}