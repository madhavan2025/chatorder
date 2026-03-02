"use client";

import { useRouter } from "next/navigation";

type ContentItem = {
  id: string;
  title: string;
  description: string;
};

type ContentListingProps = {
  items: ContentItem[];
  count: number;
};

export function ContentListing({ items, count }: ContentListingProps) {
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-4xl px-2 pb-4 ">
    <div className="relative flex w-full flex-col gap-4">
    
      <div className="w-full overflow-hidden shadow-xs rounded-xl border p-3">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Recommended for you
      </h3>

      {items.slice(0, count).map((item) => (
        <div key={item.id} className="space-y-1">
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {item.title}
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {item.description}
          </p>

          <button
            type="button"
            onClick={() => router.push(`/product/${item.id}`)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            View more →
          </button>
        </div>
      ))}

      {items.length === 0 && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No content available.
        </p>
      )}
    </div>
    </div>
    </div>
  );
}