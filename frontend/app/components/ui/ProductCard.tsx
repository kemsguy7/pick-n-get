import React from 'react'
import { Heart, ShoppingCart, Star } from 'lucide-react'

export interface ProductCardProps {
  id: string
  image: string
  name: string
  description: string
  price: number
  currency: string
  originalPrice?: number
  rating: number
  reviewCount: number
  brand: string
  inStock: number
  recycledPercentage: number
  isVerified: boolean
  ecoTokens?: number
  freeShipping?: boolean
  shippingThreshold?: number
  onAddToCart?: (id: string) => void
  onToggleFavorite?: (id: string) => void
  isFavorited?: boolean
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
  isFavorited = false
}: ProductCardProps) {
  return (
    <div className="bg-black/80 rounded-xl border border-slate-700/50 overflow-hidden hover:border-green-500/30 transition-all duration-200 group">
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex font-inter font-medium flex-col gap-2">
          <div className="bg-light-green text-primary border-[#000000]  border-[0.5px] text-white px-6 py-1 rounded-lg text-xs font-medium backdrop-blur-sm">
            {recycledPercentage}% Recycled
          </div>
          {isVerified && (
            <div className="bg-blue-100 text-[#2563ED] border-[#000000]  border-[0.5px] rounded-lg px-2 py-1  text-xs  
            backdrop-blur-sm flex items-center gap-1">
              <div className="w-3 h-3 flex items-center justify-center">
                <div className="w-1.5 h-1.5 "></div>
              </div>
              Verified
            </div>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => onToggleFavorite?.(id)}
          className="absolute top-3 right-3 w-8 h-8 bg-white backdrop-blur-sm rounded-md flex items-center justify-center hover:bg-red-500/70 transition-all duration-200"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'text-black'}`} />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Product Name */}
        <h3 className="text-white font-medium  font-space-grotesk text-lg leading-tight">
          {name}
        </h3>

        {/* Description */}
        <p className="secondary-text text-sm font-inter line-clamp-2">
          {description}
        </p>

        {/* Rating & Reviews */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-white space font-medium text-sm">{rating}</span>
          </div>
          <span className="text-gray-400 secondary-text font-normal font-inter text-sm">({reviewCount} reviews)</span>
        </div>

        {/* Brand */}
        <p className="font-inter text-xs font-medium"> <span className="secondary-text"> by</span> {brand}</p>

        {/* Price Section */}
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-xl font-space-grotesk">
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
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>{ecoTokens}ECO or pay with tokens</span>
          </div>
        )}

        {/* Stock Info */}
        <p className="text-gray-400 text-sm">{inStock} in stock</p>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart?.(id)}
          className="w-full gradient-button text-black font-semibold py-3 px-4 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>

        {/* Shipping Info */}
        {freeShipping && shippingThreshold && (
          <p className="text-gray-400 text-xs text-center">
            Free shipping on orders over {currency}{shippingThreshold.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  )
}
