import React from 'react'
import { Heart, ShoppingCart, Star } from 'lucide-react'
import { ProductCardProps } from '../ui/ProductCard'

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
  isFavorited = false
}: ProductCardProps) {
  return (
    <div className="bg-black rounded-xl border border-[#A5D6A74D] overflow-hidden hover:border-green-500/30 transition-all duration-200 group">
      {/* Mobile Layout - Stack vertically on small screens */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
        {/* Image Section */}
        <div className="relative w-full h-48 sm:w-32 sm:h-32 flex-shrink-0 overflow-hidden rounded-lg">
          <img 
            src={image} 
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Favorite Button */}
          <button
            onClick={() => onToggleFavorite?.(id)}
            className="absolute top-2 right-2 w-8 h-8 sm:w-6 sm:h-6 bg-white/90 backdrop-blur-sm rounded-md flex items-center justify-center hover:bg-red-500/70 transition-all duration-200"
          >
            <Heart className={`w-4 h-4 sm:w-3 sm:h-3 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-black'}`} />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Product Name */}
          <h3 className="text-white font-medium font-space-grotesk text-lg sm:text-xl leading-tight">
            {name}
          </h3>

          {/* Description */}
          <p className="secondary-text text-sm font-inter line-clamp-2">
            {description}
          </p>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-white font-medium text-sm">{rating}</span>
            </div>
            <span className="text-gray-400 text-sm">({reviewCount} reviews)</span>
          </div>

          {/* Badges - Stack on mobile */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-light-green text-primary px-2 py-1 rounded text-xs font-medium">
              {recycledPercentage}% Recycled
            </div>
            {isVerified && (
              <div className="bg-blue-100 text-[#2563ED] px-2 py-1 rounded text-xs">
                Verified
              </div>
            )}
          </div>

          {/* Brand */}
          <p className="font-inter text-xs font-medium">
            <span className="secondary-text">by</span> {brand}
          </p>

          {/* Price and Actions - Stack on mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Price Section */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white font-bold text-xl sm:text-2xl font-space-grotesk">
                  {currency}{price.toFixed(2)}
                </span>
                {originalPrice && (
                  <span className="text-gray-400 line-through text-sm">
                    {currency}{originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* ECO Tokens */}
              {ecoTokens && (
                <div className="flex items-center gap-1 text-green-400 text-sm">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs sm:text-sm">{ecoTokens}ECO or pay with tokens</span>
                </div>
              )}

              {/* Stock Info */}
              <p className="text-gray-400 text-xs">{inStock} in stock</p>
            </div>

            {/* Action Buttons - Full width on mobile */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <button className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg text-sm transition-colors order-2 sm:order-1">
                View Details
              </button>
              <button
                onClick={() => onAddToCart?.(id)}
                className="gradient-button text-black font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm order-1 sm:order-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
            </div>
          </div>

          {/* Environmental Impact - Hide on very small screens, show on sm+ */}
          <div className="hidden sm:flex items-center gap-4 text-xs text-gray-400">
            <span>CO₂ Saved: 2.3kg</span>
            <span>Water Saved: 12.5L</span>
          </div>

          {/* Free Shipping Info */}
          {freeShipping && shippingThreshold && (
            <p className="text-gray-400 text-xs">
              Free shipping on orders over {currency}{shippingThreshold.toLocaleString()}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}