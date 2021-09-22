/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useRef } from "react";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { useUntilDestroyed } from "../use-until-destroyed/use-until-destroyed";

export function createEffect<T>(
  factoryFn: (source: Observable<T>) => Observable<unknown>,
) {
  return function (destroyed$: Observable<boolean>) {
    const subject = new Subject<T>();

    factoryFn(subject.asObservable()).pipe(takeUntil(destroyed$)).subscribe();

    return function (value: T) {
      subject.next(value);
    };
  }
}

export function useComponentEffects<R extends Effect$[]>(effects: R): ReturnTypes<R>;
export function useComponentEffects<R extends Effect$>(effect: R): ReturnType<R>;
export function useComponentEffects(effects: Effect$[] | Effect$): any {
  const { destroyed } = useUntilDestroyed();
  const result = useRef<any>([]);

  useMemo(() => {
    const toArray = Array.isArray(effects) ? effects : [effects];

    toArray.forEach((e, i) => result.current[i] = e(destroyed));

    return result.current;
  }, [destroyed, effects]);

  return Array.isArray(effects) ? result.current as unknown : result.current[0];
}


type Effect$ = (destroyed$: Observable<boolean>) => (value: any) => void;
type ReturnTypes<T extends Effect$[]> = { [P in keyof T]: T[P] extends (...args: any) => infer R ? R : never };