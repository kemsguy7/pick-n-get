'use client';
import { useState } from 'react';
import { Gift } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import StatCard, { StatCardProps } from '../components/ui/statCard';
import ProductCard, { ProductCardProps } from '../components/ui/ProductCard';
import AchievementCard, { AchievementCardProps } from '../components/dashboard/AchievementCard';
import {
  Recycle,
  DollarSign,
  Leaf,
  TrendingUp,
  Sprout,
  Shield,
  Trophy,
  Globe,
  ShoppingBag,
  Activity,
  Award,
  Wallet,
  Plus,
  Eye,
} from 'lucide-react';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');

  // Stats data for different tabs
  const statsData: Record<string, StatCardProps[]> = {
    overview: [
      {
        icon: Recycle,
        iconColor: 'text-green-600',
        iconBgColor: 'bg-green-100',
        title: 'Total Recycled',
        titleColor: 'text-green-600',
        value: '47.3kg',
        valueColor: 'text-green-600',
        subtitle: '+12% from last month',
        subtitleColor: 'text-green-500',
        backgroundColor: 'bg-green-50',
        borderColor: 'border-green-200',
        trend: {
          value: '+1 trees',
          color: 'text-green-500',
          icon: TrendingUp,
        },
      },
      {
        icon: DollarSign,
        iconColor: 'text-blue-600',
        iconBgColor: 'bg-blue-100',
        title: 'Total Earned',
        titleColor: 'text-blue-600',
        value: '₦2082.50',
        valueColor: 'text-blue-600',
        subtitle: '1450 ECO tokens',
        subtitleColor: 'text-blue-500',
        backgroundColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      },
      {
        icon: Leaf,
        iconColor: 'text-green-600',
        iconBgColor: 'bg-green-100',
        title: 'CO₂ Saved',
        titleColor: 'text-green-600',
        value: '23.4kg',
        valueColor: 'text-green-600',
        subtitle: '≈ 1 trees',
        subtitleColor: 'text-green-500',
        backgroundColor: 'bg-green-50',
        borderColor: 'border-green-200',
      },
      {
        icon: TrendingUp,
        iconColor: 'text-purple-600',
        iconBgColor: 'bg-purple-100',
        title: 'Rank Progress',
        titleColor: 'text-purple-600',
        value: '65%',
        valueColor: 'text-purple-600',
        subtitle: 'To next level',
        subtitleColor: 'text-purple-500',
        backgroundColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
      },
    ],
    activity: [
      // Activity-specific stats would go here
    ],
    shop: [
      // Shop-specific stats would go here
    ],
  };

  // Products data
  const productsData: ProductCardProps[] = [
    {
      id: '1',
      image: '/RecycleImg1.png',
      name: 'Recycled Ocean Plastic Backpack',
      description:
        'Durable and stylish backpack made from 100% recycled ocean plastic bottles. Perfect for daily use.',
      price: 95.99,
      currency: '₦',
      originalPrice: 120.0,
      rating: 4.7,
      reviewCount: 124,
      brand: 'Coastal Lagos',
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
  ];

  // Achievements data
  const achievementsData: AchievementCardProps[] = [
    {
      icon: Sprout,
      title: 'First Recycler',
      status: 'earned',
      description: 'Complete your first recycling submission',
    },
    {
      icon: Shield,
      title: 'Eco Warrior',
      status: 'earned',
      description: 'Recycle 10kg of materials',
    },
    {
      icon: Trophy,
      title: 'Green Champion',
      status: 'locked',
      description: 'Recycle 50kg of materials',
    },
    {
      icon: Globe,
      title: 'Planet Saver',
      status: 'locked',
      description: 'Save 100kg of CO₂ emissions',
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'shop', label: 'Shop', icon: ShoppingBag },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
  ];

  return (
    <AppLayout showHeader={true} showSidebar={true} showFooter={true}>
      <div className="dashboard-container min-h-screen p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-6 lg:space-y-8">
          {/* Header Section */}
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-green-gradient font-space-grotesk mb-2 flex items-center gap-3 bg-transparent bg-clip-text text-3xl font-bold md:text-4xl lg:text-5xl">
                Welcome back, Adaora <Recycle className="h-8 w-8 text-green-400 lg:h-10 lg:w-10" />
              </h1>
              <p className="secondary-text font-inter text-lg">
                Your eco-impact is making a difference in Lagos
              </p>
            </div>
            <div className="flex gap-3">
              <button className="text-primary font-inter flex items-center gap-2 rounded-lg bg-[#DCFCE7] px-4 font-semibold text-white transition-colors hover:bg-white/20">
                <Trophy className="text-primary h-4 w-4" />8 - Eco Champion
              </button>
              <button className="gradient-button font-inter flex items-center gap-2 rounded-lg px-6 py-2 font-semibold text-black transition-all duration-200 hover:shadow-lg">
                <Recycle className="h-4 w-4 text-black" />
                Recycle Now
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {statsData.overview.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 overflow-x-auto rounded-lg bg-[#1a2928] p-1">
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
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'activity' && <ActivityTab />}
            {activeTab === 'shop' && <ShopTab productsData={productsData} />}
            {activeTab === 'achievements' && (
              <AchievementsTab achievementsData={achievementsData} />
            )}
            {activeTab === 'wallet' && <WalletTab />}
          </div>
        </div>
      </div>
    </AppLayout>
  );

  // Tab Components
  function OverviewTab() {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Goal Progress */}
        <div className="rounded-2xl border border-slate-700/50 bg-black/80 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Recycle className="text-primary h-5 w-5" />
            <h3 className="text-primary font-space-grotesk font-semibold text-white">
              Monthly Goal Progress
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Current Progress</span>
              <span className="font-medium text-white">32.5kg / 50kg</span>
            </div>

            <div className="h-3 w-full rounded-full bg-slate-700">
              <div className="h-3 rounded-full bg-green-500" style={{ width: '65%' }}></div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="font-medium text-green-400">65% complete</span>
              <span className="text-gray-400">17.5kg remaining</span>
            </div>
          </div>
        </div>

        {/* Environmental Impact */}
        <div className="rounded-2xl border border-slate-700/50 bg-black/80 p-6">
          <div className="text-primary mb-4 flex items-center gap-2">
            <Leaf className="h-5 w-5" />
            <h3 className="text-primary font-space-grotesk font-semibold text-white">
              Environmental Impact
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-green-50 p-4 text-center">
              <p className="font-space-grotesk text-2xl font-bold text-green-600">23.4kg</p>
              <p className="font-inter text-sm text-green-600">CO₂ Saved</p>
            </div>
            <div className="rounded-lg bg-blue-50 p-4 text-center">
              <p className="font-space-grotesk text-2xl font-bold text-blue-600">118L</p>
              <p className="font-inter text-sm text-blue-600">Water Saved</p>
            </div>
            <div className="col-span-2 rounded-lg bg-purple-50 p-4 text-center">
              <p className="font-space-grotesk text-2xl font-bold text-purple-600">1</p>
              <p className="font-inter text-sm text-purple-600">Trees equivalent</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-slate-700/50 bg-black p-6 lg:col-span-2">
          <div className="mb-6 flex items-center gap-2">
            <Recycle className="h-5 w-5 text-green-400" />
            <h3 className="font-inter font-semibold text-white">Recent Recycling Activity</h3>
          </div>

          <div className="space-y-4">
            {[
              {
                amount: '5.2kg',
                type: 'recycled',
                date: '2025-01-15 T10:30:00Z',
                status: 'completed',
                earnings: '+₦',
              },
              {
                amount: '12.5kg',
                type: 'recycled',
                date: '2025-01-18 T09:15:00Z',
                status: 'collected',
                earnings: '+₦',
              },
              {
                amount: '2.8kg',
                type: 'recycled',
                date: '2025-01-20 T16:00:00Z',
                status: 'pending',
                earnings: '+₦',
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-[#D9D9D933] p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20">
                    <Recycle className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {activity.amount} {activity.type}
                    </p>
                    <p className="font-inter text-sm font-normal text-gray-400">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-400">{activity.earnings}</p>
                  <span
                    className={`font-roboto rounded-lg px-2 py-1 text-xs font-medium ${
                      activity.status === 'completed'
                        ? 'text-info-purple bg-[#EEEEEE]'
                        : activity.status === 'collected'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function ActivityTab() {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-black p-6">
        <div className="mb-6 flex items-center gap-2">
          <Activity className="h-5 w-5 text-white" />
          <h3 className="font-space-grotesk font-semibold text-white">Recent Transaction</h3>
        </div>

        <div className="space-y-4">
          {[
            { type: 'Plastic bottles recycling', date: '2025-01-15 14:30', amount: '+₦1,008' },
            { type: 'Eco-friendly notebook', date: '2025-01-14', amount: '-15 USDC' },
            { type: 'Electronic waste', date: '2025-01-13', amount: '+₦2,008' },
          ].map((transaction, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-[#D9D9D933] p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCFCE7]">
                  <Recycle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-white">{transaction.type}</p>
                  <p className="text-sm text-gray-400">{transaction.date}</p>
                </div>
              </div>
              <span
                className={`font-semibold ${transaction.amount.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}
              >
                {transaction.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function ShopTab({ productsData }: { productsData: ProductCardProps[] }) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-space-grotesk text-xl font-semibold text-white">
            Recommended for You
          </h3>
          <button className="font-inter flex items-center gap-1 text-green-400 transition-colors hover:text-green-300">
            View All Products
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="products-grid grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {productsData.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        {/* Special Offers */}
        <div className="rounded-2xl border border-green-200 bg-[#edfff3] p-6">
          <div className="mb-4 flex items-center gap-2">
            <Gift className="primary-gradient-text h-5 w-5 text-green-600" />
            <h3 className="primary-gradient-text font-inter font-medium">Special Offers</h3>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-black bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <Recycle className="h-4 w-4 text-green-600" />
                <span className="font-inter font-medium text-green-600">Eco Starter Pack</span>
              </div>
              <p className="mb-3 text-sm text-black/60">
                Get 20% off on your first eco-product purchase
              </p>
              <div className="flex items-center justify-between">
                <span className="font-space-grotesk text-2xl font-bold text-green-600">
                  500 ECO
                </span>
                <button className="font-inter rounded-lg bg-green-600 px-4 py-2 text-xs font-normal text-black transition-colors hover:bg-green-700 hover:text-white">
                  Claim
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-black bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-green-600" />
                <span className="font-inter font-medium text-green-600">Recycler's Reward</span>
              </div>
              <p className="mb-3 text-sm text-black/60">Free shipping on orders above ₦50,000</p>
              <div className="flex items-center justify-between">
                <span className="font-space-grotesk text-2xl font-bold text-green-600">Free</span>
                <button className="text-info-darker font-space-grotesk rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium hover:text-white">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function AchievementsTab({ achievementsData }: { achievementsData: AchievementCardProps[] }) {
    return (
      <div className="rounded-2xl border border-slate-700/50 bg-black/80 p-6">
        <div className="mb-6 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          <h3 className="font-space-grotesk font-semibold text-white">Achievements & Badges</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {achievementsData.map((achievement, index) => (
            <AchievementCard key={index} {...achievement} />
          ))}
        </div>
      </div>
    );
  }

  function WalletTab() {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Wallet Balance */}
        <div className="shadow-border-green rounded-2xl border border-green-500/30 bg-black/80 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-green-400" />
            <h3 className="font-space-grotesk font-semibold text-white">Wallet Balance</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-slate-800 p-3">
              <span className="font-medium text-white">ECO Tokens</span>
              <span className="font-bold text-green-400">1450</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-800 p-3">
              <span className="font-medium text-white">HBAR</span>
              <span className="font-bold text-blue-400">505.05</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-800 p-3">
              <span className="font-medium text-white">Total Value</span>
              <span className="font-bold text-white">$2,205</span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700">
                Send
              </button>
              <button className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700">
                Receive
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-slate-700/50 bg-black/80 p-6">
          <h3 className="font-space-grotesk mb-4 font-semibold text-white">Quick Actions</h3>
          <div className="space-y-3">
            <button className="flex w-full items-center gap-3 rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition-colors hover:bg-green-700">
              <Recycle className="h-5 w-5" />
              Submit Recycling
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700">
              <ShoppingBag className="h-5 w-5" />
              Browse Shop
            </button>
            <button className="flex w-full items-center gap-3 rounded-lg bg-purple-600 px-4 py-3 font-medium text-white transition-colors hover:bg-purple-700">
              <DollarSign className="h-5 w-5" />
              Pay Bills
            </button>
          </div>
        </div>
      </div>
    );
  }
}
