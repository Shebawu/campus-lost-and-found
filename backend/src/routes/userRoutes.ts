import express from 'express';
import { registerUser, loginUser, getMyItems, getMyClaims } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected routes (require login)
router.get('/me/items', authenticateToken, getMyItems);
router.get('/me/claims', authenticateToken, getMyClaims);

export default router;