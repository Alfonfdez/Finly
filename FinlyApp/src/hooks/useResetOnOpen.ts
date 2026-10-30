import { useEffect, useRef } from 'react';

export function useResetOnOpen(visible: boolean, reset: () => void): void {
  const wasVisible = useRef(false);
  useEffect(() => {
    if (visible && !wasVisible.current) reset();
    wasVisible.current = visible;
  }, [visible, reset]);
}
