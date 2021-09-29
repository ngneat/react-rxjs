import { finalize, tap } from 'rxjs/operators';
import { render, fireEvent } from '@testing-library/react';
import { ChangeEvent } from 'react';
import { useFromEvent } from './use-from-event';

describe('useFromEvent', () => {
  const spy = jest.fn();
  const destroySpy = jest.fn();

  function SearchComponent() {
    const { ref } = useFromEvent<ChangeEvent<HTMLInputElement>>('change', (event$) =>
      event$.pipe(
        tap(spy),
        finalize(destroySpy)
      )
    );

    return <input data-testid="input" ref={ref} />
  }


  it('should register the event', () => {
    const { getByTestId, unmount } = render(<SearchComponent />);

    fireEvent.change(getByTestId('input'));

    expect(spy).toHaveBeenCalledTimes(1);

    fireEvent.change(getByTestId('input'));

    expect(spy).toHaveBeenCalledTimes(2);

    unmount();

    expect(destroySpy).toHaveBeenCalledTimes(1);

  })
})