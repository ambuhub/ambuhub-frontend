"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { PublicAuthUser } from "@/lib/auth-redirect";
import { fetchAuthMe, fetchCart, type CartClient } from "@/lib/marketplace-cart";

type SessionCartContextValue = {
  user: PublicAuthUser | null;
  cart: CartClient;
  loading: boolean;
  refresh: () => Promise<void>;
  itemCount: number;
  subtotalNgn: number;
};

const SessionCartContext = createContext<SessionCartContextValue | null>(null);

export function SessionCartProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicAuthUser | null>(null);
  const [cart, setCart] = useState<CartClient>({ items: [] });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user: nextUser } = await fetchAuthMe();
      setUser(nextUser);
      if (nextUser) {
        setCart(await fetchCart());
      } else {
        setCart({ items: [] });
      }
    } catch {
      setUser(null);
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const itemCount = cart.items.reduce((sum, row) => sum + row.quantity, 0);
  const subtotalNgn = cart.items.reduce(
    (sum, row) => sum + (row.lineTotalNgn ?? 0),
    0,
  );

  const value = useMemo(
    () => ({
      user,
      cart,
      loading,
      refresh,
      itemCount,
      subtotalNgn,
    }),
    [user, cart, loading, refresh, itemCount, subtotalNgn],
  );

  return (
    <SessionCartContext.Provider value={value}>{children}</SessionCartContext.Provider>
  );
}

export function useSessionAndCart(): SessionCartContextValue {
  const ctx = useContext(SessionCartContext);
  if (!ctx) {
    throw new Error("useSessionAndCart must be used within SessionCartProvider");
  }
  return ctx;
}
