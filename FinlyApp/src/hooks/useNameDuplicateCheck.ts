import { useState, useRef, useCallback } from 'react';
import { useDebouncedCallback } from './useDebouncedCallback';
import { DEBOUNCE_MS } from '../constants/types';

interface UseNameDuplicateCheckOptions {
  existsByName: (name: string, excludeId?: number) => Promise<boolean>;
  resolveDefaultEnglishName: (value: string) => string | null;
  duplicateErrorKey: string;
  excludeId?: number;
}

export function useNameDuplicateCheck(options: UseNameDuplicateCheckOptions) {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [nameError, setNameError] = useState<string | null>(null);
  const [checkingName, setCheckingName] = useState(false);

  const checkNameDuplicate = useCallback(async (value: string) => {
    const { existsByName, resolveDefaultEnglishName, duplicateErrorKey, excludeId } = optionsRef.current;
    if (!value.trim()) {
      setNameError(null);
      setCheckingName(false);
      return;
    }
    setCheckingName(true);
    try {
      const englishName = resolveDefaultEnglishName(value.trim());
      if (englishName) {
        const defaultExists = await existsByName(englishName, excludeId);
        if (defaultExists) {
          setNameError(duplicateErrorKey);
          return;
        }
      }
      const exists = await existsByName(value.trim(), excludeId);
      setNameError(exists ? duplicateErrorKey : null);
    } catch (error) {
      console.error('Failed to check name duplicate:', error);
      setNameError(null);
    } finally {
      setCheckingName(false);
    }
  }, []);

  const scheduleCheck = useDebouncedCallback(checkNameDuplicate, DEBOUNCE_MS);

  const debouncedCheck = useCallback((value: string) => {
    setCheckingName(true);
    scheduleCheck(value);
  }, [scheduleCheck]);

  const clearNameError = useCallback(() => setNameError(null), []);

  const handleNameChange = useCallback((value: string, setName: (v: string) => void) => {
    setName(value);
    setNameError(null);
    setCheckingName(true);
    scheduleCheck(value);
  }, [scheduleCheck]);

  return {
    nameError,
    checkingName,
    clearNameError,
    checkNameDuplicate,
    debouncedCheck,
    handleNameChange,
  };
}
