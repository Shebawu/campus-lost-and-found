import express from 'express';
import multer from 'multer';
import { createItem, getAllItems, getItemById } from '../controllers/itemController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Configure multer to store files in memory (RAM) briefly
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// Public route: Anyone can see all items
router.get('/', getAllItems);

// Protected route: Only logged-in users can create items
router.post('/', authenticateToken, upload.single('image'), createItem);

// Public route: Anyone can see a single item by ID
router.get('/:id', getItemById);

export default router;