"use client";
import { useState, useEffect } from "react";
import PaymentForm from "./Payment";

export default function CheckoutComponent({ goBack, goHome }: any) {
  const [step, setStep] = useState<"details" | "payment">("details");
  const [cart, setCart] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});
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

  useEffect(() => {
    fetchCart();
  }, []);

  async function fetchCart() {
    const res = await fetch("/api/cart");
    const data = await res.json();
    setCart(data);
  }

  const total = cart.reduce((sum, item) => {
    const price = Number(item.price.replace("$", ""));
    return sum + price * item.quantity;
  }, 0);
  
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
    setStep("payment");
  }
}}
            className="space-y-10"
          >
            {/* -------- ORDER SUMMARY -------- */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-gray-100">
                Order Summary
              </h3>

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

              <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-gray-100 pt-4">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
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

            {/* -------- BUTTONS -------- */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="bg-blue-700 cursor-pointer text-white px-6 py-2 rounded hover:bg-blue-900 transition"
              >
                Proceed to Payment
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
          <PaymentForm goBack={() => setStep("details")} goHome={goHome} />
        )}
      </div>
    </div>
    </div>
  );
}