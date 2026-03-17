"use client";

import { useEffect, useState } from "react";

type Listing = {
  _id:number;
  title: string;
  price: string;
  image: string;
  description: string;
  link:string
};
type ListingsCarouselProps = {
  onViewCart?:()=>void;
  isExpanded?: boolean;
  parentWidth?: number;
};

export function ListingsCarousel({
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
   const visibleCount = (() => {
  if (isMobile) return 1;
  if (isExpanded) return 3;
  return 1;
})();
  const next = () => setIndex((i) => (i + visibleCount) % total);
  const prev = () => setIndex((i) => (i - visibleCount + total) % total);
  const visibleListings = Array.from({ length: visibleCount })
  .map((_, i) => products[(index + i) % total])
  .filter(Boolean);


  async function getProducts() {
  const res = await fetch("/api/products");

  if (!res.ok) {
     console.error(await res.text());
    throw new Error("Failed to fetch products");
  }
 
  const data = await res.json();
  return data;
}

async function fetchCart() {
  const res = await fetch("/api/cart");

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch cart: ${res.status} ${text}`);
  }

  const data = await res.json(); // this is already an array

  const cartLookup: Record<string, boolean> = {};

  data.forEach((item: any) => {
    cartLookup[item._id] = true;
  });

  setCartItems(cartLookup);
  setAddedItems(cartLookup);
}

 useEffect(() => {
  setIndex(0);
}, [ isExpanded,isMobile]);

 

const handleAddToCart = async (listing: any) => {
  try {
    setLoadingItems((prev) => ({ ...prev, [listing._id]: true }));
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(listing),
    });

    if (!res.ok) {
      throw new Error("Failed to add to cart");
    }

     await res.json();
     setLoadingItems((prev) => ({ ...prev, [listing._id]: false }));
    
     
      setJustAdded((prev) => ({ ...prev, [listing._id]: true }));

      setTimeout(() => {
        setJustAdded((prev) => ({ ...prev, [listing._id]: false }));
        setAddedItems((prev) => ({ ...prev, [listing._id]: true }));
      }, 1000);
   

  } catch (error) {
    console.error("Add to cart error:", error);
    setLoadingItems((prev) => ({ ...prev, [listing._id]: false }));

  } 
};
    

useEffect(() => {
  async function fetchData() {
    try {
      setLoading(true);

      const productsData = await getProducts();
      await fetchCart();

      setProducts(productsData);
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

  

  const renderType = () => {
    const gridCols =
    visibleCount === 3
      ? "grid-cols-3"
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
        <div key={listing._id} className="rounded-lg p-4 flex flex-col h-full">
          <div className="relative group">
          <img
            src={listing.image}
            alt={listing.title}
            className="w-full aspect-[4/3] object-cover rounded-md"
            
          />
          
            {(showSingleViewArrows || showMultiLeft) && (
    <button
      onClick={prev}
      className="absolute left-3 top-1/2 -translate-y-1/2 z-20 
opacity-0 group-hover:opacity-100 transition 
bg-white/40  backdrop-blur-sm 
rounded-full p-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 text-white drop-shadow-lg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="black"
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
      className="absolute right-3 top-1/2 -translate-y-1/2 z-20 
opacity-0 group-hover:opacity-100 transition 
bg-white/40  backdrop-blur-sm 
rounded-full p-2"
>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 text-white drop-shadow-lg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="black"
        strokeWidth={3}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )}
         
</div>
          <h4 className="mt-2 font-semibold  text-gray-900 dark:text-gray-100">{listing.title}</h4>
          <p className=" text-gray-800 dark:text-gray-100 font-bold">${listing.price}</p>
          <p className="text-sm line-clamp-3 text-gray-600 dark:text-gray-100 ">{listing.description}</p>
          <div className="mt-auto pt-2 flex gap-3">
  
  <button
    onClick={() => window.open(listing.link, "_blank")}
    className="flex-1 bg-gray-200 hover:bg-gray-300 cursor-pointer 
    dark:bg-gray-700 dark:hover:bg-gray-600 
    text-gray-900 dark:text-white py-2 px-3 rounded-md text-sm"
  >
    View Product
  </button>

  {loadingItems[listing._id] ? (
    <button
      disabled
      className="flex-1 bg-gray-400 text-white py-2 px-3 rounded-md cursor-not-allowed"
    >
      Adding...
    </button>

  ) : justAdded[listing._id] ? (
    <button
      disabled
      className="flex-1 bg-green-600 text-white py-2 px-3 rounded-md cursor-not-allowed"
    >
      Added ✓
    </button>

  ) : addedItems[listing._id] ? (
    <button
      onClick={() => onViewCart?.()}
      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-md"
    >
      View Cart
    </button>

  ) : (
    <button
      onClick={() => handleAddToCart(listing)}
      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md"
    >
      Add to Cart
    </button>
  )}

</div>
        </div>
  );
  })}
    </div>
  );
}

  
  return (
     <div className="mx-auto w-full max-w-4xl px-2 rounded-xl border p-3 pb-4 ">
    <div className="relative flex w-full flex-col gap-4">
    
      <div className="w-full overflow-hidden shadow-xs ">
      <h3 className="mb-3 text-sm font-semibold  text-gray-900 dark:text-gray-100">
        Featured Listings
      </h3>
{loading ? renderSkeleton() : renderType()}
</div>
</div>
</div>
  );
}
