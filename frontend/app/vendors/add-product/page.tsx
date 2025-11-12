'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AppLayout from '../../components/layout/AppLayout';
import { useWalletInterface } from '../../services/wallets/useWalletInterface';
import { WalletInterface } from '../../services/wallets/walletInterface';
import { addProduct, ProductData } from '../../services/productService';
import { uploadToHedera, validateFile } from '../../apis/hederaApi';
import { ArrowLeft, Check, Loader2, AlertCircle, X, Image as ImageIcon } from 'lucide-react';

interface ProductFormData {
  name: string;
  category: string;
  description: string;
  price: string;
  weight: string;
  quantity: string;
  image: File | null;
}

interface FormErrors {
  name?: string;
  category?: string;
  description?: string;
  price?: string;
  weight?: string;
  quantity?: string;
  image?: string;
}

interface UploadProgress {
  uploading: boolean;
  progress: number;
  fileId?: string;
  error?: string;
}

const createWalletData = (
  accountId: string,
  walletInterface: WalletInterface | null,
  network: string = 'testnet',
): [string, WalletInterface | null, string] => {
  return [accountId, walletInterface, network];
};

export default function AddProductPage() {
  const [txHash, setTxHash] = useState<string>('');
  console.log(setTxHash);
  const router = useRouter();
  const { accountId, walletInterface } = useWalletInterface();

  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: '',
    description: '',
    price: '',
    weight: '',
    quantity: '',
    image: null,
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    uploading: false,
    progress: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isConnected = !!(accountId && walletInterface);

  // Product categories
  const categories = [
    'Bags & Accessories',
    'Furniture',
    'Office Supplies',
    'Fitness & Wellness',
    'Home & Garden',
    'Textiles',
    'Electronics',
    'Others',
  ];

  // Validation function
  const validateField = (name: string, value: string | File | null): string | undefined => {
    switch (name) {
      case 'name':
        if (!value || (typeof value === 'string' && value.trim().length === 0)) {
          return 'Product name is required';
        }
        if (typeof value === 'string' && value.trim().length < 3) {
          return 'Product name must be at least 3 characters';
        }
        break;
      case 'category':
        if (!value || (typeof value === 'string' && value.trim().length === 0)) {
          return 'Please select a category';
        }
        break;
      case 'description':
        if (!value || (typeof value === 'string' && value.trim().length === 0)) {
          return 'Product description is required';
        }
        if (typeof value === 'string' && value.trim().length < 10) {
          return 'Description must be at least 10 characters';
        }
        break;
      case 'price':
        if (!value || (typeof value === 'string' && value.trim().length === 0)) {
          return 'Price is required';
        }
        if (typeof value === 'string') {
          const numValue = parseFloat(value);
          if (isNaN(numValue) || numValue <= 0) {
            return 'Price must be greater than 0';
          }
        }
        break;
      case 'weight':
        if (!value || (typeof value === 'string' && value.trim().length === 0)) {
          return 'Weight is required';
        }
        if (typeof value === 'string') {
          const numValue = parseFloat(value);
          if (isNaN(numValue) || numValue <= 0) {
            return 'Weight must be greater than 0';
          }
        }
        break;
      case 'quantity':
        if (!value || (typeof value === 'string' && value.trim().length === 0)) {
          return 'Quantity is required';
        }
        if (typeof value === 'string') {
          const numValue = parseInt(value);
          if (isNaN(numValue) || numValue <= 0) {
            return 'Quantity must be at least 1';
          }
        }
        break;
      case 'image':
        if (!uploadProgress.fileId) {
          return 'Product image is required';
        }
        break;
    }
    return undefined;
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    errors.name = validateField('name', formData.name);
    errors.category = validateField('category', formData.category);
    errors.description = validateField('description', formData.description);
    errors.price = validateField('price', formData.price);
    errors.weight = validateField('weight', formData.weight);
    errors.quantity = validateField('quantity', formData.quantity);
    errors.image = validateField('image', null);

    // Remove undefined errors
    Object.keys(errors).forEach((key) => {
      if (errors[key as keyof FormErrors] === undefined) {
        delete errors[key as keyof FormErrors];
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (touched[name]) {
      const error = validateField(name, value);
      setFormErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    const value = formData[fieldName as keyof ProductFormData];
    const error = validateField(fieldName, value);
    setFormErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));
  };

  const handleImageUpload = async (file: File | null) => {
    console.log(`📁 Image upload initiated:`, file?.name);

    if (!file) {
      setFormData((prev) => ({ ...prev, image: null }));
      setUploadProgress({ uploading: false, progress: 0 });
      setFormErrors((prev) => ({ ...prev, image: 'Product image is required' }));
      return;
    }

    // Validate file
    const validation = await validateFile(file, {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
    });

    if (!validation.isValid) {
      console.error(`❌ File validation failed:`, validation.errors);
      setUploadProgress({
        uploading: false,
        progress: 0,
        error: validation.errors?.[0] || 'File validation failed',
      });
      setFormErrors((prev) => ({ ...prev, image: validation.errors?.[0] }));
      return;
    }

    // Start upload
    setFormData((prev) => ({ ...prev, image: file }));
    setUploadProgress({ uploading: true, progress: 10 });
    setFormErrors((prev) => ({ ...prev, image: undefined }));

    try {
      console.log(`🚀 Starting Hedera File Service upload...`);

      const uploadResult = await uploadToHedera(file, (progress) => {
        setUploadProgress((prev) => ({
          ...prev,
          uploading: true,
          progress: progress,
        }));
      });

      if (uploadResult.success) {
        console.log(`✅ Hedera upload successful:`, uploadResult.fileId);
        setUploadProgress({
          uploading: false,
          progress: 100,
          fileId: uploadResult.fileId,
        });
        setFormErrors((prev) => ({ ...prev, image: undefined }));
      } else {
        console.error(`❌ Hedera upload failed:`, uploadResult.error);
        setUploadProgress({
          uploading: false,
          progress: 0,
          error: uploadResult.error || 'Upload failed',
        });
        setFormErrors((prev) => ({ ...prev, image: uploadResult.error }));
      }
    } catch (error) {
      console.error(`💥 Upload error:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadProgress({
        uploading: false,
        progress: 0,
        error: errorMessage,
      });
      setFormErrors((prev) => ({ ...prev, image: errorMessage }));
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setUploadProgress({ uploading: false, progress: 0 });
    setFormErrors((prev) => ({ ...prev, image: 'Product image is required' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🎯 Starting product submission...');

    // Mark all fields as touched
    setTouched({
      name: true,
      category: true,
      description: true,
      price: true,
      weight: true,
      quantity: true,
      image: true,
    });

    // Validate form
    if (!validateForm()) {
      console.log('❌ Form validation failed:', formErrors);
      setError('Please fix all errors before submitting');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    setLoadingMessage('Validating product data...');

    try {
      if (!isConnected || !accountId) {
        throw new Error('Wallet not connected. Please connect your wallet.');
      }

      setLoadingMessage('Adding product to blockchain...');

      // ✅ Convert decimal price to whole number automatically
      const priceValue = parseFloat(formData.price);
      const wholeNumberPrice = Math.floor(priceValue);

      console.log(
        `💰 Price conversion: ${priceValue} HBAR → ${wholeNumberPrice} HBAR (whole number)`,
      );

      // Prepare product data
      const productData: ProductData = {
        name: formData.name.trim(),
        quantity: parseInt(formData.quantity),
        description: formData.description.trim(),
        imageFileId: uploadProgress.fileId!,
        amount: wholeNumberPrice, // ✅ Whole number for contract
      };

      console.log('📋 Product data prepared:', productData);

      // Add product to blockchain
      const walletData = createWalletData(accountId, walletInterface);
      const result = await addProduct(walletData, productData);

      if (result.success) {
        console.log('✅ Product added successfully!');

        // Save to backend (optional)
        setLoadingMessage('Saving to database...');
        await saveProductToBackend(productData, result.txHash!, result.productId!, accountId);

        setLoadingMessage('');
        setSuccess(
          `Product added successfully! Transaction: ${result.txHash?.substring(0, 10)}...`,
        );

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push('/vendors');
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to add product');
      }
    } catch (error) {
      console.error('💥 Product submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add product';
      setLoadingMessage('');
      setError(errorMessage);
    } finally {
      if (!success) {
        setIsLoading(false);
      }
    }
  };

  // Backend integration
  const saveProductToBackend = async (
    productData: ProductData,
    txHash: string,
    productId: number,
    walletAddress: string,
  ) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

      const payload = {
        productId,
        walletAddress,
        name: productData.name,
        description: productData.description,
        quantity: productData.quantity,
        price: productData.amount,
        imageFileId: productData.imageFileId,
        category: formData.category,
        weight: parseFloat(formData.weight),
        txHash,
        status: 'Available',
      };

      const response = await fetch(`${baseUrl}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log('✅ Product saved to backend');
      } else {
        console.warn('⚠️ Backend save failed (blockchain succeeded)');
      }
    } catch (err) {
      console.warn('⚠️ Backend error (blockchain succeeded):', err);
    }
  };

  const handleSaveAsDraft = () => {
    console.log('💾 Saving as draft...');
    const draft = {
      ...formData,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('product_draft', JSON.stringify(draft));
    alert('Draft saved locally! ✅');
  };

  // Check wallet connection
  if (!isConnected) {
    return (
      <AppLayout showHeader={true} showSidebar={true} showFooter={true}>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-16 w-16 text-yellow-400" />
            <h2 className="mb-4 text-2xl font-bold text-yellow-400">Connect Wallet</h2>
            <p className="text-gray-400">Please connect your wallet to add products.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showHeader={true} showSidebar={true} showFooter={true}>
      <div className="dashboard-container min-h-screen p-4 lg:p-6">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="mb-4 flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="font-inter text-sm">Back</span>
            </button>

            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
                <Image src="/PickLogo.png" width={200} height={200} alt="Pick-n-Get Logo" />
              </div>
              <h1 className="text-primary font-space-grotesk mb-2 text-3xl font-bold">
                Add New Product
              </h1>
              <p className="font-inter text-base text-gray-400">
                Upload and list your recyclable or eco-friendly product for customers.
              </p>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-4 backdrop-blur-sm">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
              <span className="font-inter text-sm text-red-400">{error}</span>
            </div>
          )}

          {/* Success Display */}

          {success && (
            <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 p-4 backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-2">
                <Check className="h-5 w-5 flex-shrink-0 text-green-400" />
                <span className="font-inter text-sm text-green-400">{success}</span>
              </div>

              {txHash && (
                <a
                  href={`https://hashscan.io/testnet/transaction/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 hover:underline"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  View on HashScan
                </a>
              )}
            </div>
          )}

          {/* Form Card */}
          <div
            className="rounded-2xl p-6 backdrop-blur-[40px]"
            style={{
              backgroundColor: '#0D1B1E',
              border: '1px solid #1DE9B63D',
              boxShadow: '0px 4px 10px 0px #66BB6A1A',
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Name */}
              <div>
                <label
                  className="font-inter mb-2 block text-lg leading-7 font-medium"
                  style={{ color: '#FFFFFF' }}
                >
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('name')}
                  placeholder="e.g., Upcycled Denim Tote Bag"
                  className="font-inter w-full rounded-lg px-4 py-3 text-sm leading-5 text-white placeholder-gray-500 transition-all focus:ring-2 focus:ring-green-500/50 focus:outline-none"
                  style={{
                    backgroundColor: '#0D1B1E',
                    border: '1px solid #D9D9D9',
                    letterSpacing: '0.002em',
                  }}
                  disabled={isLoading}
                />
                {touched.name && formErrors.name && (
                  <p className="font-inter mt-1 text-xs text-red-400">{formErrors.name}</p>
                )}
              </div>

              {/* Product Category */}
              <div>
                <label
                  className="font-inter mb-2 block text-lg leading-7 font-medium"
                  style={{ color: '#FFFFFF' }}
                >
                  Product Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('category')}
                  className="font-inter w-full rounded-lg px-4 py-3 text-sm leading-5 text-white transition-all focus:ring-2 focus:ring-green-500/50 focus:outline-none"
                  style={{
                    backgroundColor: '#0D1B1E',
                    border: '1px solid #D9D9D9',
                    letterSpacing: '0.002em',
                  }}
                  disabled={isLoading}
                >
                  <option value="" className="text-gray-500">
                    Select Category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#0D1B1E] text-white">
                      {cat}
                    </option>
                  ))}
                </select>
                {touched.category && formErrors.category && (
                  <p className="font-inter mt-1 text-xs text-red-400">{formErrors.category}</p>
                )}
              </div>

              {/* Product Description */}
              <div>
                <label
                  className="font-inter mb-2 block text-lg leading-7 font-medium"
                  style={{ color: '#FFFFFF' }}
                >
                  Product Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('description')}
                  placeholder="Briefly describe your product..."
                  rows={4}
                  className="font-inter w-full rounded-lg px-4 py-3 text-sm leading-5 text-white placeholder-gray-500 transition-all focus:ring-2 focus:ring-green-500/50 focus:outline-none"
                  style={{
                    backgroundColor: '#0D1B1E',
                    border: '1px solid #D9D9D9',
                    letterSpacing: '0.002em',
                  }}
                  disabled={isLoading}
                />
                {touched.description && formErrors.description && (
                  <p className="font-inter mt-1 text-xs text-red-400">{formErrors.description}</p>
                )}
              </div>

              {/* Price and Weight Row */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Price */}
                <div>
                  <label
                    className="font-inter mb-2 block text-lg leading-7 font-medium"
                    style={{ color: '#FFFFFF' }}
                  >
                    Price (HBAR) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('price')}
                    placeholder="e.g., 5"
                    step="0.01"
                    min="0"
                    className="font-inter w-full rounded-lg px-4 py-3 text-sm leading-5 text-white placeholder-gray-500 transition-all focus:ring-2 focus:ring-green-500/50 focus:outline-none"
                    style={{
                      backgroundColor: '#0D1B1E',
                      border: '1px solid #D9D9D9',
                      letterSpacing: '0.002em',
                    }}
                    disabled={isLoading}
                  />
                  {touched.price && formErrors.price && (
                    <p className="font-inter mt-1 text-xs text-red-400">{formErrors.price}</p>
                  )}
                  <p className="font-inter mt-1 text-xs text-gray-500">
                    Decimals will be rounded to whole numbers
                  </p>
                </div>

                {/* Weight */}
                <div>
                  <label
                    className="font-inter mb-2 block text-lg leading-7 font-medium"
                    style={{ color: '#FFFFFF' }}
                  >
                    Product Weight (kg) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('weight')}
                    placeholder="e.g., 0.5"
                    step="0.1"
                    min="0"
                    className="font-inter w-full rounded-lg px-4 py-3 text-sm leading-5 text-white placeholder-gray-500 transition-all focus:ring-2 focus:ring-green-500/50 focus:outline-none"
                    style={{
                      backgroundColor: '#0D1B1E',
                      border: '1px solid #D9D9D9',
                      letterSpacing: '0.002em',
                    }}
                    disabled={isLoading}
                  />
                  {touched.weight && formErrors.weight && (
                    <p className="font-inter mt-1 text-xs text-red-400">{formErrors.weight}</p>
                  )}
                </div>
              </div>

              {/* Available Quantity */}
              <div>
                <label
                  className="font-inter mb-2 block text-lg leading-7 font-medium"
                  style={{ color: '#FFFFFF' }}
                >
                  Available Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('quantity')}
                  placeholder="e.g., 10"
                  min="1"
                  className="font-inter w-full rounded-lg px-4 py-3 text-sm leading-5 text-white placeholder-gray-500 transition-all focus:ring-2 focus:ring-green-500/50 focus:outline-none"
                  style={{
                    backgroundColor: '#0D1B1E',
                    border: '1px solid #D9D9D9',
                    letterSpacing: '0.002em',
                  }}
                  disabled={isLoading}
                />
                {touched.quantity && formErrors.quantity && (
                  <p className="font-inter mt-1 text-xs text-red-400">{formErrors.quantity}</p>
                )}
              </div>

              {/* Upload Product Images */}
              <div>
                <label
                  className="font-inter mb-2 block text-lg leading-7 font-medium"
                  style={{ color: '#FFFFFF' }}
                >
                  Upload Product Images <span className="text-red-500">*</span>
                </label>
                <p className="font-inter mb-2 text-xs text-gray-500">
                  Upload high-quality images of your product (max 10MB)
                </p>

                <div
                  className="rounded-lg border-2 border-dashed p-6 transition-all hover:border-green-500/50"
                  style={{
                    backgroundColor: '#0D1B1E',
                    borderColor: formErrors.image ? '#EF4444' : '#1DE9B63D',
                  }}
                >
                  <input
                    type="file"
                    id="productImage"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleImageUpload(file);
                    }}
                    className="hidden"
                    disabled={uploadProgress.uploading || isLoading}
                  />

                  {uploadProgress.uploading ? (
                    <div className="text-center">
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                      </div>
                      <p className="font-inter text-sm font-medium text-blue-400">
                        Uploading to Hedera...
                      </p>
                      <div className="mt-2 h-2 w-full rounded-full bg-gray-700">
                        <div
                          className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${uploadProgress.progress}%` }}
                        ></div>
                      </div>
                      <p className="font-inter mt-1 text-xs text-gray-500">
                        {uploadProgress.progress}%
                      </p>
                    </div>
                  ) : uploadProgress.fileId ? (
                    <div className="text-center">
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                        <Check className="h-6 w-6 text-green-400" />
                      </div>
                      <p className="font-inter text-sm font-medium text-green-400">
                        {formData.image?.name}
                      </p>
                      <p className="font-inter text-xs text-gray-500">
                        Uploaded to Hedera File System
                      </p>
                      <p className="mt-1 font-mono text-xs break-all text-green-500">
                        {uploadProgress.fileId}
                      </p>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="font-inter mx-auto mt-2 flex items-center gap-1 text-xs text-red-400 transition-colors hover:text-red-300"
                        disabled={isLoading}
                      >
                        <X className="h-3 w-3" />
                        Remove
                      </button>
                    </div>
                  ) : uploadProgress.error ? (
                    <div className="text-center">
                      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                        <AlertCircle className="h-6 w-6 text-red-400" />
                      </div>
                      <p className="font-inter text-sm font-medium text-red-400">Upload Failed</p>
                      <p className="font-inter text-xs text-red-400">{uploadProgress.error}</p>
                      <label
                        htmlFor="productImage"
                        className="font-inter mt-2 inline-block cursor-pointer rounded-lg bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/30"
                      >
                        Try Again
                      </label>
                    </div>
                  ) : (
                    <label htmlFor="productImage" className="block cursor-pointer">
                      <div className="text-center">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gray-700">
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="font-inter mb-2 inline-block rounded-lg bg-gray-700/50 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700">
                          Click to upload product image
                        </div>
                        <p className="font-inter text-xs text-gray-500">
                          Max 10MB • JPG, PNG, WEBP
                        </p>
                      </div>
                    </label>
                  )}
                </div>
                {formErrors.image && (
                  <p className="font-inter mt-1 text-xs text-red-400">{formErrors.image}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleSaveAsDraft}
                  disabled={isLoading}
                  className="font-space-grotesk flex-1 rounded-xl border border-yellow-500/50 bg-yellow-500/10 px-4 py-3 font-semibold text-yellow-400 transition-colors hover:bg-yellow-500/20 disabled:opacity-50"
                >
                  💾 Save as Draft
                </button>

                <button
                  type="submit"
                  disabled={isLoading || !isConnected}
                  className="gradient-button font-space-grotesk flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold text-black transition-all hover:opacity-90 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="font-inter text-sm">
                        {loadingMessage || 'Submitting...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      <span className="font-inter text-sm">Submit Product</span>
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => router.back()}
                disabled={isLoading}
                className="font-space-grotesk w-full rounded-xl border px-4 py-3 font-semibold text-gray-400 transition-colors hover:bg-gray-700/20 disabled:opacity-50"
                style={{
                  border: '1px solid #D9D9D9',
                }}
              >
                ← Cancel
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
