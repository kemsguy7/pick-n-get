'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import {
  Search,
  MapPin,
  Clock,
  CheckCircle,
  Phone,
  User,
  Package,
  Truck,
  Calendar,
  Loader2,
} from 'lucide-react';
import LiveMap from './LiveMap';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface PickupDetails {
  trackingId?: string;
  pickupId: string;
  customerName: string;
  customerPhoneNumber: string;
  pickupAddress: string;
  pickupCoordinates?: {
    lat: number;
    lng: number;
  };
  itemCategory: string;
  itemWeight: number;
  itemDescription?: string;
  estimatedEarnings: number;
  pickUpStatus: string;
  riderId: number;
  riderName?: string;
  riderPhoneNumber?: string;
  requestedAt: string;
  acceptedAt?: string;
  collectedAt?: string;
  deliveredAt?: string;
}

export default function TrackingPage() {
  const [activeTab, setActiveTab] = useState('active-orders');
  const [trackingId, setTrackingId] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<PickupDetails | null>(null);
  const [activeOrders, setActiveOrders] = useState<PickupDetails[]>([]);
  const [orderHistory, setOrderHistory] = useState<PickupDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Fetch active orders on mount
  useEffect(() => {
    fetchActiveOrders();
    fetchOrderHistory();
  }, []);

  const fetchActiveOrders = async () => {
    try {
      // TODO: Replace with actual user ID from context
      const userId = 1;
      const response = await fetch(`${baseUrl}/pickups/user/${userId}/active`);

      if (response.ok) {
        const data = await response.json();
        setActiveOrders(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching active orders:', error);
    }
  };

  const fetchOrderHistory = async () => {
    try {
      const userId = 1;
      const response = await fetch(`${baseUrl}/pickups/user/${userId}/history`);

      if (response.ok) {
        const data = await response.json();
        setOrderHistory(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
    }
  };

  const handleTrack = async () => {
    if (!trackingId.trim()) {
      setSearchError('Please enter a tracking ID');
      return;
    }

    setLoading(true);
    setSearchError('');

    try {
      const response = await fetch(`${baseUrl}/pickups/track/${trackingId}`);

      if (!response.ok) {
        throw new Error('Pickup not found');
      }

      const data = await response.json();
      setSelectedOrder(data.data);
      setActiveTab('detailed-tracking');
    } catch (error) {
      setSearchError('Pickup not found. Please check the tracking ID and try again.');
      console.error('Error tracking order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'intransit':
        return 'bg-blue-500/20 text-blue-400';
      case 'pickedup':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'delivered':
        return 'bg-green-500/20 text-green-400';
      case 'pending':
        return 'bg-orange-500/20 text-orange-400';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'intransit':
        return <Truck className="h-5 w-5" />;
      case 'pickedup':
        return <Package className="h-5 w-5" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const tabs = [
    { id: 'active-orders', label: 'Active Orders' },
    { id: 'detailed-tracking', label: 'Detailed Tracking' },
    { id: 'order-history', label: 'Order History' },
  ];
  const getTimeline = (pickup: PickupDetails) => {
    const timeline = [
      {
        title: 'Request Submitted',
        description: 'Your recycling request has been received',
        timestamp: new Date(pickup.requestedAt).toLocaleString(),
        completed: true,
      },
      {
        title: 'Agent Assigned',
        description: `${pickup.riderName || 'Agent'} assigned to your pickup`,
        timestamp: pickup.acceptedAt ? new Date(pickup.acceptedAt).toLocaleString() : 'Pending',
        completed: !!pickup.acceptedAt,
        current: pickup.pickUpStatus === 'Pending',
      },
      {
        title: 'Agent En Route',
        description: 'Agent is on the way to pickup location',
        timestamp: pickup.acceptedAt ? new Date(pickup.acceptedAt).toLocaleString() : 'Pending',
        completed:
          pickup.pickUpStatus === 'InTransit' ||
          pickup.pickUpStatus === 'PickedUp' ||
          pickup.pickUpStatus === 'Delivered',
        current: pickup.pickUpStatus === 'InTransit',
      },
      {
        title: 'Items Collected',
        description: 'Items collected and being transported',
        timestamp: pickup.collectedAt ? new Date(pickup.collectedAt).toLocaleString() : 'Pending',
        completed: pickup.pickUpStatus === 'PickedUp' || pickup.pickUpStatus === 'Delivered',
        current: pickup.pickUpStatus === 'PickedUp',
      },
      {
        title: 'Delivered to Facility',
        description: 'Items delivered to recycling facility',
        timestamp: pickup.deliveredAt ? new Date(pickup.deliveredAt).toLocaleString() : 'Pending',
        completed: pickup.pickUpStatus === 'Delivered',
        current: false,
      },
    ];

    return timeline;
  };

  return (
    <AppLayout showHeader={true} showSidebar={true} showFooter={true}>
      <div className="min-h-screen overflow-hidden p-4 lg:p-6">
        <div className="mx-auto max-w-7xl space-y-6 lg:space-y-8">
          {/* Header */}
          <div className="mb-8 text-center lg:mb-12">
            <h1 className="text-primary font-space-grotesk mb-4 flex items-center justify-center gap-3 text-3xl font-bold md:text-4xl lg:text-5xl">
              Track Your Orders <MapPin className="h-8 w-8 text-green-400 lg:h-10 lg:w-10" />
            </h1>
            <p className="secondary-text font-inter text-lg">
              Real-time tracking for your recycling pickups and deliveries
            </p>
          </div>

          {/* Search Bar */}
          <div className="mx-auto mb-8 max-w-2xl">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter pickup ID (e.g., 68ee69e34f0284c39c78f06c)"
                  value={trackingId}
                  onChange={(e) => {
                    setTrackingId(e.target.value);
                    setSearchError('');
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 py-3 pr-4 pl-10 text-white placeholder-gray-400 transition-colors focus:border-green-500 focus:outline-none"
                />
              </div>
              <button
                onClick={handleTrack}
                disabled={loading}
                className="gradient-button flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-black transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Track
              </button>
            </div>
            {searchError && <p className="mt-2 text-sm text-red-400">{searchError}</p>}
          </div>

          {/* Tab Navigation */}
          <div className="tab-nav flex gap-1 overflow-x-auto rounded-lg bg-[#1a2928] p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`min-w-0 flex-1 rounded-md px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-primary bg-[#EDFFF3]'
                    : 'lighter-green-text hover:bg-white/10 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'active-orders' && (
              <ActiveOrdersTab
                orders={activeOrders}
                onSelectOrder={(order) => {
                  setSelectedOrder(order);
                  setActiveTab('detailed-tracking');
                }}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
              />
            )}
            {activeTab === 'detailed-tracking' &&
              (selectedOrder ? (
                <div className="space-y-6">
                  {/* Timeline and Map Section */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Timeline - Takes 2/3 on large screens */}
                    <div className="rounded-xl border border-[#A5D6A74D] bg-black p-6 lg:col-span-2">
                      <h3 className="font-space-grotesk mb-6 flex items-center gap-2 font-semibold text-white">
                        <Clock className="h-5 w-5" />
                        Order Timeline -{' '}
                        {selectedOrder.trackingId || selectedOrder.pickupId.slice(-8)}
                      </h3>
                      <div className="space-y-6">
                        {getTimeline(selectedOrder).map((step, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                  step.completed
                                    ? 'bg-green-500 text-white'
                                    : step.current
                                      ? 'bg-blue-500 text-white'
                                      : 'bg-gray-600 text-gray-300'
                                }`}
                              >
                                {step.completed ? (
                                  <CheckCircle className="h-4 w-4" />
                                ) : (
                                  <div className="h-2 w-2 rounded-full bg-current" />
                                )}
                              </div>
                              {index < getTimeline(selectedOrder).length - 1 && (
                                <div
                                  className={`mt-2 h-8 w-0.5 ${step.completed ? 'bg-green-500' : 'bg-gray-600'}`}
                                />
                              )}
                            </div>
                            <div className="flex-1 pb-8">
                              <h4
                                className={`font-medium ${step.completed || step.current ? 'text-white' : 'text-gray-400'}`}
                              >
                                {step.title}
                              </h4>
                              <p className="mt-1 text-sm text-gray-400">{step.description}</p>
                              <p className="mt-2 text-xs text-gray-500">{step.timestamp}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Agent Info & Map - Takes 1/3 on large screens */}
                    <div className="space-y-6">
                      <div className="rounded-xl border border-[#A5D6A74D] bg-black p-6">
                        <h3 className="font-space-grotesk mb-4 flex items-center gap-2 font-semibold text-white">
                          <User className="h-5 w-5" />
                          Assigned Agent
                        </h3>
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-white">
                              {selectedOrder.riderName || 'TBA'}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {selectedOrder.riderPhoneNumber || 'Phone TBA'}
                            </p>
                          </div>
                        </div>
                        {selectedOrder.riderPhoneNumber && (
                          <div className="grid grid-cols-2 gap-2">
                            <a
                              href={`tel:${selectedOrder.riderPhoneNumber}`}
                              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                            >
                              <Phone className="h-4 w-4" />
                              Call
                            </a>
                            <a
                              href={`sms:${selectedOrder.riderPhoneNumber}`}
                              className="rounded-lg bg-green-600 px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-green-700"
                            >
                              Message
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Live Map - Larger container */}
                      <div className="h-96 rounded-xl border border-[#A5D6A74D] bg-black p-6 lg:h-[500px]">
                        <h3 className="font-space-grotesk mb-4 flex items-center gap-2 font-semibold text-white">
                          <MapPin className="h-5 w-5" />
                          Live Location
                        </h3>
                        <div className="h-full overflow-hidden rounded-lg">
                          <LiveMap
                            riderId={selectedOrder.riderId}
                            pickupAddress={selectedOrder.pickupAddress}
                            pickupCoordinates={selectedOrder.pickupCoordinates}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <NoActiveTrackingTab onViewOrders={() => setActiveTab('active-orders')} />
              ))}
            {activeTab === 'order-history' && (
              <OrderHistoryTab orders={orderHistory} getStatusColor={getStatusColor} />
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// Active Orders Tab Component
function ActiveOrdersTab({
  orders,
  onSelectOrder,
  getStatusColor,
  getStatusIcon,
}: {
  orders: PickupDetails[];
  onSelectOrder: (order: PickupDetails) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactElement;
}) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-[#A5D6A74D] bg-black p-12 text-center">
        <Package className="mx-auto mb-4 h-16 w-16 text-gray-400" />
        <h3 className="font-space-grotesk mb-2 text-xl font-semibold text-white">
          No Active Orders
        </h3>
        <p className="text-gray-400">You don't have any active pickup orders at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {orders.map((order) => (
        <div key={order.pickupId} className="rounded-xl border border-[#A5D6A74D] bg-black p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-space-grotesk font-semibold text-white">
              {order.trackingId || order.pickupId.slice(-8)}
            </h3>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(order.pickUpStatus)}`}
            >
              {order.pickUpStatus}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">{order.itemCategory}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Weight:</span>
              <span className="font-medium text-white">{order.itemWeight}kg</span>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">{order.riderName || 'Agent TBA'}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">
                {new Date(order.requestedAt).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => onSelectOrder(order)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700"
            >
              {getStatusIcon(order.pickUpStatus)}
              Track
            </button>
            {order.riderPhoneNumber && (
              <a
                href={`tel:${order.riderPhoneNumber}`}
                className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
              >
                <Phone className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// Detailed Tracking Tab Component
// function DetailedTrackingTab({ order }: { order: PickupDetails }) {
//   const getTimeline = (pickup: PickupDetails) => {
//     const timeline = [
//       {
//         title: 'Request Submitted',
//         description: 'Your recycling request has been received',
//         timestamp: new Date(pickup.requestedAt).toLocaleString(),
//         completed: true,
//       },
//       {
//         title: 'Agent Assigned',
//         description: `${pickup.riderName || 'Agent'} assigned to your pickup`,
//         timestamp: pickup.acceptedAt ? new Date(pickup.acceptedAt).toLocaleString() : 'Pending',
//         completed: !!pickup.acceptedAt,
//         current: pickup.pickUpStatus === 'Pending',
//       },
//       {
//         title: 'Agent En Route',
//         description: 'Agent is on the way to pickup location',
//         timestamp: pickup.acceptedAt ? new Date(pickup.acceptedAt).toLocaleString() : 'Pending',
//         completed:
//           pickup.pickUpStatus === 'InTransit' ||
//           pickup.pickUpStatus === 'PickedUp' ||
//           pickup.pickUpStatus === 'Delivered',
//         current: pickup.pickUpStatus === 'InTransit',
//       },
//       {
//         title: 'Items Collected',
//         description: 'Items collected and being transported',
//         timestamp: pickup.collectedAt ? new Date(pickup.collectedAt).toLocaleString() : 'Pending',
//         completed: pickup.pickUpStatus === 'PickedUp' || pickup.pickUpStatus === 'Delivered',
//         current: pickup.pickUpStatus === 'PickedUp',
//       },
//       {
//         title: 'Delivered to Facility',
//         description: 'Items delivered to recycling facility',
//         timestamp: pickup.deliveredAt ? new Date(pickup.deliveredAt).toLocaleString() : 'Pending',
//         completed: pickup.pickUpStatus === 'Delivered',
//         current: false,
//       },
//     ];

//     return timeline;
//   };

//   const timeline = getTimeline(order);

//   return (
//     <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
//       {/* Timeline */}
//       <div className="rounded-xl border border-[#A5D6A74D] bg-black p-6 lg:col-span-2">
//         <h3 className="font-space-grotesk mb-6 flex items-center gap-2 font-semibold text-white">
//           <Clock className="h-5 w-5" />
//           Order Timeline - {order.trackingId || order.pickupId.slice(-8)}
//         </h3>
//         <div className="space-y-6">
//           {timeline.map((step, index) => (
//             <div key={index} className="flex gap-4">
//               <div className="flex flex-col items-center">
//                 <div
//                   className={`flex h-8 w-8 items-center justify-center rounded-full ${
//                     step.completed
//                       ? 'bg-green-500 text-white'
//                       : step.current
//                         ? 'bg-blue-500 text-white'
//                         : 'bg-gray-600 text-gray-300'
//                   }`}
//                 >
//                   {step.completed ? (
//                     <CheckCircle className="h-4 w-4" />
//                   ) : (
//                     <div className="h-2 w-2 rounded-full bg-current" />
//                   )}
//                 </div>
//                 {index < timeline.length - 1 && (
//                   <div
//                     className={`mt-2 h-8 w-0.5 ${step.completed ? 'bg-green-500' : 'bg-gray-600'}`}
//                   />
//                 )}
//               </div>
//               <div className="flex-1 pb-8">
//                 <h4
//                   className={`font-medium ${step.completed || step.current ? 'text-white' : 'text-gray-400'}`}
//                 >
//                   {step.title}
//                 </h4>
//                 <p className="mt-1 text-sm text-gray-400">{step.description}</p>
//                 <p className="mt-2 text-xs text-gray-500">{step.timestamp}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Agent Info & Map */}
//       <div className="space-y-6">
//         <div className="rounded-xl border border-[#A5D6A74D] bg-black p-6">
//           <h3 className="font-space-grotesk mb-4 flex items-center gap-2 font-semibold text-white">
//             <User className="h-5 w-5" />
//             Assigned Agent
//           </h3>
//           <div className="mb-4 flex items-center gap-3">
//             <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500">
//               <User className="h-6 w-6 text-white" />
//             </div>
//             <div>
//               <h4 className="font-medium text-white">{order.riderName || 'TBA'}</h4>
//               <p className="text-sm text-gray-400">{order.riderPhoneNumber || 'Phone TBA'}</p>
//             </div>
//           </div>
//           {order.riderPhoneNumber && (
//             <div className="grid grid-cols-2 gap-2">
//               <a
//                 href={`tel:${order.riderPhoneNumber}`}
//                 className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
//               >
//                 <Phone className="h-4 w-4" />
//                 Call
//               </a>
//               <a
//                 href={`sms:${order.riderPhoneNumber}`}
//                 className="rounded-lg bg-green-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-green-700"
//               >
//                 Message
//               </a>
//             </div>
//           )}
//         </div>

//         {/* Live Map */}
//         <div className="rounded-xl border border-[#A5D6A74D] bg-black p-6">
//           <h3 className="font-space-grotesk mb-4 flex items-center gap-2 font-semibold text-white">
//             <MapPin className="h-5 w-5" />
//             Live Location
//           </h3>
//           <div className="h-48 overflow-hidden rounded-lg">
//             <LiveMap
//               riderId={order.riderId}
//               pickupAddress={order.pickupAddress}
//               pickupCoordinates={order.pickupCoordinates}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// No Active Tracking Component
function NoActiveTrackingTab({ onViewOrders }: { onViewOrders: () => void }) {
  return (
    <div className="rounded-xl border border-[#A5D6A74D] bg-black p-12 text-center">
      <MapPin className="mx-auto mb-4 h-16 w-16 text-gray-400" />
      <h3 className="font-space-grotesk mb-2 text-xl font-semibold text-white">
        No Active Tracking
      </h3>
      <p className="mb-6 text-gray-400">
        Enter a pickup ID above or select an active order to view detailed tracking information.
      </p>
      <button
        onClick={onViewOrders}
        className="gradient-button rounded-lg px-6 py-2 font-semibold text-black transition-all duration-200 hover:shadow-lg"
      >
        View Active Orders
      </button>
    </div>
  );
}

// Order History Component
function OrderHistoryTab({
  orders,
  getStatusColor,
}: {
  orders: PickupDetails[];
  getStatusColor: (status: string) => string;
}) {
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-[#A5D6A74D] bg-black p-12 text-center">
        <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-400" />
        <h3 className="font-space-grotesk mb-2 text-xl font-semibold text-white">
          No Order History
        </h3>
        <p className="text-gray-400">Your completed orders will appear here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#A5D6A74D] bg-black p-6">
      <h3 className="font-space-grotesk mb-6 flex items-center gap-2 font-semibold text-white">
        <Calendar className="h-5 w-5" />
        Order History
      </h3>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.pickupId}
            className="flex items-center justify-between rounded-lg border border-[#D9D9D933] p-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCFCE7]">
                <Package className="text-primary h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-white">
                  {order.itemWeight}kg {order.itemCategory}
                </p>
                <p className="text-sm text-gray-400">
                  {new Date(order.requestedAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500">
                  {order.trackingId || order.pickupId.slice(-8)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`font-roboto rounded-lg px-2 py-1 text-xs font-medium ${getStatusColor(order.pickUpStatus)}`}
              >
                {order.pickUpStatus}
              </span>
              <p className="mt-1 text-sm text-green-400">₦{order.estimatedEarnings}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
