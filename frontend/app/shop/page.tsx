'use client';

import { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import ProductCard, { ProductCardProps } from '../components/ui/ProductCard';
import ProductListCard from '../components/shop/ProductListCard';
import ShoppingCart from '../components/shop/shoppingCart';

import { Search, ChevronDown, ShoppingBag, Recycle, Star } from 'lucide-react';

interface CategoryFilter {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
}

interface CartItem extends ProductCardProps {
  quantity: number;
}

export default function EcoShopPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  // const [showFilters, setShowFilters] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [favoriteItems, setFavoriteItems] = useState<string[]>([]);

  // Categories
  const categories: CategoryFilter[] = [
    { id: 'all', name: 'All Categories', icon: <Recycle className="h-4 w-4" />, count: 12 },
    { id: 'bags', name: 'Bags & Accessories', icon: <ShoppingBag className="h-4 w-4" />, count: 3 },
    {
      id: 'furniture',
      name: 'Furniture',
      icon: <div className="h-4 w-4 rounded bg-green-500" />,
      count: 2,
    },
    {
      id: 'office',
      name: 'Office Supplies',
      icon: <div className="h-4 w-4 rounded bg-blue-500" />,
      count: 4,
    },
    {
      id: 'fitness',
      name: 'Fitness & Wellness',
      icon: <div className="h-4 w-4 rounded bg-purple-500" />,
      count: 2,
    },
    {
      id: 'garden',
      name: 'Home & Garden',
      icon: <div className="h-4 w-4 rounded bg-orange-500" />,
      count: 1,
    },
  ];

  // Products data
  const productsData: ProductCardProps[] = [
    {
      id: '1',
      image: '/RecycleImg1.png',
      name: 'Recycled Ocean Plastic Backpack',
      description:
        'Durable and stylish backpack made from 100% recycled ocean plastic bottles. Perfect for daily use with multiple compartments.',
      price: 95.99,
      currency: '₦',
      originalPrice: 120.0,
      rating: 4.7,
      reviewCount: 127,
      brand: 'EcoCarr Lagos',
      inStock: 27,
      recycledPercentage: 95,
      isVerified: true,
      ecoTokens: 580,
      freeShipping: true,
      shippingThreshold: 50000,
    },
    {
      id: '2',
      image: '/RecycleImg2.png',
      name: 'Tire Ottoman Seat',
      description:
        'Comfortable ottoman made from upcycled car tires with eco-friendly cushioning and modern design.',
      price: 205.99,
      currency: '₦',
      rating: 4.6,
      reviewCount: 97,
      brand: 'Sustainable Furniture Co.',
      inStock: 24,
      recycledPercentage: 95,
      isVerified: true,
      ecoTokens: 920,
      freeShipping: true,
      shippingThreshold: 50000,
    },
    {
      id: '3',
      image: '/RecycleImg3.png',
      name: 'Recycled Paper Desk Organizer',
      description:
        'Multi-compartment desk organizer made from 100% recycled paper. Lightweight yet sturdy design.',
      price: 54.99,
      currency: '₦',
      rating: 4.8,
      reviewCount: 156,
      brand: 'Green Office Solutions',
      inStock: 45,
      recycledPercentage: 85,
      isVerified: true,
      ecoTokens: 500,
      freeShipping: true,
      shippingThreshold: 50000,
    },
    {
      id: '4',
      image: '/YogaMat.jpeg',
      name: 'Eco Yoga Mat - Recycled Rubber',
      description:
        'Premium yoga mat made from recycled rubber tires with excellent grip, cushioning and durability.',
      price: 75.99,
      currency: '₦',
      rating: 4.9,
      reviewCount: 203,
      brand: 'Zen Eco Products',
      inStock: 18,
      recycledPercentage: 90,
      isVerified: true,
      ecoTokens: 450,
      freeShipping: true,
      shippingThreshold: 50000,
    },
    {
      id: '5',
      image: '/RecycleImg5.png',
      name: 'Recycled Plastic Garden Planter',
      description:
        'Durable outdoor planter made from recycled plastic waste. Weather-resistant and UV-stable.',
      price: 62.99,
      currency: '₦',
      rating: 4.3,
      reviewCount: 89,
      brand: 'Garden Green',
      inStock: 23,
      recycledPercentage: 85,
      isVerified: true,
      ecoTokens: 400,
      freeShipping: true,
      shippingThreshold: 50000,
    },
    {
      id: '6',
      image: '/RecycleImg6.png',
      name: 'Upcycled Denim Tote Bag',
      description:
        'Stylish tote bag made from upcycled denim fabric. Each bag is unique with its own wash pattern.',
      price: 95.99,
      currency: '₦',
      rating: 4.7,
      reviewCount: 134,
      brand: 'Sustainable Style',
      inStock: 31,
      recycledPercentage: 100,
      isVerified: true,
      ecoTokens: 550,
      freeShipping: true,
      shippingThreshold: 50000,
    },
  ];

  const handleAddToCart = (productId: string) => {
    const product = productsData.find((p) => p.id === productId);
    if (product) {
      setCartItems((prev) => {
        const existingItem = prev.find((item) => item.id === productId);
        if (existingItem) {
          return prev.map((item) =>
            item.id === productId ? { ...item, quantity: item.quantity + 1 } : item,
          );
        }
        return [...prev, { ...product, quantity: 1 }];
      });
    }
  };

  const handleToggleFavorite = (productId: string) => {
    setFavoriteItems((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  };

  const filteredProducts = productsData.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || product.name.toLowerCase().includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  console.log(cartItemCount);

  return (
    <AppLayout showHeader={true} showSidebar={true} showFooter={true}>
      <div className="dashboard-container min-h-screen p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="mb-8 text-center lg:mb-12">
            <h1 className="text-primary font-space-grotesk mb-4 flex items-center justify-center gap-3 text-3xl font-bold md:text-4xl lg:text-5xl">
              EcoShop <ShoppingBag className="h-8 w-8 text-green-400 lg:h-10 lg:w-10" />
            </h1>
            <p className="secondary-text font-inter text-lg">
              Discover amazing products made from recycled materials.
            </p>
            <p className="secondary-text font-inter text-sm">
              Every purchase supports the circular economy
            </p>
          </div>

          {/* Featured Products Pills */}
          <div className="mb-6 flex flex-wrap justify-center gap-2">
            <span className="text-primary rounded-full bg-[#DCFCE7] px-4 py-2 text-sm font-medium">
              100% Eco-Friendly
            </span>
            <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-600">
              Verified Vendors
            </span>
            <span className="rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-600">
              Pay with ECO Tokens
            </span>
            <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-600">
              Carbon-Neutral Shipping
            </span>
          </div>

          {/* Featured Products Section */}
          <div>
            <h2 className="font-space-grotesk mb-6 flex items-center gap-2 text-2xl font-bold text-white">
              <Star className="h-6 w-6 text-yellow-400" />
              Featured Products
            </h2>

            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Featured Product 1 */}
              <div className="relative overflow-hidden rounded-2xl border border-[#A5D6A74D] bg-slate-800">
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                  <span className="flex items-center gap-1 rounded-lg bg-green-100 px-3 py-1 text-xs font-medium text-green-600">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    Featured Eco Product
                  </span>
                  <span className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-medium text-blue-600">
                    95% Recycled
                  </span>
                </div>

                <div className="flex">
                  <div className="w-1/2 p-6">
                    <img
                      src="/RecycleImg1.png"
                      alt="Recycled Ocean Plastic Backpack"
                      className="h-64 w-full rounded-lg object-cover"
                    />
                  </div>

                  <div className="flex w-1/2 flex-col justify-between p-6">
                    <div>
                      <h3 className="font-space-grotesk mb-3 text-xl font-bold text-white">
                        Recycled Ocean Plastic Backpack
                      </h3>
                      <p className="font-inter mb-4 text-sm text-gray-300">
                        Durable and stylish backpack made from 100% recycled ocean plastic bottles.
                        Perfect for daily use with multiple compartments.
                      </p>

                      <div className="mb-4 flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-white">4.8</span>
                        <span className="text-sm text-gray-400">(127 reviews)</span>
                      </div>

                      <div className="mb-4 flex items-center gap-4 text-xs text-gray-300">
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-green-500"></div>
                          <span>89,340kg CO₂ saved</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                          <span>12.5L of water saved</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <span className="font-space-grotesk text-2xl font-bold text-white">
                            ₦65.99
                          </span>
                          <p className="text-sm text-green-400">920ECO</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">by EcoCraft Lagos</p>
                          <p className="text-xs text-gray-400">24 in stock</p>
                        </div>
                      </div>

                      <button className="gradient-button w-full rounded-lg py-3 font-semibold text-black">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Featured Product 2 */}
              <div className="relative overflow-hidden rounded-2xl border border-[#A5D6A74D] bg-slate-800">
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                  <span className="flex items-center gap-1 rounded-lg bg-green-100 px-3 py-1 text-xs font-medium text-green-600">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    Featured Eco Product
                  </span>
                  <span className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-medium text-blue-600">
                    95% Recycled
                  </span>
                </div>

                <div className="flex">
                  <div className="w-1/2 p-6">
                    <img
                      src="/RecycleImg2.png"
                      alt="Tire Ottoman Seat"
                      className="h-64 w-full rounded-lg object-cover"
                    />
                  </div>

                  <div className="flex w-1/2 flex-col justify-between p-6">
                    <div>
                      <h3 className="font-space-grotesk mb-3 text-xl font-bold text-white">
                        Tire Ottoman Seat
                      </h3>
                      <p className="font-inter mb-4 text-sm text-gray-300">
                        Comfortable ottoman made from upcycled car tires with eco-friendly
                        cushioning. Perfect for modern living spaces.
                      </p>

                      <div className="mb-4 flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-white">4.6</span>
                        <span className="text-sm text-gray-400">(89 reviews)</span>
                      </div>

                      <div className="mb-4 flex items-center gap-4 text-xs text-gray-300">
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-green-500"></div>
                          <span>15.7kg CO₂ saved</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                          <span>45L of water saved</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <span className="font-space-grotesk text-2xl font-bold text-white">
                            ₦89.99
                          </span>
                          <p className="text-sm text-green-400">1800ECO</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">by Sustainable Furniture Co.</p>
                          <p className="text-xs text-gray-400">12 in stock</p>
                        </div>
                      </div>

                      <button className="gradient-button w-full rounded-lg py-3 font-semibold text-black">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search, Filters & View Toggle */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <input
                type="text"
                placeholder="Search eco-friendly products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 py-3 pr-4 pl-10 text-white placeholder-gray-400 transition-colors focus:border-green-500 focus:outline-none"
              />
            </div>

            {/* Category & Sort Dropdowns */}
            <div className="flex gap-4">
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none rounded-lg border border-[#D9D9D94D] bg-slate-800 px-4 py-3 pr-8 text-white focus:border-green-500 focus:outline-none"
                  style={{ backdropFilter: 'blur(4px)' }}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none rounded-lg border border-[#D9D9D94D] bg-slate-800 px-4 py-3 pr-8 text-white focus:border-green-500 focus:outline-none"
                  style={{ backdropFilter: 'blur(4px)' }}
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Most Eco-Friendly</option>
                </select>
                <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              </div>
            </div>
          </div>

          {/* Shop by Category */}
          <div>
            <h2 className="font-space-grotesk mb-6 text-2xl font-bold text-white">
              Shop by Category
            </h2>
            <p className="secondary-text font-inter mb-6">
              Select the type of materials you want to recycle. Each category has different rates
              and requirements.
            </p>

            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {categories.slice(1).map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`rounded-xl border p-4 text-center transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'border-green-500 bg-green-500/20 text-green-400'
                      : 'border-slate-600 bg-slate-800 text-white hover:border-green-500/50'
                  }`}
                >
                  <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center">
                    {category.icon}
                  </div>
                  <p className="font-inter text-sm font-medium">{category.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* View Toggle and Products Count */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                List View
              </button>
            </div>

            <span className="text-sm text-gray-400">{filteredProducts.length} products found</span>
          </div>

          {/* Products Grid/List */}
          <div>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    {...product}
                    onAddToCart={handleAddToCart}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorited={favoriteItems.includes(product.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <ProductListCard
                    key={product.id}
                    {...product}
                    onAddToCart={handleAddToCart}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorited={favoriteItems.includes(product.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Shopping Impact */}
          <div className="mt-12 rounded-2xl border border-green-200 bg-[#DCFCE7] p-6">
            <h3 className="text-primary font-space-grotesk mb-4 flex items-center gap-2 font-semibold">
              <Recycle className="h-5 w-5" />
              Your Shopping Impact
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-white p-4 text-center">
                <p className="font-space-grotesk text-2xl font-bold text-green-600">0kg</p>
                <p className="font-inter text-sm text-green-600">CO₂ Saved</p>
              </div>
              <div className="rounded-lg bg-white p-4 text-center">
                <p className="font-space-grotesk text-2xl font-bold text-blue-600">0L</p>
                <p className="font-inter text-sm text-blue-600">Water Saved</p>
              </div>
              <div className="rounded-lg bg-white p-4 text-center">
                <p className="font-space-grotesk text-2xl font-bold text-purple-600">0kg</p>
                <p className="font-inter text-sm text-purple-600">Waste Diverted</p>
              </div>
            </div>

            <p className="font-inter mt-4 text-center text-sm text-gray-600">
              Every purchase supports sustainable manufacturing and helps reduce environmental
              impact.
            </p>
          </div>
        </div>
      </div>

      {/* Shopping Cart Modal */}
      {showCart && (
        <ShoppingCart
          items={cartItems}
          onClose={() => setShowCart(false)}
          onUpdateQuantity={(id, quantity) => {
            if (quantity === 0) {
              setCartItems((prev) => prev.filter((item) => item.id !== id));
            } else {
              setCartItems((prev) =>
                prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
              );
            }
          }}
        />
      )}
    </AppLayout>
  );
}
