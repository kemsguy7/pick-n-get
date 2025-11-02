import { Request, Response } from 'express';
import { Product, Producer, Order, ProductStatus } from '../models/productModel.js';
import { User, UserRole } from '../models/userModel.js';

// HBAR to USD conversion rate (update this periodically or use an API)
const HBAR_TO_USD = 0.05; // Example: 1 HBAR = $0.05 (update with real rate)

/**
 * Convert USD to HBAR
 */
function usdToHbar(usd: number): number {
  return Number((usd / HBAR_TO_USD).toFixed(2));
}

/**
 * Convert HBAR to USD
 */
function hbarToUsd(hbar: number): number {
  return Number((hbar * HBAR_TO_USD).toFixed(2));
}

/**
 * Register a producer/vendor
 * POST /api/v1/products/producers
 */
export const registerProducer = async (req: Request, res: Response) => {
  try {
    const { registrationId, walletAddress, name, country, phoneNumber, businessName } = req.body;

    if (!walletAddress || !name || !country || !phoneNumber) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields',
      });
    }

    // Check if producer already exists
    const existingProducer = await Producer.findOne({ walletAddress });
    if (existingProducer) {
      return res.status(409).json({
        status: 'error',
        message: 'Producer already registered',
        data: {
          producerId: existingProducer.registrationId,
        },
      });
    }

    // Create new producer
    const newProducer = await Producer.create({
      registrationId: registrationId || Date.now(),
      walletAddress,
      name,
      businessName: businessName || name,
      country,
      phoneNumber,
      isVerified: false,
    });

    // Update user roles to include Vendor
    const user = await User.findOne({ walletAddress });
    if (user) {
      if (!user.roles.includes(UserRole.Vendor as any)) {
        user.roles.push(UserRole.Vendor as any);
        await user.save();
      }
    } else {
      // Create user if doesn't exist
      const lastUser = await User.findOne().sort({ id: -1 }).limit(1);
      const newUserId = lastUser ? lastUser.id + 1 : 1;

      await User.create({
        id: newUserId,
        name,
        phoneNumber,
        walletAddress,
        roles: [UserRole.Vendor as any],
        status: 'Active',
      });
    }

    console.log(`✅ Producer registered: ${walletAddress}`);

    return res.status(201).json({
      status: 'success',
      message: 'Producer registered successfully',
      data: {
        producerId: newProducer.registrationId,
        walletAddress: newProducer.walletAddress,
        name: newProducer.name,
        businessName: newProducer.businessName,
      },
    });
  } catch (error: any) {
    console.error('Error registering producer:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to register producer',
    });
  }
};

/**
 * Add a product
 * POST /api/v1/products
 */
export const addProduct = async (req: Request, res: Response) => {
  try {
    const {
      productId,
      walletAddress,
      name,
      description,
      category,
      price, // In HBAR
      priceUSD, // Optional USD price
      quantity,
      weight,
      imageFileId,
      txHash,
      recycledPercentage,
      carbonNeutral,
    } = req.body;

    if (
      !productId ||
      !walletAddress ||
      !name ||
      !description ||
      !category ||
      !price ||
      !quantity ||
      !weight ||
      !imageFileId ||
      !txHash
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields',
      });
    }

    // Check if producer exists, if not create one automatically
    let producer = await Producer.findOne({ walletAddress });
    if (!producer) {
      console.log(`⚠️ Producer not found, auto-creating for: ${walletAddress}`);

      // Auto-create producer from User data
      const user = await User.findOne({ walletAddress });

      producer = await Producer.create({
        registrationId: Date.now(),
        walletAddress,
        name: user?.name || 'Vendor',
        businessName: user?.name || 'Vendor Business',
        country: user?.country || 'Unknown',
        phoneNumber: user?.phoneNumber || 'Unknown',
        isVerified: false,
        totalProducts: 0,
        totalRevenue: 0,
        totalSales: 0,
        avgRating: 0,
        monthlyGrowth: 0,
      });

      // Add Vendor role to user if exists
      if (user && !user.roles.includes(UserRole.Vendor as any)) {
        user.roles.push(UserRole.Vendor as any);
        await user.save();
      }

      console.log(`✅ Producer auto-created: ${producer.registrationId}`);
    }

    // Check if product ID already exists
    const existingProduct = await Product.findOne({ productId });
    if (existingProduct) {
      return res.status(409).json({
        status: 'error',
        message: 'Product ID already exists',
      });
    }

    // Calculate USD price if not provided
    const calculatedPriceUSD = priceUSD || hbarToUsd(price);

    // Generate image URL
    // const imageUrl = `https://testnet.mirrornode.hedera.com/api/v1/contracts/${imageFileId}/results/contents`;

    // Generate image URL - FIXED VERSION
    const imageUrl = imageFileId.startsWith('0.0.')
      ? `https://hashscan.io/testnet/file/${imageFileId}`
      : imageFileId;
    // Create product
    const newProduct = await Product.create({
      productId,
      walletAddress,
      name,
      description,
      category,
      price,
      priceUSD: calculatedPriceUSD,
      quantity,
      weight,
      imageFileId,
      imageUrl,
      txHash,
      status: ProductStatus.Available,
      recycledPercentage: recycledPercentage || 0,
      carbonNeutral: carbonNeutral || false,
      views: 0,
      sales: 0,
      revenue: 0,
    });

    // Update producer stats
    producer.totalProducts += 1;
    await producer.save();

    console.log(`✅ Product added: ${productId}`);

    return res.status(201).json({
      status: 'success',
      message: 'Product added successfully',
      data: {
        productId: newProduct.productId,
        name: newProduct.name,
        price: newProduct.price,
        priceUSD: newProduct.priceUSD,
        imageUrl: newProduct.imageUrl,
        txHash: newProduct.txHash,
      },
    });
  } catch (error: any) {
    console.error('Error adding product:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to add product',
    });
  }
};

