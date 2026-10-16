import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth';

// 1. GET ALL NOTIFICATIONS FOR THE LOGGED-IN USER
export const getMyNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await pool.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while fetching notifications' });
  }
};

// 2. GET UNREAD COUNT
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const result = await pool.query(
      `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read = FALSE`,
      [userId]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while fetching unread count' });
  }
};

// 3. MARK A NOTIFICATION AS READ
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const result = await pool.query(
      `UPDATE notifications SET read = TRUE 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    res.json({ message: 'Notification marked as read', notification: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while updating notification' });
  }
};

// 4. MARK ALL AS READ
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    await pool.query(
      `UPDATE notifications SET read = TRUE WHERE user_id = $1 AND read = FALSE`,
      [userId]
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while updating notifications' });
  }
};

// 5. HELPER: CREATE NOTIFICATION (used by other controllers)
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: string = 'info',
  relatedItemId: string | null = null
) => {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, type, related_item_id) 
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, title, message, type, relatedItemId]
    );
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};