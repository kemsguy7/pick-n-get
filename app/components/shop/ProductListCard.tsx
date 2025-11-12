import React from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { ProductCardProps } from '../ui/ProductCard';

export default function ProductListCard({
  id,
  image,
  name,
  description,
  price,
  currency,
  originalPrice,
  rating,
  reviewCount,
  brand,
  inStock,
  recycledPercentage,
  isVerified,
  ecoTokens,
  freeShipping,
  shippingThreshold,
  onAddToCart,
  onToggleFavorite,
  isFavorited = false,
}: ProductCardProps) {
  return (
    <div className="group overflow-hidden rounded-xl border border-[#A5D6A74D] bg-black transition-all duration-200 hover:border-green-500/30">
      {/* Mobile Layout - Stack vertically on small screens */}
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        {/* Image Section */}
        <div className="relative h-48 w-full flex-shrink-0 overflow-hidden rounded-lg sm:h-32 sm:w-32">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              console.error('❌ Image failed to load:', image); // ✅ Debug log
              const target = e.target as HTMLImageElement;
              target.src =
                'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23334155" width="400" height="400"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="20" x="50%" y="50%" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          
          />

          {/* Favorite Button */}
          <button
            onClick={() => onToggleFavorite?.(id)}
            className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-md bg-white/90 backdrop-blur-sm transition-all duration-200 hover:bg-red-500/70 sm:h-6 sm:w-6"
          >
            <Heart
              className={`h-4 w-4 sm:h-3 sm:w-3 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-black'}`}
            />
          </button>
        </div>

        {/* Content Section */}
        <div className="min-w-0 flex-1 space-y-3">
          {/* Product Name */}
          <h3 className="font-space-grotesk text-lg leading-tight font-medium text-white sm:text-xl">
            {name}
          </h3>

          {/* Description */}
          <p className="secondary-text font-inter line-clamp-2 text-sm">{description}</p>

          {/* Rating & Reviews */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-white">{rating}</span>
            </div>
            <span className="text-sm text-gray-400">({reviewCount} reviews)</span>
          </div>

          {/* Badges - Stack on mobile */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-light-green text-primary rounded px-2 py-1 text-xs font-medium">
              {recycledPercentage}% Recycled
            </div>
            {isVerified && (
              <div className="rounded bg-blue-100 px-2 py-1 text-xs text-[#2563ED]">Verified</div>
            )}
          </div>

          {/* Brand */}
          <p className="font-inter text-xs font-medium">
            <span className="secondary-text">by</span> {brand}
          </p>

          {/* Price and Actions - Stack on mobile */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Price Section */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-space-grotesk text-xl font-bold text-white sm:text-2xl">
                  {currency}
                  {price.toFixed(2)}
                </span>
                {originalPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    {currency}
                    {originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* ECO Tokens */}
              {ecoTokens && (
                <div className="flex items-center gap-1 text-sm text-green-400">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-xs sm:text-sm">{ecoTokens}ECO or pay with tokens</span>
                </div>
              )}

              {/* Stock Info */}
              <p className="text-xs text-gray-400">{inStock} in stock</p>
            </div>

            {/* Action Buttons - Full width on mobile */}
            <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
              <button className="order-2 rounded-lg bg-slate-700 px-3 py-2 text-sm text-white transition-colors hover:bg-slate-600 sm:order-1">
                View Details
              </button>
              <button
                onClick={() => onAddToCart?.(id)}
                className="gradient-button order-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-black transition-all duration-200 sm:order-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </button>
            </div>
          </div>

          {/* Environmental Impact - Hide on very small screens, show on sm+ */}
          <div className="hidden items-center gap-4 text-xs text-gray-400 sm:flex">
            <span>CO₂ Saved: 2.3kg</span>
            <span>Water Saved: 12.5L</span>
          </div>

          {/* Free Shipping Info */}
          {freeShipping && shippingThreshold && (
            <p className="text-xs text-gray-400">
              Free shipping on orders over {currency}
              {shippingThreshold.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
