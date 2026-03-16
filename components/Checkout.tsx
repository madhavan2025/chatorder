"use client";
import { useState, useEffect } from "react";
import PaymentForm from "./Payment";

export default function CheckoutComponent({ goBack, goHome }: any) {
  const [step, setStep] = useState<"details" | "payment">("details");
  const [cart, setCart] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<any>({});
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [sameAsBilling, setSameAsBilling] = useState(true);

const [shipping, setShipping] = useState({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  country: "",
});
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });
  const token = process.env.NEXT_PUBLIC_WP_TOKEN;
   const API = process.env.NEXT_PUBLIC_WP_API;
    const [orderId, setOrderId] = useState<number | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

 useEffect(() => {
  if (sameAsBilling) {
    setShipping(form);
  }
}, [form, sameAsBilling]);

function handleShippingChange(e: any) {
  const { name, value } = e.target;

  setShipping((prev) => ({
    ...prev,
    [name]: value,
  }));
}

  async function fetchCart() {
    setLoading(true);
    try {
      const res = await fetch("/api/cart");
   const data = await res.json();
      setCart(data);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  }


  
  function validateField(name: string, value: string) {
  let error = "";

  switch (name) {
    case "firstName":
    case "lastName":
      if (!/^[A-Za-z\s]+$/.test(value)) {
        error = "Only letters are allowed";
      }
      break;

    case "email":
      if (!/^\S+@\S+\.\S+$/.test(value)) {
        error = "Enter a valid email address";
      }
      break;

    case "phone":
      if (!/^[0-9]{7,15}$/.test(value)) {
        error = "Phone must contain only numbers";
      }
      break;

    case "zip":
      if (!/^[0-9]{4,10}$/.test(value)) {
        error = "ZIP must contain only numbers";
      }
      break;

    default:
      if (!value.trim()) {
        error = "This field is required";
      }
  }

  return error;
}

  function handleChange(e: any) {
  const { name, value } = e.target;

  setForm({ ...form, [name]: value });

  const error = validateField(name, value);

  setErrors((prev: any) => ({
    ...prev,
    [name]: error,
  }));
}

  const subtotal = cart.reduce((sum, item) => {
  const rawPrice = item?.price ?? "0";
  const price =
    typeof rawPrice === "string"
      ? Number(rawPrice.replace("$", ""))
      : Number(rawPrice);

  return sum + price * (item.quantity ?? 1);
}, 0);

const taxRate = 0.0875;
const tax = subtotal * taxRate;
const total = subtotal + tax;

async function handleCheckout() {
  setCheckoutLoading(true);
 const billing = {
  first_name: form.firstName,
  last_name: form.lastName,
  email: form.email,
  phone: form.phone,
  address_1: form.address,
  city: form.city,
  state: form.state,
  postcode: form.zip,
  country: form.country,
};

const shippingData = sameAsBilling
  ? billing
  : {
      first_name: shipping.firstName,
      last_name: shipping.lastName,
      address_1: shipping.address,
      city: shipping.city,
      state: shipping.state,
      postcode: shipping.zip,
      country: shipping.country,
    };

  try {
    const res = await fetch(`${API}/wp-json/wc/v3/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
         billing, 
         shipping:shippingData,
          payment_method: "card",
          items:cart
         }),
    });

    const data = await res.json();
    if (data.success) {
      setOrderId(data.order_id);

      // Always go to payment page
      setStep("payment");
    } else {
      console.log(data.message || "Checkout failed");
    }
  } catch (err) {
    console.error(err);
  }finally {
    setCheckoutLoading(false);
  }
}


const renderOrderSummarySkeleton = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3"
        >
          <div className="space-y-2 w-2/3">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          </div>

          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
        </div>
      ))}

      {/* Total Skeleton */}
      <div className="flex justify-between pt-4">
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
      </div>
    </div>
  );
};

  return (
     <div className="mx-auto w-full max-w-4xl px-2 pb-4 ">
    <div className="relative flex w-full flex-col gap-4">
    
      <div className="w-full overflow-hidden shadow-xs rounded-xl border p-3">
        <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
          {step === "details" ? "Checkout" : "Payment"}
        </h2>

        {/* ================= CHECKOUT PAGE ================= */}
        {step === "details" && (
          <form
           onSubmit={(e) => {
  e.preventDefault();

  let newErrors: any = {};

  Object.keys(form).forEach((key) => {
    const error = validateField(key, (form as any)[key]);
    if (error) newErrors[key] = error;
  });

  setErrors(newErrors);

  if (Object.keys(newErrors).length === 0) {
    handleCheckout();
  }
}}
            className="space-y-10"
          >
            {/* -------- ORDER SUMMARY -------- */}
            <div>
  <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">
    Order Summary
  </h3>

  {loading ? (
    renderOrderSummarySkeleton()
  ) : cart.length === 0 ? (
    <p className="text-sm text-gray-500 dark:text-gray-400">
      Your cart is empty.
    </p>
  ) : (
    <>
      {cart.map((item) => (
        <div
          key={item._id}
          className="flex justify-between border-b border-gray-200 dark:border-gray-700 pb-3 mb-3"
        >
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {item.title}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {item.quantity} × {item.price}
            </p>
          </div>

          <p className="font-semibold text-gray-900 dark:text-gray-100">
            $
            {(
              Number(item.price.replace("$", "")) *
              item.quantity
            ).toFixed(2)}
          </p>
        </div>
      ))}

     <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
  <div className="flex justify-between text-gray-900 dark:text-gray-100">
    <span>Subtotal</span>
    <span>${subtotal.toFixed(2)}</span>
  </div>

  <div className="flex justify-between text-gray-600 dark:text-gray-400">
    <span>Sales tax (8.75%)</span>
    <span>${tax.toFixed(2)}</span>
  </div>

  <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-gray-100 pt-2">
    <span>Total</span>
    <span>${total.toFixed(2)}</span>
  </div>
</div>
    </>
  )}
</div>
             

            {/* -------- BILLING FORM -------- */}
            <div>
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Billing & Shipping Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                <input
                  name="firstName"
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
                {errors.firstName && (
  <p className="text-red-500 text-sm mt-1">
    {errors.firstName}
  </p>
)} </div>
                <div className="flex flex-col">
                <input
                  name="lastName"
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
                {errors.lastName && (
  <p className="text-red-500 text-sm mt-1">
    {errors.lastName}
  </p>
)} </div>
              </div>

              <input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded w-full mt-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
              {errors.email && (
  <p className="text-red-500 text-sm mt-1">
    {errors.email}
  </p>
)}
              <input
                name="phone"
                placeholder="Phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded w-full mt-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
              {errors.phone && (
  <p className="text-red-500 text-sm mt-1">
    {errors.phone}
  </p>
)}
              <input
                name="address"
                placeholder="Street Address"
                value={form.address}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded w-full mt-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
               {errors.address && (
  <p className="text-red-500 text-sm mt-1">
    {errors.address}
  </p>
)}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="flex flex-col">
                <input
                  name="city"
                  placeholder="City"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
                {errors.city && (
  <p className="text-red-500 text-sm mt-1">
    {errors.city}
  </p>
)}</div>
                <div className="flex flex-col">
                <input
                  name="state"
                  placeholder="State"
                  value={form.state}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
                {errors.state&& (
  <p className="text-red-500 text-sm mt-1">
    {errors.state}
  </p>
)} </div>

               <div className="flex flex-col">
                <input
                  name="zip"
                  placeholder="ZIP Code"
                  value={form.zip}
                  onChange={handleChange}
                  className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
                {errors.zip&& (
  <p className="text-red-500 text-sm mt-1">
    {errors.zip}
  </p>
)}
</div>
              </div>

              <input
                name="country"
                placeholder="Country"
                value={form.country}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded w-full mt-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
              {errors.country && (
  <p className="text-red-500 text-sm mt-1">
    {errors.country}
  </p>
)}
            </div>
            <div className="flex items-center gap-2 mt-4">
  <input
    type="checkbox"
    checked={sameAsBilling}
    onChange={(e) => setSameAsBilling(e.target.checked)}
  />

  <label className="text-sm text-gray-700 dark:text-gray-300">
    Shipping same as billing details
  </label>
</div>

{!sameAsBilling && (
  <div className="mt-6">
    <h3 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">
      Shipping Information
    </h3>

    <div className="grid grid-cols-2 gap-4">
      <input
        name="firstName"
        placeholder="First Name"
        value={shipping.firstName}
        onChange={handleShippingChange}
        className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />

      <input
        name="lastName"
        placeholder="Last Name"
        value={shipping.lastName}
        onChange={handleShippingChange}
        className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />
    </div>

    <input
      name="address"
      placeholder="Street Address"
      value={shipping.address}
      onChange={handleShippingChange}
      className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded w-full mt-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
    />

    <div className="grid grid-cols-3 gap-4 mt-4">
      <input
        name="city"
        placeholder="City"
        value={shipping.city}
        onChange={handleShippingChange}
        className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />

      <input
        name="state"
        placeholder="State"
        value={shipping.state}
        onChange={handleShippingChange}
        className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />

      <input
        name="zip"
        placeholder="ZIP"
        value={shipping.zip}
        onChange={handleShippingChange}
        className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
      />
    </div>

    <input
      name="country"
      placeholder="Country"
      value={shipping.country}
      onChange={handleShippingChange}
      className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded w-full mt-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
    />
  </div>
)}

            {/* -------- BUTTONS -------- */}
            <div className="flex gap-4 pt-4">
             <button
  type="submit"
  disabled={checkoutLoading}
  className={`px-6 py-2 rounded transition 
    ${checkoutLoading 
      ? "bg-gray-400 text-white cursor-not-allowed" 
      : "bg-blue-700 text-white hover:bg-blue-900"
    }`}
>
  {checkoutLoading ? "Processing..." : "Proceed to Payment"}
</button>

              <button
                type="button"
                onClick={goBack}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm underline cursor-pointer"
              >
                Back to Cart
              </button>
            </div>
          </form>
        )}

        {/* ================= PAYMENT PAGE ================= */}
        {step === "payment" && (
  <PaymentForm 
    goBack={() => setStep("details")} 
    goHome={goHome} 
    orderId={orderId} // ✅ pass the orderId
  />
)}
      </div>
    </div>
    </div>
  );
}