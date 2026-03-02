"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Listing = {
  _id: string;
  title: string;
  price: string;
  image: string;
  description: string;
};
type ListingsCarouselProps = {
  style?: "type1" | "type2";
  onViewCart?:()=>void;
};

export function ListingsCarousel({
  style = "type1",
  onViewCart,
}: ListingsCarouselProps) {
  const [index, setIndex] = useState(0);
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const [justAdded, setJustAdded] = useState<Record<string, boolean>>({});
  const [products, setProducts] = useState<any[]>([]);
  const [cartItems, setCartItems] = useState<Record<string, boolean>>({});
  const visibleCount = style === "type1" ? 1 : 2;
  const total = products.length;
  const router = useRouter();
  const next = () => setIndex((i) => (i + visibleCount) % total);
  const prev = () => setIndex((i) => (i - visibleCount + total) % total);
  const visibleListings = products.slice(index, index + visibleCount);


  const handleClick = (listing: Listing) => {
    router.push(`/product/${listing._id}`);
  };

  async function getProducts() {
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

async function fetchCart() {
    const res = await fetch("/api/cart");
    const data = await res.json();
    // Convert to a lookup object for fast access
    const cartLookup: Record<string, boolean> = {};
    data.forEach((item: any) => {
      cartLookup[item._id] = true;
    });
    setCartItems(cartLookup);
    setAddedItems(cartLookup);
  }

  useEffect(() => {
    setIndex(0);
  }, [style]);

 

const handleAddToCart = async (listing: any) => {
  await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(listing),
  });

  setJustAdded((prev) => ({ ...prev, [listing._id]: true }));

  setTimeout(() => {
    setJustAdded((prev) => ({ ...prev, [listing._id]: false }));
    setAddedItems((prev) => ({ ...prev, [listing._id]: true }));
  }, 2000);
};
    

useEffect(() => {
    async function fetchData() {
      try {
        const [fetchedProducts] = await Promise.all([getProducts(), fetchCart()]);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Failed to fetch products or cart:", error);
      }
    }
    fetchData();
  }, []);


  




  const renderType1 = () => (
    <div className="grid grid-cols-1 gap-4 ">
      {visibleListings.map((listing) => (
        <div key={listing._id} className="rounded-lg p-4">
          <div className="relative group">
          <img
            src={listing.image}
            alt={listing.title}
            className="w-full h-64 object-cover rounded-md "
            
          />
           <button
    onClick={prev}
    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition cursor-pointer"
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
    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 opacity-0 group-hover:opacity-100 transition cursor-pointer"
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
</div>
          <h4 className="mt-2 font-semibold  text-gray-900 dark:text-gray-100">{listing.title}</h4>
          <p className=" text-gray-800 dark:text-gray-100">{listing.price}</p>
          <p className="text-sm line-clamp-3  text-gray-600 dark:text-gray-100">{listing.description}</p>

          {justAdded[listing._id] ? (
            <button
              disabled
              className="mt-2  bg-green-600 text-white py-2 px-4 rounded-md cursor-not-allowed"
            >
              Added ✓
            </button>
          ) : addedItems[listing._id] ? (
            <button
               onClick={() => onViewCart?.()}
              className="mt-2 text-blue-500 hover:text-blue-600 text-xs underline cursor-pointer"
            >
              View cart
            </button>
          ) : (
            <button
              onClick={() => handleAddToCart(listing)}
              className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-md cursor-pointer"
            >
              Add to cart
            </button>
          )}
        </div>
      ))}
    </div>
  );

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
    <div className="grid grid-cols-2 gap-4">
      {visibleListings.map((listing) => (
       <div key={listing._id} className="border rounded-xl transition">
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
            {listing.price}
          </p>

          <p className="text-sm text-gray-600 dark:text-gray-100 line-clamp-3 flex-1">
            {listing.description}
          </p>
         
              {justAdded[listing._id] ? (
  <button
    disabled
    className="mt-2 bg-green-600 text-white py-2 px-4 rounded-md cursor-not-allowed self-start"
  >
    Added ✓
  </button>
) : addedItems[listing._id] ? (
  <button
    onClick={() => onViewCart?.()}
    className="mt-2 text-xs underline text-blue-600 d hover:text-blue-700 cursor-pointer self-start"
  >
    View cart
  </button>
) : (
  <button
    onClick={() => handleAddToCart(listing)}
    className="mt-2 bg-blue-600 text-white py-2 px-4 rounded-md cursor-pointer self-start"
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
  {style === "type1" ? renderType1() : renderType2()}
  </div>
    </div>
    </div>
    
  );
}
