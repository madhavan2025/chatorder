"use client";

import { useEffect, useState } from "react";

type Listing = {
  id:number;
  title: string;
  price: string;
  image: string;
  description: string;
};
type ListingsCarouselProps = {
  style?: "type1" | "type2";
  onViewCart?:()=>void;
  isExpanded?: boolean;
  parentWidth?: number;
};

export function ListingsCarousel({
  style = "type1",
  onViewCart,
  isExpanded=false,
  parentWidth
}: ListingsCarouselProps) {
  const [index, setIndex] = useState(0);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const [justAdded, setJustAdded] = useState<Record<string, boolean>>({});
 const [products, setProducts] = useState<Listing[]>([]);
  const [cartItems, setCartItems] = useState<Record<string, boolean>>({});
  const total = products.length;
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});
   const isMobile = (parentWidth ?? 1024) < 640;
    const token = process.env.NEXT_PUBLIC_WP_TOKEN;
   const API = process.env.NEXT_PUBLIC_WP_API;
   const visibleCount = (() => {
  // MOBILE ALWAYS 1
  if (isMobile) return 1;

  // DESKTOP EXPANDED
  if (isExpanded) return 3;

  // DESKTOP NORMAL
  if (style === "type2") return 2;

  // Default type1
  return 1;
})();
  const next = () => setIndex((i) => (i + visibleCount) % total);
  const prev = () => setIndex((i) => (i - visibleCount + total) % total);
  const visibleListings = Array.from({ length: visibleCount })
  .map((_, i) => products[(index + i) % total])
  .filter(Boolean);


  async function getProducts() {
  const res = await fetch(`${API}/wp-json/wp/v2/product`, {
    headers: {
      Authorization: `Bearer ${token}`,
       "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
     console.error(await res.text());
    throw new Error("Failed to fetch products");
  }
 
  const data = await res.json();
  return data;
}

async function fetchCart() {
  const res = await fetch(`${API}/wp-json/demo-cart/v1/cart`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  
  const data = await res.json();
  if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch cart: ${res.status} ${text}`);
      }

  const cartLookup: Record<string, boolean> = {};

  data.items.forEach((item: any) => {
    cartLookup[item.product_id] = true;
  });

  setCartItems(cartLookup);
  setAddedItems(cartLookup);
}

 useEffect(() => {
  setIndex(0);
}, [style, isExpanded,isMobile]);

 

const handleAddToCart = async (listing: any) => {
  try {
    setLoadingItems((prev) => ({ ...prev, [listing.id]: true }));
    const res = await fetch(`${API}/wp-json/demo-cart/v1/cart/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // REQUIRED
      },
      body: JSON.stringify({
        product_id: listing.id, // WooCommerce product id
        quantity: 1,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to add to cart");
    }

     await res.json();
     setLoadingItems((prev) => ({ ...prev, [listing.id]: false }));
    
     
      setJustAdded((prev) => ({ ...prev, [listing.id]: true }));

      setTimeout(() => {
        setJustAdded((prev) => ({ ...prev, [listing.id]: false }));
        setAddedItems((prev) => ({ ...prev, [listing.id]: true }));
      }, 1000);
   

  } catch (error) {
    console.error("Add to cart error:", error);
    setLoadingItems((prev) => ({ ...prev, [listing.id]: false }));

  } 
};
    

useEffect(() => {
  async function fetchData() {
    try {
      setLoading(true);

      const productsData = await getProducts();
      await fetchCart();

      setProducts(productsData.products);
    } catch (error) {
      console.error("Failed to fetch products or cart:", error);
    } finally {
      setLoading(false);
    }
  }

  fetchData();
}, []);

const renderSkeleton = () => {
  return (
    <div
      className={`grid gap-4 ${
        visibleCount === 3
          ? "grid-cols-3"
          : visibleCount === 2
          ? "grid-cols-2"
          : "grid-cols-1"
      }`}
    >
      {Array.from({ length: visibleCount }).map((_, i) => (
        <div key={i} className="animate-pulse space-y-3">
          <div className="bg-gray-300 dark:bg-gray-700 h-48 rounded-md"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
      ))}
    </div>
  );
};

  

  const renderType1 = () => {
    const gridCols =
    visibleCount === 3
      ? "grid-cols-3"
      : visibleCount === 2
      ? "grid-cols-2"
      : "grid-cols-1";
      return (
    <div className={`grid gap-4 ${gridCols}`}>
      {visibleListings.map((listing, i) => {
      const isFirst = i === 0;
        const isLast = i === visibleListings.length - 1;
        const showSingleViewArrows = visibleCount === 1;
        const showMultiLeft = visibleCount === 3 && isFirst;
        const showMultiRight = visibleCount === 3 && isLast;

  return (
        <div key={listing.id} className="rounded-lg p-4 flex flex-col h-full">
          <div className="relative group">
          <img
            src={listing.image}
            alt={listing.title}
            className="w-full h-64 object-cover rounded-md "
            
          />
          
            {(showSingleViewArrows || showMultiLeft) && (
    <button
      onClick={prev}
      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 text-white drop-shadow-lg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  )}

  {/* Show RIGHT arrow only on last card when 3 visible */}
  {(showSingleViewArrows || showMultiRight) && (
    <button
      onClick={next}
      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 text-white drop-shadow-lg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )}
         
</div>
          <h4 className="mt-2 font-semibold  text-gray-900 dark:text-gray-100">{listing.title}</h4>
          <p className=" text-gray-800 dark:text-gray-100 font-bold">${listing.price}</p>
          <p className="text-sm line-clamp-3 text-gray-600 dark:text-gray-100 flex-1">{listing.description}</p>

          {loadingItems[listing.id] ? (
  <button
    disabled
    className="mt-2 self-start bg-gray-400 text-white py-2 px-4 rounded-md cursor-not-allowed"
  >
    Adding...
  </button>

) : justAdded[listing.id] ? (
  <button
    disabled
    className="mt-2 self-start bg-green-600 text-white py-2 px-4 rounded-md cursor-not-allowed"
  >
    Added ✓
  </button>

) : addedItems[listing.id] ? (
  <button
    onClick={() => onViewCart?.()}
    className="mt-2 self-start text-blue-500 hover:text-blue-600 text-xs underline cursor-pointer"
  >
    View cart
  </button>

) : (
  <button
    onClick={() => handleAddToCart(listing)}
    className="mt-2 self-start bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md cursor-pointer"
  >
    Add to cart
  </button>
)}
        </div>
  );
  })}
    </div>
  );
}

  const renderType2 = () => {
  return(
     <div className="relative group ">
       <button
    onClick={prev}
    className="absolute left-2 top-20 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition cursor-pointer"
    aria-label="Previous"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-8 text-white drop-shadow-lg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  </button>

  {/* Next */}
  <button
    onClick={next}
    className="absolute right-2 top-20 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition cursor-pointer"
    aria-label="Next"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-8 text-white drop-shadow-lg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  </button>
    <div
 className={`grid gap-4 ${
  visibleCount === 3
    ? "grid-cols-3"
    : visibleCount === 2
    ? "grid-cols-2"
    : "grid-cols-1"
}`}
>
      {visibleListings.map((listing) => (
       <div key={listing.id} className="transition">
          <img
            src={listing.image}
            alt={listing.title}
            className="w-full h-48 object-cover"
            
          />
            <div className="p-4 flex flex-col gap-2">
          <h4 className="text-sm text-gray-900 dark:text-gray-100 font-semibold line-clamp-2 min-h-[40px]">
            {listing.title}
          </h4>

          {/* Price row aligned equal */}
          <p className="text-base text-gray-800 dark:text-gray-100 font-bold  min-h-[24px]">
           ${listing.price}
          </p>

          <p className="text-sm line-clamp-3 text-gray-600 dark:text-gray-100 flex-1">
            {listing.description}
          </p>
         
           {loadingItems[listing.id] ? (
  <button
    disabled
    className="mt-2 self-start bg-gray-400 text-white py-2 px-4 rounded-md cursor-not-allowed"
  >
    Adding...
  </button>

) : justAdded[listing.id] ? (
  <button
    disabled
    className="mt-2 self-start bg-green-600 text-white py-2 px-4 rounded-md cursor-not-allowed"
  >
    Added ✓
  </button>

) : addedItems[listing.id] ? (
  <button
    onClick={() => onViewCart?.()}
    className="mt-2 self-start text-blue-500 hover:text-blue-600 text-xs underline cursor-pointer"
  >
    View cart
  </button>

) : (
  <button
    onClick={() => handleAddToCart(listing)}
    className="mt-2 self-start bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md cursor-pointer"
  >
    Add to cart
  </button>
)}
          </div>
        </div>
      ))}
    </div>
    </div>
  );
  };
  return (
     <div className="mx-auto w-full max-w-4xl px-2 pb-4 ">
    <div className="relative flex w-full flex-col gap-4">
    
      <div className="w-full overflow-hidden shadow-xs rounded-xl border p-3">
      <h3 className="mb-3 text-sm font-semibold  text-gray-900 dark:text-gray-100">
        Featured Listings
      </h3>
 {loading
  ? renderSkeleton()
  : style === "type1"
  ? renderType1()
  : renderType2()}
</div>
</div>
</div>
  );
}
