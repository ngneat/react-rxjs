
import { Observable, timer } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { render } from '@testing-library/react';
import { useEffect$ } from './use-effect';

jest.useFakeTimers();

describe('useEffect$', () => {
  const spy = jest.fn();
  const destroySpy = jest.fn();

  const source$ = timer(1000).pipe(
    tap(spy),
    finalize(destroySpy)
  )

  function FooComponent() {
    useEffect$(() => source$);

    return <div></div>
  }


  it('should register/unregister effects', () => {
    const { unmount } = render(<FooComponent />);

    jest.advanceTimersByTime(1000);

    expect(spy).toHaveBeenCalledTimes(1);

    unmount();

    expect(destroySpy).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  })
})