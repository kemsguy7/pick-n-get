import React from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';

export interface ProductCardProps {
  id: string;
  image: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  brand: string;
  inStock: number;
  recycledPercentage: number;
  isVerified: boolean;
  ecoTokens?: number;
  freeShipping?: boolean;
  shippingThreshold?: number;
  onAddToCart?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  isFavorited?: boolean;
}

export default function ProductCard({
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
    <div className="group overflow-hidden rounded-xl border border-slate-700/50 bg-black/80 transition-all duration-200 hover:border-green-500/30">
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden">
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

        {/* Badges */}
        <div className="font-inter absolute top-3 left-3 flex flex-col gap-2 font-medium">
          <div className="bg-light-green text-primary rounded-lg border-[0.5px] border-[#000000] px-6 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {recycledPercentage}% Recycled
          </div>
          {isVerified && (
            <div className="flex items-center gap-1 rounded-lg border-[0.5px] border-[#000000] bg-blue-100 px-2 py-1 text-xs text-[#2563ED] backdrop-blur-sm">
              <div className="flex h-3 w-3 items-center justify-center">
                <div className="h-1.5 w-1.5"></div>
              </div>
              Verified
            </div>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => onToggleFavorite?.(id)}
          className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-md bg-white backdrop-blur-sm transition-all duration-200 hover:bg-red-500/70"
        >
          <Heart
            className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-black'}`}
          />
        </button>
      </div>

      {/* Content Section */}
      <div className="space-y-3 p-4">
        {/* Product Name */}
        <h3 className="font-space-grotesk text-lg leading-tight font-medium text-white">{name}</h3>

        {/* Description */}
        <p className="secondary-text font-inter line-clamp-2 text-sm">{description}</p>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="space text-sm font-medium text-white">{rating}</span>
          </div>
          <span className="secondary-text font-inter text-sm font-normal text-gray-400">
            ({reviewCount} reviews)
          </span>
        </div>

        {/* Brand */}
        <p className="font-inter text-xs font-medium">
          {' '}
          <span className="secondary-text"> by</span> {brand}
        </p>

        {/* Price Section */}
        <div className="flex items-center gap-2">
          <span className="font-space-grotesk text-xl font-bold text-white">
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
            <div className="h-4 w-4 rounded-full bg-green-500"></div>
            <span>{ecoTokens}ECO or pay with tokens</span>
          </div>
        )}

        {/* Stock Info */}
        <p className="text-sm text-gray-400">{inStock} in stock</p>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart?.(id)}
          className="gradient-button flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-semibold text-black transition-all duration-200 hover:shadow-lg"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </button>

        {/* Shipping Info */}
        {freeShipping && shippingThreshold && (
          <p className="text-center text-xs text-gray-400">
            Free shipping on orders over {currency}
            {shippingThreshold.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
