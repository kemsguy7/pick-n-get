'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '../components/layout/AppLayout';
import StatCard, { StatCardProps } from '../components/ui/statCard';
import { useWalletInterface } from '../services/wallets/useWalletInterface';

import {
  Package,
  DollarSign,
  Star,
  TrendingUp,
  Eye,
  ShoppingCart,
  BarChart3,
  Leaf,
  Plus,
  Edit,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface VendorStats {
  totalProducts: number;
  totalRevenue: number;
  totalSales: number;
  avgRating: number;
  monthlyGrowth: number;
}

interface Product {
  productId: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  imageUrl: string;
  imageFileId?: string;
  recycledPercentage?: number;
  status: string;
  createdAt: string;
}

interface Order {
  orderId: string;
  customerName: string;
  productName: string;
  quantity: number;
  totalAmount: number;
  status: string;
  orderDate: string;
  deliveryAddress: string;
}

export default function VendorDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { accountId, walletInterface } = useWalletInterface();
  const isConnected = !!(accountId && walletInterface);

  // Fetch vendor stats
  const fetchStats = useCallback(async () => {
    if (!accountId) return;

    try {
      const response = await fetch(`${baseUrl}/products/vendors/${accountId}/stats`);

      if (response.status === 404) {
        // ✅ Vendor not found, use empty stats
        setStats({
          totalProducts: 0,
          totalRevenue: 0,
          totalSales: 0,
          avgRating: 0,
          monthlyGrowth: 0,
        });
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      } else {
        throw new Error('Failed to fetch stats');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Fallback to empty stats
      setStats({
        totalProducts: 0,
        totalRevenue: 0,
        totalSales: 0,
        avgRating: 0,
        monthlyGrowth: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [accountId]);
  // Fetch vendor products
  const fetchProducts = useCallback(async () => {
    if (!accountId) return;

    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/products/vendors/${accountId}/products`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.data.products || []);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error('Error loading products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  // Fetch vendor orders
  const fetchOrders = useCallback(async () => {
    if (!accountId) return;

    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/products/vendors/${accountId}/orders`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.data.orders || []);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error loading orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    if (accountId) {
      fetchStats();
    }
  }, [accountId, fetchStats]);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    }
  }, [activeTab, fetchProducts]);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, fetchOrders]);

  //Add role checking
  useEffect(() => {
    const checkVendorRole = async () => {
      if (!accountId) return;

      try {
        const response = await fetch(`${baseUrl}/auth/check-wallet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ walletAddress: accountId }),
        });

        const data = await response.json();

        if (!data.data.roles.includes('Vendor') && !data.data.vendorData) {
          router.push('/auth/signup/vendor');
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Role check failed';
        console.error(err);
        setError(errorMsg);
      }
    };

    if (isConnected) {
      checkVendorRole();
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, accountId]);

  // Check wallet connection
  if (!isConnected) {
    return (
      <AppLayout>
        <div className="flex min-h-screen items-center justify-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-yellow-400" />
          <h2 className="mb-4 text-2xl font-bold text-yellow-400">Connect Wallet</h2>
          <p className="text-gray-400">
            Please connect your wallet to access the vendor dashboard.
          </p>
        </div>
      </AppLayout>
    );
  }
  // Check wallet connection
  if (!isConnected) {
    return (
      <AppLayout>
        <div className="flex min-h-screen items-center justify-center">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-yellow-400" />
          <h2 className="mb-4 text-2xl font-bold text-yellow-400">Connect Wallet</h2>
          <p className="text-gray-400">
            Please connect your wallet to access the vendor dashboard.
          </p>
        </div>
      </AppLayout>
    );
  }

  const statsData: StatCardProps[] = [
    {
      icon: Package,
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-100',
      title: 'Total Products',
      titleColor: 'text-green-600',
      value: stats?.totalProducts.toString() || '0',
      valueColor: 'text-green-600',
      subtitle: products.length > 0 ? `${products.length} active` : 'Add your first product',
      subtitleColor: 'text-green-500',
      backgroundColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      icon: DollarSign,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100',
      title: 'Total Revenue',
      titleColor: 'text-blue-600',
      value: `${stats?.totalRevenue.toFixed(2) || '0.00'} HBAR`,
      valueColor: 'text-blue-600',
      subtitle: stats?.monthlyGrowth ? `+${stats.monthlyGrowth}% this month` : 'Start selling',
      subtitleColor: 'text-blue-500',
      backgroundColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      icon: ShoppingCart,
      iconColor: 'text-purple-600',
      iconBgColor: 'bg-purple-100',
      title: 'Total Sales',
      titleColor: 'text-purple-600',
      value: stats?.totalSales.toString() || '0',
      valueColor: 'text-purple-600',
      subtitle: orders.length > 0 ? `${orders.length} orders` : 'No orders yet',
      subtitleColor: 'text-purple-500',
      backgroundColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      icon: Star,
      iconColor: 'text-yellow-600',
      iconBgColor: 'bg-yellow-100',
      title: 'Avg Rating',
      titleColor: 'text-yellow-600',
      value: stats?.avgRating ? stats.avgRating.toFixed(1) : 'N/A',
      valueColor: 'text-yellow-600',
      subtitle: stats?.avgRating ? 'Excellent reviews' : 'No reviews yet',
      subtitleColor: 'text-yellow-500',
      backgroundColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
    },
  ];

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Eye },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'sustainability', label: 'Sustainability', icon: Leaf },
  ];

  return (
    <AppLayout showHeader={true} showSidebar={true} showFooter={true}>
      <div className="dashboard-container min-h-screen p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-primary font-space-grotesk mb-2 flex items-center gap-3 text-2xl font-bold lg:text-3xl">
                Vendor Dashboard
                <Package className="h-6 w-6 text-green-400 lg:h-8 lg:w-8" />
              </h1>
              <p className="secondary-text font-inter text-lg">Eco-friendly product vendor</p>
              <div className="mt-1 flex items-center gap-3 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  Connected
                </span>
                <span>•</span>
                <span className="truncate font-mono text-xs">{accountId}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/vendors/add-product')}
              className="gradient-button flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-black transition-all hover:opacity-90"
            >
              <Plus className="h-5 w-5" />
              Add Product
            </button>
          </div>

          {/* Stats */}
          <div className="stats-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {statsData.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Tabs */}
          <div className="tab-nav flex gap-1 overflow-x-auto rounded-lg bg-[#1a2928] p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-w-0 flex-1 items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-primary bg-[#EDFFF3]'
                    : 'lighter-green-text hover:bg-white/10 hover:text-white'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'dashboard' && <DashboardTab stats={stats} />}
            {activeTab === 'products' && (
              <ProductsTab
                products={products}
                loading={loading}
                error={error}
                onRefresh={fetchProducts}
              />
            )}
            {activeTab === 'orders' && (
              <OrdersTab orders={orders} loading={loading} error={error} />
            )}
            {activeTab === 'analytics' && <AnalyticsTab stats={stats} />}
            {activeTab === 'sustainability' && <SustainabilityTab />}
          </div>
        </div>
      </div>
    </AppLayout>
  );

  function DashboardTab({ stats }: { stats: VendorStats | null }) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#A5D6A74D] bg-black p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <h3 className="font-space-grotesk font-semibold text-white">Performance Overview</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-400">Products Listed</span>
                <span className="font-medium text-white">{stats?.totalProducts || 0}</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-700">
                <div
                  className="h-3 rounded-full bg-green-500"
                  style={{ width: `${Math.min((stats?.totalProducts || 0) * 10, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-400">Total Sales</span>
                <span className="font-medium text-white">{stats?.totalSales || 0} orders</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-700">
                <div
                  className="h-3 rounded-full bg-purple-500"
                  style={{ width: `${Math.min((stats?.totalSales || 0) * 5, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#A5D6A74D] bg-black p-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            <h3 className="font-space-grotesk font-semibold text-white">Quick Actions</h3>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/vendors/add-product')}
              className="w-full rounded-lg bg-green-600 p-3 text-left text-white transition-colors hover:bg-green-700"
            >
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                <span className="font-medium">Add New Product</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className="w-full rounded-lg bg-blue-600 p-3 text-left text-white transition-colors hover:bg-blue-700"
            >
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                <span className="font-medium">View All Products</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className="w-full rounded-lg bg-purple-600 p-3 text-left text-white transition-colors hover:bg-purple-700"
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span className="font-medium">Check Orders</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  function ProductsTab({
    products,
    loading,
    error,
    onRefresh,
  }: {
    products: Product[];
    loading: boolean;
    error: string;
    onRefresh: () => void;
  }) {
    if (loading) {
      return (
        <div className="rounded-2xl border border-[#A5D6A74D] bg-black p-12 text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-green-400" />
          <p className="text-gray-300">Loading products...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-2xl border border-red-500/30 bg-black p-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <p className="mb-4 text-red-400">{error}</p>
          <button
            onClick={onRefresh}
            className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="rounded-2xl border border-[#A5D6A74D] bg-black p-12 text-center">
          <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="mb-4 text-gray-400">No products yet</p>
          <button
            onClick={() => router.push('/vendors/add-product')}
            className="gradient-button rounded-lg px-6 py-2 font-semibold text-black"
          >
            Add Your First Product
          </button>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-[#A5D6A74D] bg-black p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-space-grotesk font-semibold text-white">
            Product Inventory ({products.length})
          </h3>
          <div className="flex gap-2">
            <button
              onClick={onRefresh}
              className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
            >
              Refresh
            </button>
            <button
              onClick={() => router.push('/vendors/add-product')}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.productId}
              className="overflow-hidden rounded-lg border border-slate-700/50 bg-slate-900/50 transition-all hover:border-green-500/50"
            >
              <div className="relative aspect-square bg-slate-800">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23334155" width="200" height="200"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="14" x="50%" y="50%" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-12 w-12 text-gray-600" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      product.status === 'Available'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {product.status}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h4 className="font-space-grotesk mb-2 font-medium text-white">{product.name}</h4>
                <p className="mb-3 line-clamp-2 text-sm text-gray-400">{product.description}</p>

                <div className="mb-3 flex items-center justify-between">
                  <span className="font-space-grotesk text-lg font-bold text-white">
                    {product.price} HBAR
                  </span>
                  <span className="text-sm text-gray-400">Stock: {product.quantity}</span>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
                    <Edit className="mx-auto h-4 w-4" />
                  </button>
                  <button className="flex-1 rounded-lg bg-slate-700 px-3 py-2 text-sm font-medium text-white hover:bg-slate-600">
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function OrdersTab({
    orders,
    loading,
    error,
  }: {
    orders: Order[];
    loading: boolean;
    error: string;
  }) {
    if (loading) {
      return (
        <div className="rounded-2xl border border-[#A5D6A74D] bg-black p-12 text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-green-400" />
          <p className="text-gray-300">Loading orders...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-2xl border border-red-500/30 bg-black p-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <p className="text-red-400">{error}</p>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="rounded-2xl border border-[#A5D6A74D] bg-black p-12 text-center">
          <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <p className="text-gray-400">No orders yet</p>
        </div>
      );
    }

    return (
      <div className="rounded-2xl border border-[#A5D6A74D] bg-black p-6">
        <h3 className="font-space-grotesk mb-6 font-semibold text-white">
          Recent Orders ({orders.length})
        </h3>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.orderId}
              className="rounded-lg border border-slate-700/50 bg-slate-900/50 p-4 transition-all hover:border-green-500/30"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-space-grotesk font-medium text-white">
                    {order.customerName}
                  </h4>
                  <p className="text-sm text-gray-400">{order.productName}</p>
                  <p className="text-xs text-gray-500">
                    Qty: {order.quantity} • {new Date(order.orderDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-space-grotesk font-bold text-white">
                    {order.totalAmount.toFixed(2)} HBAR
                  </p>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      order.status === 'Delivered'
                        ? 'bg-green-500/20 text-green-400'
                        : order.status === 'Processing'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function AnalyticsTab({ stats }: { stats: VendorStats | null }) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#A5D6A74D] bg-black p-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            <h3 className="font-space-grotesk font-semibold text-white">Sales Analytics</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-400">Monthly Revenue</span>
                <span className="font-medium text-white">
                  {stats?.totalRevenue.toFixed(2) || '0.00'} HBAR
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-700">
                <div className="h-2 rounded-full bg-green-500" style={{ width: '65%' }}></div>
              </div>
            </div>

            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-400">Growth Rate</span>
                <span className="font-medium text-white">+{stats?.monthlyGrowth || 0}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-700">
                <div
                  className="h-2 rounded-full bg-blue-500"
                  style={{ width: `${stats?.monthlyGrowth || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#A5D6A74D] bg-black p-6">
          <div className="mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-400" />
            <h3 className="font-space-grotesk font-semibold text-white">Revenue Breakdown</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <p className="font-space-grotesk text-xl font-bold text-green-600">
                {stats?.totalRevenue.toFixed(2) || '0.00'}
              </p>
              <p className="font-inter text-sm text-green-600">Total Revenue</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4 text-center">
              <p className="font-space-grotesk text-xl font-bold text-blue-600">
                {stats?.totalProducts || 0}
              </p>
              <p className="font-inter text-sm text-blue-600">Products</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function SustainabilityTab() {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-green-200 bg-[#DCFCE7] p-6">
          <div className="mb-4 flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            <h3 className="font-space-grotesk font-semibold text-green-900">
              Sustainability Impact
            </h3>
          </div>

          <div className="mb-6 text-center">
            <p className="font-space-grotesk text-6xl font-bold text-green-600">
              {products.length > 0 ? '95%' : '0%'}
            </p>
            <p className="font-inter text-green-700">
              {products.length > 0
                ? 'Excellent sustainability practices'
                : 'Start listing eco-friendly products'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-white p-4 text-center">
              <p className="font-space-grotesk text-2xl font-bold text-green-600">
                {products.length > 0 ? '85%' : '0%'}
              </p>
              <p className="font-inter text-sm text-green-600">Recycled Materials</p>
            </div>
            <div className="rounded-lg bg-white p-4 text-center">
              <p className="font-space-grotesk text-2xl font-bold text-blue-600">
                {products.length > 0 ? '92%' : '0%'}
              </p>
              <p className="font-inter text-sm text-blue-600">Carbon Neutral</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
