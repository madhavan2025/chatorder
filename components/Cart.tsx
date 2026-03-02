"use client";
import { useEffect, useState } from "react";

export default function CartComponent({ goBack, goCheckout }: any) {
  const [cart, setCart] = useState<any[]>([]);

  useEffect(() => {
    fetchCart();
  }, []);

  async function fetchCart() {
    const res = await fetch("/api/cart");
    const data = await res.json();
    setCart(data);
  }

  async function increase(id: string) {
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ _id: id }),
    });
    fetchCart();
  }

  async function decrease(id: string) {
    await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchCart();
  }

  async function removeItem(id: string) {
    await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, removeAll: true }),
    });
    fetchCart();
  }

const total = cart.reduce((sum, item) => {
  const rawPrice = item?.price ?? "0";
  const price =
    typeof rawPrice === "string"
      ? Number(rawPrice.replace("$", ""))
      : Number(rawPrice);

  return sum + price * (item.quantity ?? 1);
}, 0);

  return (
    <div className="mb-2 border bg-white dark:bg-gray-800 rounded-3xl shadow-sm overflow-hidden transition-colors">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
          Your Order
        </h2>

        {cart.length === 0 ? (
          // ✅ EMPTY CART VIEW
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">
              Your cart is empty 🛒
            </p>

            <button
              onClick={goBack}
              className="bg-black dark:bg-gray-700 text-white px-6 py-2 rounded hover:bg-gray-900 dark:hover:bg-gray-600 transition"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          // ✅ CART WITH PRODUCTS
          <>
            {cart.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-4 mb-5 relative"
              >
                {/* Remove Icon */}
                <button
                  onClick={() => removeItem(item._id)}
                  className="absolute top-0 right-0 text-gray-400 dark:text-gray-300 hover:text-red-500 transition text-lg"
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
                      onClick={() => decrease(item._id)}
                      className="px-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                    >
                      -
                    </button>

                    <span className="text-gray-900 dark:text-gray-100">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => increase(item._id)}
                      className="px-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* TOTAL SECTION */}
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

            {/* ACTION BUTTONS */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={goCheckout}
                className="bg-black dark:bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-900 dark:hover:bg-gray-600 transition"
              >
                Checkout
              </button>

              <button
                onClick={goBack}
                className="underline text-gray-900 dark:text-gray-100"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}