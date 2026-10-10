import express from 'express';
import { getAllClaims, updateClaimStatus, getStats } from '../controllers/adminController';
import { authenticateToken } from '../middleware/auth';
import { isAdmin } from '../middleware/admin';

const router = express.Router();

// All routes here require login + admin role
router.use(authenticateToken);
router.use(isAdmin);

router.get('/stats', getStats);
router.get('/claims', getAllClaims);
router.put('/claims/:id', updateClaimStatus);

export default router;