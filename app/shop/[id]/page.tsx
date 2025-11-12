'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useWalletInterface } from '../../services/wallets/useWalletInterface';
import { WalletInterface } from '../../services/wallets/walletInterface';

import AppLayout from '../../components/layout/AppLayout';
import {
  ArrowLeft,
  ShoppingCart,
  Star,
  Loader2,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:5000/api/v1';

interface Product {
  productId: number;
  walletAddress: string;
  name: string;
  description: string;
  category: string;
  price: number;
  priceUSD?: number;
  quantity: number;
  weight: number;
  imageFileId: string;
  imageUrl: string;
  txHash: string;
  status: string;
  recycledPercentage: number;
  carbonNeutral: boolean;
  createdAt: string;
}

// ✅ FIXED: Remove params prop, use useParams hook instead
export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams(); // ✅ Use useParams hook
  const productId = params.id as string; // ✅ Get id from params

  const { accountId, walletInterface } = useWalletInterface();
  const isConnected = !!(accountId && walletInterface);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [txHash, setTxHash] = useState('');

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]); // ✅ Use productId instead of params.id

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/products/${productId}`); // ✅ Use productId
      if (!response.ok) throw new Error('Product not found');

      const data = await response.json();
      setProduct(data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load product';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!isConnected) {
      setError('Please connect your wallet to purchase');
      return;
    }

    if (!product) return;

    if (quantity > product.quantity) {
      setError(`Only ${product.quantity} items available`);
      return;
    }

    setPurchasing(true);
    setError('');
    setSuccess('');

    try {
      const { shopProduct } = await import('../../services/productService');

      const productIdNum = product.productId;
      const walletData: [string, WalletInterface | null, string] = [
        accountId!,
        walletInterface,
        'testnet',
      ];

      console.log(`Purchasing ${quantity} x ${product.name}`);
      console.log(`Total: ${product.price * quantity} HBAR`);

      // ✅ Call smart contract with correct parameters
      const result = await shopProduct(walletData, productIdNum, quantity);

      if (!result.success) {
        throw new Error(result.error || 'Purchase failed');
      }

      console.log('✅ Purchase successful:', result.txHash);
      setTxHash(result.txHash || '');

      // Record sale in backend
      await fetch(`${BACKEND_URL}/products/${product.productId}/sale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity,
          totalAmount: product.price * quantity, //In HBAR
          customerWalletAddress: accountId,
          customerName: 'Customer',
          deliveryAddress: 'To be provided',
          txHash: result.txHash,
        }),
      });

      setSuccess('Purchase successful! Transaction confirmed on blockchain.');
      setTimeout(() => fetchProduct(), 2000);
    } catch (err) {
      console.error('Purchase error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Purchase failed';
      setError(errorMessage);
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-400" />
        </div>
      </AppLayout>
    );
  }

  if (!product) {
    return (
      <AppLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-400" />
            <h2 className="mb-4 text-2xl font-bold text-red-400">Product Not Found</h2>
            <button
              onClick={() => router.push('/shop')}
              className="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700"
            >
              Back to Shop
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  //   const imageUrl = product.imageUrl
  //     ? `https://testnet.mirrornode.hedera.com/api/v1/contracts/${product.imageFileId}/results/contents`
  //     : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23334155" width="400" height="400"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="20" x="50%" y="50%" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';

  const totalPrice = product.price * quantity;
  const totalPriceUSD = product.priceUSD ? product.priceUSD * quantity : totalPrice * 0.05;

  return (
    <AppLayout showHeader={true} showSidebar={true} showFooter={true}>
      <div className="dashboard-container min-h-screen p-4 lg:p-6">
        <div className="mx-auto max-w-6xl">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Shop</span>
          </button>

          {/* Product Detail */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Image */}
            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full rounded-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23334155" width="400" height="400"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="20" x="50%" y="50%" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                }}
              />

              <div className="mt-4 flex gap-2">
                <span className="rounded-lg bg-green-100 px-3 py-1 text-xs font-medium text-green-600">
                  {product.recycledPercentage}% Recycled
                </span>
                {product.carbonNeutral && (
                  <span className="rounded-lg bg-blue-100 px-3 py-1 text-xs font-medium text-blue-600">
                    Carbon Neutral
                  </span>
                )}
                <span className="rounded-lg bg-purple-100 px-3 py-1 text-xs font-medium text-purple-600">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h1 className="font-space-grotesk mb-2 text-3xl font-bold text-white">
                  {product.name}
                </h1>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-white">4.5</span>
                  </div>
                  <span className="text-gray-400">(25 reviews)</span>
                </div>
              </div>

              <p className="text-gray-300">{product.description}</p>

              {/* Price */}
              <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
                <div className="mb-2 flex items-baseline gap-2">
                  <span className="font-space-grotesk text-3xl font-bold text-white">
                    {product.price} HBAR
                  </span>
                  <span className="text-gray-400">
                    (${product.priceUSD?.toFixed(2) || (product.price * 0.05).toFixed(2)})
                  </span>
                </div>
                <p className="text-sm text-gray-400">Weight: {product.weight}kg</p>
                <p className="text-sm text-gray-400">
                  Stock: {product.quantity} {product.quantity === 1 ? 'item' : 'items'} available
                </p>
              </div>

              {/* Quantity Selector */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Quantity</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="text-xl font-bold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                    className="rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600"
                    disabled={quantity >= product.quantity}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Total:</span>
                  <div className="text-right">
                    <div className="font-space-grotesk text-2xl font-bold text-white">
                      {totalPrice.toFixed(2)} HBAR
                    </div>
                    <div className="text-sm text-gray-400">${totalPriceUSD.toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <span className="text-sm text-red-400">{error}</span>
                </div>
              )}

              {success && (
                <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-400" />
                    <span className="text-sm text-green-400">{success}</span>
                  </div>
                  {txHash && (
                    <a
                      href={`https://hashscan.io/testnet/transaction/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View on HashScan
                    </a>
                  )}
                </div>
              )}

              {/* Purchase Button */}
              <button
                onClick={handlePurchase}
                disabled={purchasing || product.quantity === 0 || !isConnected}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-4 font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-600"
              >
                {purchasing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : !isConnected ? (
                  'Connect Wallet to Purchase'
                ) : product.quantity === 0 ? (
                  'Out of Stock'
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5" />
                    Buy Now
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-400">
                Secure payment via Hedera blockchain
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                <Check className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="mb-1 font-semibold text-white">Blockchain Verified</h3>
              <p className="text-sm text-gray-400">All transactions recorded on-chain</p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
                <Star className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="mb-1 font-semibold text-white">Verified Vendor</h3>
              <p className="text-sm text-gray-400">Trusted eco-friendly seller</p>
            </div>

            <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/20">
                <ShoppingCart className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="mb-1 font-semibold text-white">Instant Payment</h3>
              <p className="text-sm text-gray-400">HBAR transfers directly to vendor</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
