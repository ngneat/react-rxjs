import { useObservable } from './use-observable';
import { renderHook, act } from '@testing-library/react-hooks';
import { interval, BehaviorSubject, of } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { useState } from 'react';
import { render, fireEvent } from '@testing-library/react';

jest.useFakeTimers();

const store = new BehaviorSubject('1');

function getStream$(id: string) {
    return of(id);
}

const SomeComponent = ({ id }: { id: string }) => {
    const [state] = useObservable(getStream$(id), { deps: [id] })

    return <p data-testid="p">{state}</p>
}

const OuterComponent = () => {
    const [id, setId] = useState('1');

    return <>
        <button data-testid="btn" onClick={() => setId('2')}>Change id</button>
        <SomeComponent id={id} />
    </>
}


describe('Deps change', () => {
    it('should subscribe to the new obseravble', () => {
        const { getByTestId } = render(<OuterComponent />);
        expect(getByTestId('p').innerHTML).toBe('1');
        fireEvent.click(getByTestId('btn'));
        expect(getByTestId('p').innerHTML).toBe('2');
    })
})

describe('useObservable', () => {

    beforeEach(() => jest.clearAllTimers());

    it('should update every second', () => {
        const { result } = renderHook(() => useObservable(interval(1000), { initialValue: -1 }));
        let [next] = result.current;

        expect(next).toBe(-1);

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
        }))));

        const [next, { error, completed }] = result.current;

        expect(error).toEqual(new Error('error'));
        expect(next).toEqual(undefined);
        expect(completed).toEqual(false)
    })


    it('should support BehaviorSubject', () => {
        const query = new BehaviorSubject('init');
        const { result } = renderHook(() => useObservable(query));
        let [next] = result.current;

        expect(next).toBe('init');

        act(() => query.next('2'));

        [next] = result.current;
        expect(next).toBe('2');
    });
    it('should unsubscribe', () => {
        const spy = jest.fn();

        const { result, unmount } = renderHook(() => useObservable(interval(1000).pipe(finalize(spy)), { initialValue: -1 }));

        // // eslint-disable-next-line prefer-const
        let [next] = result.current;

        expect(next).toBe(-1);

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        [next] = result.current;

        expect(next).toBe(0);

        unmount();
        expect(spy).toHaveBeenCalled();
    })
});