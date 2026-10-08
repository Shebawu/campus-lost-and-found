import express from 'express';
import { createClaim, getClaimsForItem } from '../controllers/claimController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Route to submit a new claim (Protected - user must be logged in)
router.post('/', authenticateToken, createClaim);

// Route to view all claims for a specific item (Public for now, but usually protected later)
router.get('/item/:item_id', getClaimsForItem);

export default router;