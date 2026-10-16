import express from 'express';
import { 
  getMyNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead 
} from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All routes require login
router.use(authenticateToken);

router.get('/', getMyNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

export default router;