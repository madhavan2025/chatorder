"use client";

import { useState } from "react";

type FormField = {
  name: string;
  label?: string;
  type: "text" | "email" | "password" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
};

type DynamicFormConfig = {
  id: string;
  title: string;
  successMessage: string;
  fields: FormField[];
  submitLabel: string;
};

type MiniFormProps = {
  config: DynamicFormConfig;
};

export function MiniForm({ config }: MiniFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    config.fields.forEach((field) => {
      if (field.required && !formData[field.name]?.trim()) {
        newErrors[field.name] = `${field.label || field.name} is required`;
      }

      if (
        field.type === "email" &&
        formData[field.name] &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[field.name])
      ) {
        newErrors[field.name] = "Invalid email address";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/forms/${config.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to submit");

      setSubmitted(true); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
     <div className="mx-auto w-full max-w-4xl px-2 pb-4 ">
    <div className="relative flex w-full flex-col gap-4">
    
      <div className="w-full overflow-hidden shadow-xs rounded-xl border p-3">
      <div className="rounded-xl mb-2 border bg-green-50 dark:bg-green-900 dark:text-green-100 p-4 text-sm">
        {config.successMessage}
      </div>
      </div>
      </div>
      </div>
    );
  }

  return (
  <form onSubmit={handleSubmit} className="w-full flex justify-center">
    <div className="w-full max-w-xl px-4 py-6">
      <div className="rounded-xl border shadow-sm p-6 space-y-5 bg-white dark:bg-gray-800">
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {config.title}
        </h3>

        {config.fields.map((field) => (
          <div key={field.name} className="space-y-1">
            {field.label && (
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label}
              </label>
            )}

            {field.type === "textarea" ? (
              <textarea
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-black dark:focus:ring-gray-500 outline-none"
                placeholder={field.placeholder}
                value={formData[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            ) : field.type === "select" ? (
              <select
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-black dark:focus:ring-gray-500 outline-none"
                value={formData[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
              >
                <option value="">Select</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-black dark:focus:ring-gray-500 outline-none"
                placeholder={field.placeholder}
                value={formData[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
              />
            )}

            {errors[field.name] && (
              <p className="text-xs text-red-500">{errors[field.name]}</p>
            )}
          </div>
        ))}

        <button
          type="submit"
          className="w-full rounded-md bg-blue-600  text-white px-4 py-2 text-sm font-semibold hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Submitting..." : config.submitLabel}
        </button>
      </div>
    </div>
  </form>
);
}