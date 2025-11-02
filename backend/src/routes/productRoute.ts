import express from 'express';
import {
  registerProducer,
  addProduct,
  getVendorStats,
  getVendorProducts,
  getVendorOrders,
  getAllProducts,
  getProductById,
  getConversionRate,
  convertUsdToHbar,
  updateProductStatus,
  recordProductSale,
  fixImageUrls,
} from '../controllers/productController.js';

const router = express.Router();

// Producer/Vendor Management
router.post('/producers', registerProducer);

// Product Management
router.post('/', addProduct);
router.get('/', getAllProducts);
router.get('/:productId', getProductById);
router.patch('/:productId/status', updateProductStatus);
router.post('/:productId/sale', recordProductSale);

// Vendor-specific endpoints
router.get('/vendors/:walletAddress/stats', getVendorStats);
router.get('/vendors/:walletAddress/products', getVendorProducts);
router.get('/vendors/:walletAddress/orders', getVendorOrders);

// Currency Conversion
router.get('/conversion/hbar-to-usd', getConversionRate);
router.post('/conversion/usd-to-hbar', convertUsdToHbar);
router.post('/fix-image-urls', fixImageUrls);

export default router;
