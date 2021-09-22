import { useUntilDestroyed } from './use-until-destroyed';
import { renderHook } from '@testing-library/react-hooks';
import { interval } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { useEffect } from 'react';

jest.useFakeTimers();

const spy = jest.fn();

function useTest() {

  const { untilDestroyed } = useUntilDestroyed();

  useEffect(() => {
    interval(1000).pipe(untilDestroyed(), finalize(spy)).subscribe();
  }, [untilDestroyed])
}

describe('useObservable', () => {
  it('should destroy', () => {
    const result = renderHook(() => useTest());
    result.unmount();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});