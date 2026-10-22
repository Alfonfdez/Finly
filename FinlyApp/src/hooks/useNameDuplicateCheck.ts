import { useState, useRef, useCallback } from 'react';
import { useDebouncedCallback } from './useDebouncedCallback';
import { DEBOUNCE_MS } from '../constants/types';
import { ERROR_PREFIXES, logError } from '../utils/errors';

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
  const checkId = useRef(0);

  const checkNameDuplicate = useCallback(async (value: string) => {
    const { existsByName, resolveDefaultEnglishName, duplicateErrorKey, excludeId } = optionsRef.current;
    const id = ++checkId.current;
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
        if (id !== checkId.current) return;
        if (defaultExists) {
          setNameError(duplicateErrorKey);
          return;
        }
      }
      const exists = await existsByName(value.trim(), excludeId);
      if (id !== checkId.current) return;
      setNameError(exists ? duplicateErrorKey : null);
    } catch (error) {
      if (id !== checkId.current) return;
      logError(ERROR_PREFIXES.duplicateCheck, error);
      setNameError(null);
    } finally {
      if (id === checkId.current) setCheckingName(false);
    }
  }, []);

  const scheduleCheck = useDebouncedCallback(checkNameDuplicate, DEBOUNCE_MS);

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
    handleNameChange,
  };
}
