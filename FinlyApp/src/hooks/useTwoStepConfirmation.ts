import { useCallback, useState } from 'react';

interface UseTwoStepConfirmationOptions {
  canClose: boolean;
}

export function useTwoStepConfirmation({ canClose }: UseTwoStepConfirmationOptions) {
  const [firstVisible, setFirstVisible] = useState(false);
  const [secondVisible, setSecondVisible] = useState(false);
  const [text, setText] = useState('');

  const reset = useCallback(() => {
    setFirstVisible(false);
    setSecondVisible(false);
    setText('');
  }, []);

  const open = useCallback(() => setFirstVisible(true), []);
  const cancelFirst = useCallback(() => setFirstVisible(false), []);
  const advance = useCallback(() => setSecondVisible(true), []);
  const cancelSecond = useCallback(() => {
    if (!canClose) return;
    reset();
  }, [canClose, reset]);

  return {
    firstVisible,
    secondVisible,
    text,
    setText,
    open,
    cancelFirst,
    advance,
    cancelSecond,
    reset,
  };
}
