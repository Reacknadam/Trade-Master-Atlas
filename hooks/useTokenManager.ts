
import { useState, useEffect, useCallback } from 'react';
import { INITIAL_TOKENS } from '../constants';

const TOKEN_STORAGE_KEY = 'atlas-trader-tokens';

export const useTokenManager = () => {
  const [tokens, setTokens] = useState<number>(INITIAL_TOKENS);

  useEffect(() => {
    try {
      const storedTokens = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (storedTokens !== null) {
        setTokens(parseInt(storedTokens, 10));
      } else {
        localStorage.setItem(TOKEN_STORAGE_KEY, String(INITIAL_TOKENS));
      }
    } catch (error) {
      console.error("Failed to read from localStorage", error);
    }
  }, []);

  const updateTokens = useCallback((newTokens: number) => {
    setTokens(newTokens);
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, String(newTokens));
    } catch (error) {
      console.error("Failed to write to localStorage", error);
    }
  }, []);

  const spendTokens = useCallback((amount: number): boolean => {
    if (tokens >= amount) {
      updateTokens(tokens - amount);
      return true;
    }
    return false;
  }, [tokens, updateTokens]);

  const addTokens = useCallback((amount: number) => {
    updateTokens(tokens + amount);
  }, [tokens, updateTokens]);

  return { tokens, spendTokens, addTokens };
};