/**
 * Get vendor stats
 * GET /api/v1/products/vendors/:walletAddress/stats
 */
export const getVendorStats = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;

    const producer = await Producer.findOne({ walletAddress });
    if (!producer) {
      return res.status(404).json({
        status: 'error',
        message: 'Producer not found',
      });
    }

    // Get aggregated stats
    const products = await Product.find({ walletAddress });
    const totalProducts = products.length;
    const totalRevenue = products.reduce((sum, p) => sum + p.revenue, 0);
    const totalSales = products.reduce((sum, p) => sum + p.sales, 0);

    // Calculate monthly growth (simplified - last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentProducts = await Product.find({
      walletAddress,
      createdAt: { $gte: thirtyDaysAgo },
    });

    const monthlyGrowth =
      totalProducts > 0 ? ((recentProducts.length / totalProducts) * 100).toFixed(1) : 0;

    // Update producer stats
    producer.totalProducts = totalProducts;
    producer.totalRevenue = totalRevenue;
    producer.totalSales = totalSales;
    producer.monthlyGrowth = Number(monthlyGrowth);
    await producer.save();

    return res.status(200).json({
      status: 'success',
      data: {
        totalProducts,
        totalRevenue,
        totalSales,
        avgRating: producer.avgRating,
        monthlyGrowth: producer.monthlyGrowth,
      },
    });
  } catch (error: any) {
    console.error('Error getting vendor stats:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get vendor stats',
    });
  }
};

/**
 * Get vendor products
 * GET /api/v1/products/vendors/:walletAddress/products
 */
export const getVendorProducts = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;
    const { status, category, limit = 50, offset = 0 } = req.query;

    const query: any = { walletAddress };

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(offset));

    const total = await Product.countDocuments(query);

    return res.status(200).json({
      status: 'success',
      data: {
        products,
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  } catch (error: any) {
    console.error('Error getting vendor products:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get vendor products',
    });
  }
};

/**
 * Get vendor orders
 * GET /api/v1/products/vendors/:walletAddress/orders
 */
export const getVendorOrders = async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;
    const { status, limit = 50, offset = 0 } = req.query;

    const query: any = { vendorWalletAddress: walletAddress };

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ orderDate: -1 })
      .limit(Number(limit))
      .skip(Number(offset));

    const total = await Order.countDocuments(query);

    return res.status(200).json({
      status: 'success',
      data: {
        orders,
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  } catch (error: any) {
    console.error('Error getting vendor orders:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get vendor orders',
    });
  }
};

/**
 * Get all products (for shop page)
 * GET /api/v1/products
 */
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { status = ProductStatus.Available, category, limit = 50, offset = 0 } = req.query;

    const query: any = { status };

    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(offset));

    const total = await Product.countDocuments(query);

    return res.status(200).json({
      status: 'success',
      data: {
        products,
        total,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  } catch (error: any) {
    console.error('Error getting products:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get products',
    });
  }
};

