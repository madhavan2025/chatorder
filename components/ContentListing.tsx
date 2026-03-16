

type ContentItem = {
  id: string;
  title: string;
  description: string;
  link:string
};

type ContentListingProps = {
  items: ContentItem[];
  count: number;
   loading?: boolean;
};




export function ContentListing({
  items,
  count,
  loading = false,
}: ContentListingProps) {

  const renderSkeleton = () => {
  return (
    <div className="space-y-4 mt-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      ))}
    </div>
  );
};


  return (
    <div className="mx-auto w-full max-w-4xl px-2 pb-4">
      <div className="relative flex w-full flex-col gap-4">
        <div className="w-full overflow-hidden rounded-xl border p-3 shadow-xs">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Recommended for you
          </h3>

          {loading ? (
            renderSkeleton()
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              No content available.
            </p>
          ) : (
            items.slice(0, count).map((item) => (
              <div key={item.id} className="space-y-1 mt-3">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {item.title}
                </p>

                <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                  {item.description}
                </p>

                <a
  href={item.link || "#"}
  target="_blank"
  rel="noopener noreferrer"
  className="text-xs cursor-pointer font-semibold text-blue-600 hover:underline dark:text-blue-400"
>
  View more →
</a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}