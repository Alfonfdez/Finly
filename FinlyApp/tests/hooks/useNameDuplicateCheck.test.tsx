import { describe, it, expect, afterEach, vi, type Mock } from 'vitest';
import { renderHook, act } from '@testing-library/react-native';
import { useNameDuplicateCheck } from '../../src/hooks/useNameDuplicateCheck';
import { DEBOUNCE_MS } from '../../src/constants/types';

interface Options {
  existsByName: Mock<(name: string, excludeId?: number) => Promise<boolean>>;
  resolveDefaultEnglishName: Mock<(value: string) => string | null>;
}

function makeOptions(overrides: Partial<Options> = {}): Options {
  const existsByName: Options['existsByName'] = vi.fn(async () => false);
  const resolveDefaultEnglishName: Options['resolveDefaultEnglishName'] = vi.fn(() => null);
  return { existsByName, resolveDefaultEnglishName, ...overrides };
}

async function flushDebounce() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS + 10);
  });
}

describe('useNameDuplicateCheck', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  function renderWith(options: ReturnType<typeof makeOptions>) {
    return renderHook(() =>
      useNameDuplicateCheck({
        existsByName: options.existsByName,
        resolveDefaultEnglishName: options.resolveDefaultEnglishName,
        duplicateErrorKey: 'duplicate',
      })
    );
  }

  it('starts with no error and not checking', async () => {
    const options = makeOptions();
    const { result } = await renderWith(options);
    expect(result.current.nameError).toBeNull();
    expect(result.current.checkingName).toBe(false);
  });

  it('sets checking on change and clears the error once a valid, non-duplicate name settles', async () => {
    vi.useFakeTimers();
    const options = makeOptions();
    options.existsByName.mockResolvedValue(false);
    const { result } = await renderWith(options);

    const setName = vi.fn();
    await act(() => result.current.handleNameChange('Coffee', setName));

    expect(setName).toHaveBeenCalledWith('Coffee');
    expect(result.current.checkingName).toBe(true);
    expect(result.current.nameError).toBeNull();

    await flushDebounce();

    expect(result.current.checkingName).toBe(false);
    expect(result.current.nameError).toBeNull();
    expect(options.existsByName).toHaveBeenCalledWith('Coffee', undefined);
  });

  it('sets the duplicate error key when the exact name already exists', async () => {
    vi.useFakeTimers();
    const options = makeOptions();
    options.existsByName.mockResolvedValue(true);
    const { result } = await renderWith(options);

    await act(() => result.current.handleNameChange('Dup', vi.fn()));
    await flushDebounce();

    expect(result.current.nameError).toBe('duplicate');
    expect(result.current.checkingName).toBe(false);
  });

  it('checks the resolved default English name first when one exists', async () => {
    vi.useFakeTimers();
    const options = makeOptions();
    options.resolveDefaultEnglishName.mockReturnValue('Groceries');
    options.existsByName.mockResolvedValue(true);
    const { result } = await renderWith(options);

    await act(() => result.current.handleNameChange('Compra', vi.fn()));
    await flushDebounce();

    expect(options.existsByName).toHaveBeenCalledWith('Groceries', undefined);
    expect(result.current.nameError).toBe('duplicate');
  });

  it('settles the error to null when the English default does not exist', async () => {
    vi.useFakeTimers();
    const options = makeOptions();
    options.resolveDefaultEnglishName.mockReturnValue('Groceries');
    options.existsByName.mockResolvedValue(false);
    const { result } = await renderWith(options);

    await act(() => result.current.handleNameChange('Compra', vi.fn()));
    await flushDebounce();

    expect(options.existsByName).toHaveBeenCalledWith('Groceries', undefined);
    expect(result.current.nameError).toBeNull();
  });

  it('treats a rejected check as no duplicate (clears the error)', async () => {
    vi.useFakeTimers();
    const options = makeOptions();
    options.existsByName.mockRejectedValue(new Error('db down'));
    const { result } = await renderWith(options);

    await act(() => result.current.handleNameChange('Fail', vi.fn()));
    await flushDebounce();

    expect(result.current.nameError).toBeNull();
    expect(result.current.checkingName).toBe(false);
  });

  it('clearNameError clears the error', async () => {
    vi.useFakeTimers();
    const options = makeOptions();
    options.existsByName.mockResolvedValue(true);
    const { result } = await renderWith(options);

    await act(() => result.current.handleNameChange('Dup', vi.fn()));
    await flushDebounce();
    expect(result.current.nameError).toBe('duplicate');

    await act(() => result.current.clearNameError());
    expect(result.current.nameError).toBeNull();
  });

  it('respects an excludeId when checking duplicates', async () => {
    vi.useFakeTimers();
    const existsByName = vi.fn(async () => false);
    const resolveDefaultEnglishName = vi.fn(() => null);
    const { result } = await renderHook(() =>
      useNameDuplicateCheck({
        existsByName,
        resolveDefaultEnglishName,
        duplicateErrorKey: 'duplicate',
        excludeId: 42,
      })
    );

    await act(() => result.current.handleNameChange('Unique', vi.fn()));
    await flushDebounce();

    expect(existsByName).toHaveBeenCalledWith('Unique', 42);
  });

  it('clears without checking when the value is blank', async () => {
    vi.useFakeTimers();
    const options = makeOptions();
    const { result } = await renderWith(options);

    await act(() => result.current.handleNameChange('   ', vi.fn()));
    await flushDebounce();

    expect(result.current.nameError).toBeNull();
    expect(result.current.checkingName).toBe(false);
  });
});
