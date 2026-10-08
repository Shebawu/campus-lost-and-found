import express from 'express';
import { createItem, getAllItems, getItemById } from '../controllers/itemController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Public routes: Anyone can see the items
router.route('/')
  .get(getAllItems);

// Protected routes: Only logged-in users can create items
router.route('/')
  .post(authenticateToken, createItem);

// Public route: Anyone can see a single item
router.route('/:id')
  .get(getItemById);

export default router;