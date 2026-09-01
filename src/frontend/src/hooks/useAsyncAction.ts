import { useCallback, useRef, useState, useSyncExternalStore } from 'react';

const globalActionLocks = new Set<string>();
const lockListeners = new Set<() => void>();
let lockVersion = 0;

function emitLockChange() {
  lockVersion += 1;
  lockListeners.forEach(listener => listener());
}

function subscribeToLocks(listener: () => void) {
  lockListeners.add(listener);
  return () => { lockListeners.delete(listener); };
}

const getLockSnapshot = () => lockVersion;

/**
 * Khóa đồng bộ ngay từ lần gọi đầu tiên, trước khi React kịp render lại.
 * Vì vậy double-click không thể tạo hai mutation song song.
 */
export function useAsyncAction(actionKey?: string) {
  const lockedRef = useRef(false);
  const [localPending, setLocalPending] = useState(false);
  const { isPending, run: runKeyed } = useKeyedAsyncAction();

  const run = useCallback(async <T,>(action: () => Promise<T>): Promise<T | undefined> => {
    if (actionKey) return runKeyed(actionKey, action);
    if (lockedRef.current) return undefined;
    lockedRef.current = true;
    setLocalPending(true);
    try {
      return await action();
    } finally {
      lockedRef.current = false;
      setLocalPending(false);
    }
  }, [actionKey, runKeyed]);

  return { pending: actionKey ? isPending(actionKey) : localPending, run };
}

/** Khóa độc lập theo từng hàng trong danh sách. */
export function useKeyedAsyncAction() {
  useSyncExternalStore(subscribeToLocks, getLockSnapshot, getLockSnapshot);

  const run = useCallback(async <T,>(key: string, action: () => Promise<T>): Promise<T | undefined> => {
    if (globalActionLocks.has(key)) return undefined;
    globalActionLocks.add(key);
    emitLockChange();
    try {
      return await action();
    } finally {
      globalActionLocks.delete(key);
      emitLockChange();
    }
  }, []);

  const isPending = useCallback(
    (key: string) => globalActionLocks.has(key),
    [],
  );
  return { isPending, run };
}
