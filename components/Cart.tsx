"use client";
import { useEffect, useState } from "react";

export default function CartComponent({ goBack, goCheckout }: any) {
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
const [itemLoading, setItemLoading] = useState<Record<number, boolean>>({});
  const token = process.env.NEXT_PUBLIC_WP_TOKEN;
   const API = process.env.NEXT_PUBLIC_WP_API;
  useEffect(() => {
    fetchCart();
  }, []);

  async function fetchCart(options?: { skipLoading?: boolean }) {
     if (!options?.skipLoading) setLoading(true);
    try {
      const res = await fetch(`${API}/wp-json/demo-cart/v1/cart`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});
   const data = await res.json();
      setCart(data.items);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      if (!options?.skipLoading) setLoading(false);
    }
  }

  async function increase(id: number) {
     setItemLoading((prev) => ({ ...prev, [id]: true }));
    await fetch(`${API}/wp-json/demo-cart/v1/cart/increase`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({ key: id })
});
    await fetchCart({ skipLoading: true });
    setItemLoading((prev) => ({ ...prev, [id]: false }));
  }

  async function decrease(id: number) {
     setItemLoading((prev) => ({ ...prev, [id]: true }));
    await fetch(`${API}/wp-json/demo-cart/v1/cart/decrease`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({ key: id })
});
    await fetchCart({ skipLoading: true });
    setItemLoading((prev) => ({ ...prev, [id]: false }));
  }

  async function removeItem(id: number) {
     setItemLoading((prev) => ({ ...prev, [id]: true }));
    await fetch(`${API}/wp-json/demo-cart/v1/cart/remove`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({ key: id })
});
   await fetchCart({ skipLoading: true });
   setItemLoading((prev) => ({ ...prev, [id]: false }));
  }

  const total = cart.reduce((sum, item) => {
    const rawPrice = item?.price ?? "0";
    const price =
      typeof rawPrice === "string"
        ? Number(rawPrice.replace("$", ""))
        : Number(rawPrice);

    return sum + price * (item.quantity ?? 1);
  }, 0);
 
  const renderItemSkeleton = () => {
  return (
    <div className="flex gap-4 animate-pulse mb-5">
      <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
        <div className="flex gap-2 mt-2">
          <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
};
  const renderCartSkeleton = () => {
    return (
      <div className="space-y-5 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-md"></div>

            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>

              <div className="flex gap-2 mt-2">
                <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    
    <div className="mx-auto w-full max-w-4xl px-2 pb-4">
      <div className="relative flex w-full flex-col gap-4">
        <div className="w-full overflow-hidden shadow-xs rounded-xl border p-3">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
            Your Order
          </h2>

          {loading ? (
            renderCartSkeleton()
          ) : cart.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">
                Your cart is empty 🛒
              </p>

              <button
                onClick={goBack}
                className="bg-blue-700 cursor-pointer text-white px-6 py-2 rounded hover:bg-blue-900 transition"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.key}>
    {itemLoading[item.key] ? (
      renderItemSkeleton()
    ) : (

                <div
                  className="flex items-center gap-4 mb-5 relative"
                >
                  <button
                    onClick={() => removeItem(item.key)}
                    className="absolute cursor-pointer top-0 right-0 text-gray-400 dark:text-gray-300 hover:text-red-500 transition text-lg"
                  >
                    ✕
                  </button>

                  <img
                    src={item.image}
                    className="w-16 h-16 object-cover rounded-md"
                    alt={item.title}
                  />

                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                      {item.title}
                    </h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {item.price}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => decrease(item.key)}
                        className="px-2 cursor-pointer bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                      >
                        -
                      </button>

                      <span className="text-gray-900 dark:text-gray-100">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => increase(item.key)}
                        className="px-2 cursor-pointer bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}
              </div>
              ))}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 space-y-3 text-sm">
                <div className="flex justify-between text-gray-900 dark:text-gray-100">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                {(() => {
                  const taxRate = 0.0875;
                  const tax = total * taxRate;
                  const totalWithTax = total + tax;

                  return (
                    <>
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Sales tax (8.75%)</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between font-bold text-base text-gray-900 dark:text-gray-100 pt-2">
                        <span>Total with tax</span>
                        <span>${totalWithTax.toFixed(2)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="flex gap-4 mt-6">
               <button
  onClick={() => {
    setActionLoading(true);
    goCheckout();
  }}
  disabled={actionLoading}
  className={`px-4 py-2 rounded transition 
    ${actionLoading
      ? "bg-gray-400 text-white cursor-not-allowed"
      : "bg-blue-700 text-white hover:bg-blue-900"
    }`}
>
  {actionLoading ? "Loading..." : "Checkout"}
</button>

                <button
                  onClick={goBack}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm underline cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}