/**
 * Get product by ID
 * GET /api/v1/products/:productId
 */
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({ productId: Number(productId) });

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
    }

    // Increment views
    product.views += 1;
    await product.save();

    return res.status(200).json({
      status: 'success',
      data: product,
    });
  } catch (error: any) {
    console.error('Error getting product:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get product',
    });
  }
};

/**
 * Get HBAR to USD conversion rate
 * GET /api/v1/products/conversion/hbar-to-usd
 */
export const getConversionRate = async (req: Request, res: Response) => {
  try {
    const { amount } = req.query;

    if (amount) {
      const hbar = Number(amount);
      const usd = hbarToUsd(hbar);

      return res.status(200).json({
        status: 'success',
        data: {
          hbar,
          usd,
          rate: HBAR_TO_USD,
        },
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        rate: HBAR_TO_USD,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error getting conversion rate:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to get conversion rate',
    });
  }
};

/**
 * Convert USD to HBAR
 * POST /api/v1/products/conversion/usd-to-hbar
 */
export const convertUsdToHbar = async (req: Request, res: Response) => {
  try {
    const { usd } = req.body;

    if (!usd || isNaN(usd)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid USD amount',
      });
    }

    const hbar = usdToHbar(Number(usd));

    return res.status(200).json({
      status: 'success',
      data: {
        usd: Number(usd),
        hbar,
        rate: HBAR_TO_USD,
      },
    });
  } catch (error: any) {
    console.error('Error converting USD to HBAR:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to convert USD to HBAR',
    });
  }
};

/**
 * Update product status
 * PATCH /api/v1/products/:productId/status
 */
export const updateProductStatus = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { status } = req.body;

    if (!Object.values(ProductStatus).includes(status)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid status',
      });
    }

    const product = await Product.findOneAndUpdate(
      { productId: Number(productId) },
      { status },
      { new: true },
    );

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Product status updated',
      data: product,
    });
  } catch (error: any) {
    console.error('Error updating product status:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to update product status',
    });
  }
};

/**
 * Record a product sale (called after blockchain purchase)
 * POST /api/v1/products/:productId/sale
 */
export const recordProductSale = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const { quantity, totalAmount, customerWalletAddress, customerName, deliveryAddress, txHash } =
      req.body;

    const product = await Product.findOne({ productId: Number(productId) });

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found',
      });
    }

    // Update product stats
    product.sales += quantity;
    product.revenue += totalAmount;
    product.quantity -= quantity;

    if (product.quantity === 0) {
      product.status = ProductStatus.SoldOut;
    }

    await product.save();

    // Create order record
    const order = await Order.create({
      orderId: `ORD-${Date.now()}`,
      productId: Number(productId),
      vendorWalletAddress: product.walletAddress,
      customerWalletAddress,
      customerName,
      productName: product.name,
      quantity,
      totalAmount,
      status: 'Pending',
      deliveryAddress,
      txHash,
      orderDate: new Date(),
    });

    // Update vendor stats
    const producer = await Producer.findOne({ walletAddress: product.walletAddress });
    if (producer) {
      producer.totalSales += quantity;
      producer.totalRevenue += totalAmount;
      await producer.save();
    }

    return res.status(201).json({
      status: 'success',
      message: 'Sale recorded successfully',
      data: {
        orderId: order.orderId,
        productId: product.productId,
        remainingQuantity: product.quantity,
      },
    });
  } catch (error: any) {
    console.error('Error recording sale:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to record sale',
    });
  }
};

/**
 * Fix image URLs for all products (run once)
 * POST /api/v1/products/fix-image-urls
 */ export const fixImageUrls = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({});
    let updated = 0;

    for (const product of products) {
      if (product.imageFileId) {
        // ✅ CORRECT FORMAT
        const newImageUrl = product.imageFileId.startsWith('0.0.')
          ? `https://hashscan.io/testnet/file/${product.imageFileId}`
          : product.imageFileId;

        if (product.imageUrl !== newImageUrl) {
          product.imageUrl = newImageUrl;
          await product.save();
          updated++;
        }
      }
    }

    return res.status(200).json({
      status: 'success',
      message: `Updated ${updated} product image URLs`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fix image URLs';
    console.error('Error fixing image URLs:', error);
    return res.status(500).json({
      status: 'error',
      message,
    });
  }
};
