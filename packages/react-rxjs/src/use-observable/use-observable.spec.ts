import { useObservable } from './use-observable';
import { renderHook, act } from '@testing-library/react-hooks';
import { interval, BehaviorSubject, of } from 'rxjs';
import { finalize, map, filter } from 'rxjs/operators';

jest.useFakeTimers();

describe('useObservable', () => {
    it('should support BehaviorSubject', () => {
        const query = new BehaviorSubject('init');
        const { result } = renderHook(() => useObservable(query));
        let [next] = result.current;

        expect(next).toBe('init');

        act(() => query.next('2'));

        [next] = result.current;
        expect(next).toBe('2');
    });

    it('should update every second', () => {
        const { result } = renderHook(() => useObservable(interval(1000), { initialValue: 0 }));
        let [next] = result.current;

        expect(next).toBe(0);

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        [next] = result.current;

        expect(next).toBe(0);

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        [next] = result.current;

        expect(next).toBe(1);
    });

    it('should return an error', () => {
        const { result } = renderHook(() => useObservable(of(1).pipe(map(error => {
            throw new Error('error');
        })), { initialValue: 0 }));

        const [next, { error, completed }] = result.current;

        expect(error).toEqual(new Error('error'));
        expect(next).toEqual(0);
        expect(completed).toEqual(false)
    })

    it('should unsubscribe', () => {
        const spy = jest.fn();

        const { result, unmount } = renderHook(() => useObservable(interval(1000).pipe(finalize(spy)), { initialValue: 0 }));

        // eslint-disable-next-line prefer-const
        let [next] = result.current;

        expect(next).toBe(0);

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        [next] = result.current;

        expect(next).toBe(0);

        unmount();
        expect(spy).toHaveBeenCalled();
    })

    it('should support a filter', () => {
      const query = new BehaviorSubject('');
      const query2 = query.asObservable().pipe(
        filter(x => x !== '')
      )

      const { result } = renderHook(() => useObservable(query2));

      act(() => query.next('2'));

      const [next] = result.current;
      expect(next).toBe('2');
    });
});
