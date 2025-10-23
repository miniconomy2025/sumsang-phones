import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { usePollingFetch } from './usePollingFetch';

vi.useFakeTimers();

describe('usePollingFetch', () => {
  afterEach(() => {
    vi.clearAllTimers();
    vi.restoreAllMocks();
  });

  it('starts with loading=true and data/error null', () => {
    const fetcher = vi.fn();
    const { result } = renderHook(() => usePollingFetch(fetcher));

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('sets data correctly on successful fetch', async () => {
    const mockData = { foo: 'bar' };
    const fetcher = vi.fn().mockResolvedValue(mockData);

    let result;
    await act(async () => {
      const hook = renderHook(() => usePollingFetch(fetcher));
      result = hook.result;
      // wait a tick for async effect
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('sets error on failed fetch initially', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('Failed'));
    let result;

    await act(async () => {
      const hook = renderHook(() => usePollingFetch(fetcher));
      result = hook.result;
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('Failed');
  });

  it('retries after interval on failure', async () => {
    const fetcher = vi.fn();
    fetcher
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockResolvedValueOnce({ success: true });

    let result;
    await act(async () => {
      const hook = renderHook(() => usePollingFetch(fetcher, 1000));
      result = hook.result;
      await Promise.resolve(); // first tick
    });

    expect(result.current.error).toBe('Fail 1');

    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve(); // let second fetch resolve
    });

    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual({ success: true });
  });

  it('clears interval on unmount', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true });
    const clearSpy = vi.spyOn(global, 'clearInterval');

    let hook;
    await act(async () => {
      hook = renderHook(() => usePollingFetch(fetcher, 1000));
    });

    act(() => {
      hook.unmount();
    });

    expect(clearSpy).toHaveBeenCalled();
  });
});
