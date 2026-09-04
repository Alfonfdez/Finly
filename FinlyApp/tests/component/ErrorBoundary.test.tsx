import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { resetStub, setColors } from './helpers/configStub';
import ErrorBoundary from '../../src/components/ErrorBoundary';

function flattenStyle(style: unknown): Record<string, unknown> {
  const arr = Array.isArray(style) ? style : [style];
  return Object.assign({}, ...arr.filter(Boolean)) as Record<string, unknown>;
}

function ThrowingChild(): ReactNode {
  throw new Error('boom');
}

function GoodChild() {
  return <></>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    resetStub();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when nothing throws', async () => {
    const view = await render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>,
    );
    expect(view.queryByText('Something went wrong')).toBeNull();
  });

  it('shows the fallback when a child throws', async () => {
    const view = await render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );
    expect(view.getByText('Something went wrong')).toBeTruthy();
    expect(view.getByText('An unexpected error occurred.')).toBeTruthy();
  });

  it('drives the fallback background from the active theme (dark)', async () => {
    const view = await render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );
    expect(flattenStyle(view.root!.props.style).backgroundColor).toBe('#0F172A');
  });

  it('updates the fallback background when the theme switches to light', async () => {
    setColors({ background: '#FFFFFF', text: '#0F172A', textSecondary: '#475569', primary: '#0EA5E9' });
    const view = await render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );
    expect(flattenStyle(view.root!.props.style).backgroundColor).toBe('#FFFFFF');
  });

  it('renders the retry button when onRetry is provided and uses primary as its color', async () => {
    const onRetry = vi.fn();
    const view = await render(
      <ErrorBoundary onRetry={onRetry}>
        <ThrowingChild />
      </ErrorBoundary>,
    );
    const button = view.getByText('Try again');
    expect(button).toBeTruthy();
    expect(flattenStyle(button.parent?.props.style).backgroundColor).toBe('#22D3EE');
    await fireEvent.press(button);
    expect(onRetry).toHaveBeenCalled();
  });
});
