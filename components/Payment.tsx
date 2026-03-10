"use client";
import { useState } from "react";

export default function PaymentForm({ goBack, goHome ,orderId}: any) {
  const [card, setCard] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  
  const [errors, setErrors] = useState<any>({});
  const [localOrderId, setOrderId] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const token = process.env.NEXT_PUBLIC_WP_TOKEN;
   const API = process.env.NEXT_PUBLIC_WP_API;
  function handleChange(e: any) {
    const { name, value } = e.target;
    let newValue = value;

    // ✅ Name: letters and spaces only
    if (name === "cardName") {
      newValue = value.replace(/[^a-zA-Z\s]/g, "");
    }

    // ✅ Card Number: digits only, max 16
    if (name === "cardNumber") {
      newValue = value.replace(/\D/g, "").slice(0, 16);
    }

    // ✅ Expiry: MM/YY format auto-format
    if (name === "expiry") {
    newValue = value.replace(/\D/g, "").slice(0, 4);

    if (newValue.length >= 3) {
      newValue = newValue.slice(0, 2) + "/" + newValue.slice(2);
    }
  }

    // ✅ CVV: digits only, max 4
    if (name === "cvv") {
      newValue = value.replace(/\D/g, "").slice(0, 4);
    }

    setCard({ ...card, [name]: newValue });
  }
  
  function validate() {
    let newErrors: any = {};

    if (!/^[A-Za-z\s]+$/.test(card.cardName)) {
      newErrors.cardName = "Name should contain letters only";
    }

    if (!/^\d{16}$/.test(card.cardNumber)) {
      newErrors.cardNumber = "Card number must be 16 digits";
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) {
      newErrors.expiry = "Expiry must be in MM/YY format";
    }

    if (!/^\d{3,4}$/.test(card.cvv)) {
      newErrors.cvv = "CVV must be 3 or 4 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

 

 async function handleSubmit(e: any) {
  e.preventDefault();

  if (!validate()) return;

  setPaymentLoading(true);

  try {
    const res = await fetch(`${API}/wp-json/demo-cart/v1/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ order_id: orderId }),
    });

    const data = await res.json();

    if (data.success) {
      setOrderId(data.order_id);
    } else {
      alert(data.message || "Payment failed");
    }
  } catch (err) {
    console.error(err);
  } finally {
    setPaymentLoading(false);
  }
}

  /* ---------------- SUCCESS SCREEN ---------------- */
  if (localOrderId) {
    return (
      <div className="mx-auto w-full max-w-4xl px-2 pb-4 ">
    <div className="relative flex w-full flex-col gap-4">
    
      <div className="w-full overflow-hidden shadow-xs rounded-xl border p-3">
      <div className="text-center py-10">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Order #{orderId}
        </h2>

        <p className="text-green-600 text-lg mb-6">
          Your order was placed successfully 🎉
        </p>

        <button
          onClick={goHome}
          className="bg-blue-700 cursor-pointer text-white px-6 py-2 rounded hover:bg-blue-900  transition"
        >
          Continue Shopping
        </button>
      </div>
      </div>
      </div>
      </div>
    );
  }

  /* ---------------- PAYMENT FORM ---------------- */
  return (
    <div className="mx-auto w-full max-w-4xl px-2 pb-4 ">
    <div className="relative flex w-full flex-col gap-4">
    
      <div className="w-full overflow-hidden shadow-xs  p-3">
    <form onSubmit={handleSubmit} className="space-y-6">
      
      <h3 className="font-semibold mb-3 text-gray-900 dark:text-gray-100">
        Payment Details
      </h3>

       <div>
        <input
          name="cardName"
          placeholder="Name on Card"
          value={card.cardName}
          onChange={handleChange}
          className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          required
        />
        {errors.cardName && (
          <p className="text-red-500 text-sm">{errors.cardName}</p>
        )}
      </div>

      <div>
        <input
          name="cardNumber"
          placeholder="Card Number"
          value={card.cardNumber}
          onChange={handleChange}
          className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          required
        />
        {errors.cardNumber && (
          <p className="text-red-500 text-sm">{errors.cardNumber}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <input
            name="expiry"
            placeholder="MM/YY"
            value={card.expiry}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
          {errors.expiry && (
            <p className="text-red-500 text-sm">{errors.expiry}</p>
          )}
        </div>

        <div>
          <input
            name="cvv"
            placeholder="CVV"
            value={card.cvv}
            onChange={handleChange}
            className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
          {errors.cvv && (
            <p className="text-red-500 text-sm">{errors.cvv}</p>
          )}
        </div>
      </div>

      <div className="flex gap-4 pt-4">
     <button
  type="submit"
  disabled={paymentLoading}
  className={`px-6 py-2 rounded transition 
  ${paymentLoading 
    ? "bg-gray-400 text-white cursor-not-allowed" 
    : "bg-blue-700 text-white hover:bg-blue-900"
  }`}
>
  {paymentLoading ? "Processing Payment..." : "Make Payment"}
</button>

        <button
          type="button"
          onClick={goBack}
          className="mt-2 text-blue-600 hover:text-blue-700 text-sm underline cursor-pointer"
        >
          Back to Checkout
        </button>
      </div>
    </form>
    </div>
    </div>
    </div>
    
  );
}