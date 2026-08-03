import { useState, useRef, useCallback } from 'react';
import { useUniqueNameCheck } from './useUniqueNameCheck';

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
    } catch {
      setNameError(null);
    } finally {
      setCheckingName(false);
    }
  }, []);

  const clearNameError = useCallback(() => setNameError(null), []);

  return {
    nameError,
    checkingName,
    clearNameError,
    checkNameDuplicate,
    debouncedCheck: useUniqueNameCheck(checkNameDuplicate),
  };
}
