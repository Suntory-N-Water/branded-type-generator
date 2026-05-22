import { useCallback, useSyncExternalStore } from 'react';

export const usePreferredSymbolStyle = () => {
  const useDeclareConst = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setUseDeclareConst = useCallback((value: boolean) => {
    localStorage.setItem(storageKey, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(eventName));
  }, []);

  return [useDeclareConst, setUseDeclareConst] as const;
};

declare global {
  interface WindowEventMap {
    'branded-type-generator:symbolStyleChanged': CustomEvent;
  }
}

const eventName = 'branded-type-generator:symbolStyleChanged' satisfies keyof WindowEventMap;
const storageKey = 'preferredSymbolStyle';

function subscribe(onStoreChange: () => void) {
  window.addEventListener(eventName, onStoreChange);
  return () => window.removeEventListener(eventName, onStoreChange);
}

function getSnapshot(): boolean {
  const stored = localStorage.getItem(storageKey);
  const parsed = JSON.parse(stored ?? 'false');
  return typeof parsed === 'boolean' ? parsed : false;
}

function getServerSnapshot(): boolean {
  return false;
}
