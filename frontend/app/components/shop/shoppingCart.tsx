import React from 'react'
import { X, Plus, Minus, ShoppingBag } from 'lucide-react'

interface CartItem {
  id: string
  name: string
  price: number
  currency: string
  image: string
  quantity: number
  ecoTokens?: number
}

interface ShoppingCartProps {
  items: CartItem[]
  onClose: () => void
  onUpdateQuantity: (id: string, quantity: number) => void
}

export default function ShoppingCart({ items, onClose, onUpdateQuantity }: ShoppingCartProps) {
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const totalEcoTokens = items.reduce((sum, item) => sum + ((item.ecoTokens || 0) * item.quantity), 0)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-black rounded-2xl border border-[#A5D6A74D] w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white font-space-grotesk flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-green-400" />
            Shopping Cart ({items.length})
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 max-h-96">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg font-inter">Your cart is empty</p>
              <p className="text-gray-500 text-sm font-inter">Add some eco-friendly products to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-lg">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="text-white font-medium font-space-grotesk">{item.name}</h3>
                    <p className="text-green-400 font-bold font-space-grotesk">
                      {item.currency}{item.price.toFixed(2)}
                    </p>
                    {item.ecoTokens && (
                      <p className="text-green-400 text-sm">
                        {item.ecoTokens} ECO tokens available
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-4 h-4 text-white" />
                    </button>
                    
                    <span className="w-8 text-center text-white font-medium">
                      {item.quantity}
                    </span>
                    
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 bg-slate-700 hover:bg-slate-600 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-white font-space-grotesk">Total:</span>
              <span className="text-2xl font-bold text-green-400 font-space-grotesk">
                ₦{totalPrice.toFixed(2)}
              </span>
            </div>
            
            {totalEcoTokens > 0 && (
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-400">Total ECO Tokens:</span>
                <span className="text-green-400 font-medium">{totalEcoTokens} ECO</span>
              </div>
            )}

            <button className="w-full gradient-button text-black font-semibold py-4 rounded-lg font-space-grotesk text-lg">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}