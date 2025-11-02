import express from 'express';
import {
  verifyRiderPhone,
  verifyUserPhone,
  saveUserFromContract,
  checkWalletAuth,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/riders/verify-phone', verifyRiderPhone);
router.post('/users/verify-phone', verifyUserPhone);
router.post('/save-user', saveUserFromContract);
router.post('/check-wallet', checkWalletAuth);

export default router;
