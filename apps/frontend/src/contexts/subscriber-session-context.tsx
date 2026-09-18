"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

interface SubscriberSessionContextValue {
  currentEmail: string | null;
  login: (email: string) => void;
  logout: () => void;
  isLoaded: boolean;
}

const STORAGE_KEY = "claro_subscriber_email";
const STORAGE_EVENT = "claro_subscriber_email_change";

let memoryEmail: string | null = null;

function getEmailSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY)?.trim().toLowerCase() || null;
  } catch {
    return memoryEmail;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", callback);
  window.addEventListener(STORAGE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

const SubscriberSessionContext = createContext<SubscriberSessionContextValue | undefined>(
  undefined,
);

export function SubscriberSessionProvider({ children }: { children: ReactNode }) {
  const currentEmail = useSyncExternalStore(subscribe, getEmailSnapshot, getServerSnapshot);

  const login = useCallback((email: string) => {
    const cleaned = email.trim().toLowerCase();
    memoryEmail = cleaned;
    try {
      localStorage.setItem(STORAGE_KEY, cleaned);
    } catch {
      // Ignora erro
    }
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }, []);

  const logout = useCallback(() => {
    memoryEmail = null;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignora erro
    }
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }, []);

  const value = useMemo(
    () => ({
      currentEmail,
      login,
      logout,
      isLoaded: true,
    }),
    [currentEmail, login, logout],
  );

  return (
    <SubscriberSessionContext.Provider value={value}>{children}</SubscriberSessionContext.Provider>
  );
}

export function useSubscriberSession(): SubscriberSessionContextValue {
  const context = useContext(SubscriberSessionContext);
  if (!context) {
    throw new Error(
      "useSubscriberSession deve ser utilizado dentro de um SubscriberSessionProvider",
    );
  }
  return context;
}
