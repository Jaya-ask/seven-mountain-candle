import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function useCart({ authToken }) {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const isHydratingRef = useRef(false);
  const skipNextPersistRef = useRef(false);
  const latestCartRef = useRef([]);

  useEffect(() => {
    latestCartRef.current = cart;
  }, [cart]);

  function getCartItemKey(item) {
    return item?.sku?.toString().trim().toLowerCase() || item?.id || "";
  }

  function mergeGuestItemsIntoServerCart(serverItems, guestItems) {
    const normalizedServerItems = Array.isArray(serverItems) ? serverItems : [];
    const normalizedGuestItems = Array.isArray(guestItems) ? guestItems : [];

    const merged = [...normalizedServerItems];
    const existingKeys = new Set(
      normalizedServerItems
        .map((item) => getCartItemKey(item))
        .filter(Boolean)
    );

    let hasAddedGuestItems = false;

    for (const guestItem of normalizedGuestItems) {
      const key = getCartItemKey(guestItem);
      if (!key || existingKeys.has(key)) {
        continue;
      }

      existingKeys.add(key);
      merged.push(guestItem);
      hasAddedGuestItems = true;
    }

    return {
      mergedItems: merged,
      hasAddedGuestItems
    };
  }

  const persistCart = useCallback(async (items) => {
    if (!authToken) {
      return;
    }

    try {
      await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            sku: item.sku,
            quantity: item.quantity
          }))
        })
      });
    } catch (_error) {
      // Keep local cart behavior even if persistence fails.
    }
  }, [authToken]);

  const cartCount = useMemo(
    () => cart.length,
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity * item.price, 0),
    [cart]
  );

  useEffect(() => {
    if (!authToken) {
      isHydratingRef.current = false;
      skipNextPersistRef.current = false;
      setCart([]);
      return;
    }

    const abortController = new AbortController();

    async function hydrateCart() {
      isHydratingRef.current = true;

      try {
        const response = await fetch("/api/cart", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`
          },
          signal: abortController.signal
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload?.message || "Failed to load cart.");
        }

        const serverItems = Array.isArray(payload.items) ? payload.items : [];
        const guestItems = latestCartRef.current;
        const { mergedItems, hasAddedGuestItems } = mergeGuestItemsIntoServerCart(
          serverItems,
          guestItems
        );

        skipNextPersistRef.current = true;
        setCart(mergedItems);

        if (hasAddedGuestItems) {
          persistCart(mergedItems);
        }
      } catch (_error) {
        if (!abortController.signal.aborted) {
          // Preserve current in-memory cart when hydration fails temporarily.
        }
      } finally {
        isHydratingRef.current = false;
      }
    }

    hydrateCart();

    return () => {
      abortController.abort();
    };
  }, [authToken]);

  useEffect(() => {
    if (!authToken || isHydratingRef.current) {
      return;
    }

    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    persistCart(cart);
  }, [authToken, cart, persistCart]);

  function addToCart(product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  }

  function updateQuantity(productId, nextQuantity) {
    setCart((current) =>
      current
        .map((item) =>
          item.id === productId ? { ...item, quantity: nextQuantity } : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function clearCart() {
    setCart([]);
  }

  return {
    cart,
    cartOpen,
    setCartOpen,
    cartCount,
    subtotal,
    addToCart,
    updateQuantity,
    clearCart
  };
}
