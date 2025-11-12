'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../components/layout/AppLayout';
import ProductCard, { ProductCardProps } from '../components/ui/ProductCard';
import ProductListCard from '../components/shop/ProductListCard';
import { Search, ChevronDown, ShoppingBag, Recycle, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1';

interface CategoryFilter {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
}

interface BackendProduct {
  _id: string;
  productId: number;
  walletAddress: string;
  name: string;
  description: string;
  category: string;
  price: number; // HBAR
  priceUSD?: number;
  quantity: number;
  weight: number;
  imageFileId: string;
  imageUrl: string;
  txHash: string;
  status: string;
  views: number;
  sales: number;
  revenue: number;
  recycledPercentage: number;
  carbonNeutral: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function EcoShopPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [favoriteItems, setFavoriteItems] = useState<string[]>([]);

  // Backend state
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Categories
  const categories: CategoryFilter[] = [
    { id: 'all', name: 'All Categories', icon: <Recycle className="h-4 w-4" />, count: 0 },
    {
      id: 'Bags & Accessories',
      name: 'Bags & Accessories',
      icon: <ShoppingBag className="h-4 w-4" />,
      count: 0,
    },
    {
      id: 'Furniture',
      name: 'Furniture',
      icon: <div className="h-4 w-4 rounded bg-green-500" />,
      count: 0,
    },
    {
      id: 'Office Supplies',
      name: 'Office Supplies',
      icon: <div className="h-4 w-4 rounded bg-blue-500" />,
      count: 0,
    },
    {
      id: 'Fitness & Wellness',
      name: 'Fitness & Wellness',
      icon: <div className="h-4 w-4 rounded bg-purple-500" />,
      count: 0,
    },
    {
      id: 'Home & Garden',
      name: 'Home & Garden',
      icon: <div className="h-4 w-4 rounded bg-orange-500" />,
      count: 0,
    },
    {
      id: 'Textiles',
      name: 'Textiles',
      icon: <div className="h-4 w-4 rounded bg-pink-500" />,
      count: 0,
    },
    {
      id: 'Electronics',
      name: 'Electronics',
      icon: <div className="h-4 w-4 rounded bg-yellow-500" />,
      count: 0,
    },
    {
      id: 'Others',
      name: 'Others',
      icon: <div className="h-4 w-4 rounded bg-gray-500" />,
      count: 0,
    },
  ];

  // Fetch products from backend
  useEffect(() => {
    fetchProducts(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');

    try {
      const categoryParam =
        selectedCategory !== 'all' ? `&category=${encodeURIComponent(selectedCategory)}` : '';
      const response = await fetch(`${BACKEND_URL}/products?status=Available${categoryParam}`);

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      let fetchedProducts = data.data.products || [];

      // Sort products
      fetchedProducts = sortProducts(fetchedProducts, sortBy);

      setProducts(fetchedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const sortProducts = (prods: BackendProduct[], sort: string): BackendProduct[] => {
    switch (sort) {
      case 'price-low':
        return [...prods].sort((a, b) => a.price - b.price);
      case 'price-high':
        return [...prods].sort((a, b) => b.price - a.price);
      case 'newest':
        return [...prods].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      case 'eco-friendly':
        return [...prods].sort((a, b) => b.recycledPercentage - a.recycledPercentage);
      default:
        return prods;
    }
  };

  const handleToggleFavorite = (productId: string) => {
    setFavoriteItems((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  };

  const handleProductClick = (productId: number) => {
    router.push(`/shop/${productId}`);
  };

  const handleAddToCart = () => {
    alert('🛒 Coming Soon! Cart and checkout features are under development.');
  };

  // Convert backend product to ProductCard format
  const convertToProductCard = (product: BackendProduct): ProductCardProps => {
    const imageUrl =
      product.imageUrl ||
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23334155" width="400" height="400"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="20" x="50%" y="50%" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';

    console.log('🖼️ Converting product:', product.name, 'Image URL:', imageUrl);

    return {
      id: product.productId.toString(),
      image: imageUrl,
      name: product.name,
      description: product.description,
      price: product.priceUSD || product.price * 0.05,
      currency: '$',
      originalPrice: undefined,
      rating: 4.5,
      reviewCount: product.views || 0,
      brand: 'Eco Vendor',
      inStock: product.quantity,
      recycledPercentage: product.recycledPercentage || 80,
      isVerified: true,
      ecoTokens: Math.floor(product.price * 100),
      freeShipping: true,
      shippingThreshold: 50,
      onAddToCart: handleAddToCart,
      onToggleFavorite: handleToggleFavorite,
      isFavorited: favoriteItems.includes(product.productId.toString()),
    };
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const productCards = filteredProducts.map(convertToProductCard);

  // Get category counts
  const categoryCounts = categories.map((cat) => ({
    ...cat,
    count:
      cat.id === 'all' ? products.length : products.filter((p) => p.category === cat.id).length,
  }));

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
              Pay with HBAR
            </span>
            <span className="rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-600">
              Blockchain Verified
            </span>
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
                  {categoryCounts.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.count})
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
                  <option value="newest">Newest First</option>
                  <option value="eco-friendly">Most Eco-Friendly</option>
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

            <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {categoryCounts.slice(1).map((category) => (
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
                  <p className="text-xs text-gray-400">({category.count})</p>
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

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-green-400" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-8 text-center">
              <p className="text-red-400">{error}</p>
              <button
                onClick={fetchProducts}
                className="mt-4 rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filteredProducts.length === 0 && (
            <div className="rounded-lg border border-slate-600 bg-slate-800 p-12 text-center">
              <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <p className="text-gray-400">No products found</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-4 rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Products Grid/List */}
          {!loading && !error && productCards.length > 0 && (
            <div>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {productCards.map((product) => (
                    <div key={product.id} onClick={() => handleProductClick(parseInt(product.id))}>
                      <ProductCard {...product} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {productCards.map((product) => (
                    <div key={product.id} onClick={() => handleProductClick(parseInt(product.id))}>
                      <ProductListCard {...product} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Shopping Impact */}
          <div className="mt-12 rounded-2xl border border-green-200 bg-[#DCFCE7] p-6">
            <h3 className="text-primary font-space-grotesk mb-4 flex items-center gap-2 font-semibold">
              <Recycle className="h-5 w-5" />
              Marketplace Impact
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-white p-4 text-center">
                <p className="font-space-grotesk text-2xl font-bold text-green-600">
                  {products.length}
                </p>
                <p className="font-inter text-sm text-green-600">Products Available</p>
              </div>
              <div className="rounded-lg bg-white p-4 text-center">
                <p className="font-space-grotesk text-2xl font-bold text-blue-600">
                  {products.reduce((sum, p) => sum + p.recycledPercentage, 0) / products.length ||
                    0}
                  %
                </p>
                <p className="font-inter text-sm text-blue-600">Avg Recycled Content</p>
              </div>
              <div className="rounded-lg bg-white p-4 text-center">
                <p className="font-space-grotesk text-2xl font-bold text-purple-600">
                  {products.filter((p) => p.carbonNeutral).length}
                </p>
                <p className="font-inter text-sm text-purple-600">Carbon Neutral</p>
              </div>
            </div>

            <p className="font-inter mt-4 text-center text-sm text-gray-600">
              Every purchase supports sustainable manufacturing and reduces environmental impact.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
