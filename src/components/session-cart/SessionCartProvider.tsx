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
import { parseSupportedCurrency, type SupportedCurrency } from "@/lib/currency";
import { fetchAuthMe, fetchCart, type CartClient } from "@/lib/marketplace-cart";

type SessionCartContextValue = {
  user: PublicAuthUser | null;
  cart: CartClient;
  loading: boolean;
  refresh: () => Promise<void>;
  itemCount: number;
  subtotal: number;
  currency: SupportedCurrency | null;
};

const SessionCartContext = createContext<SessionCartContextValue | null>(null);

export function SessionCartProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicAuthUser | null>(null);
  const [cart, setCart] = useState<CartClient>({ items: [], currency: null });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user: nextUser } = await fetchAuthMe();
      setUser(nextUser);
      if (nextUser) {
        setCart(await fetchCart());
      } else {
        setCart({ items: [], currency: null });
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
  const subtotal = cart.items.reduce(
    (sum, row) => sum + (row.lineTotal ?? 0),
    0,
  );

  const currency = useMemo(
    () =>
      cart.currency
        ? parseSupportedCurrency(cart.currency)
        : cart.items[0]?.currency
          ? parseSupportedCurrency(cart.items[0].currency)
          : null,
    [cart.currency, cart.items],
  );

  const value = useMemo(
    () => ({
      user,
      cart,
      loading,
      refresh,
      itemCount,
      subtotal,
      currency,
    }),
    [user, cart, loading, refresh, itemCount, subtotal, currency],
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
