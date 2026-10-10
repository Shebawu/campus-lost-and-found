import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth';

// 1. GET ALL CLAIMS (with item and claimant details)
export const getAllClaims = async (req: AuthRequest, res: Response) => {
  try {
    const claims = await pool.query(`
      SELECT 
        claims.*,
        users.name AS claimant_name,
        users.email AS claimant_email,
        items.title AS item_title,
        items.type AS item_type,
        items.image_url AS item_image
      FROM claims
      JOIN users ON claims.claimant_id = users.id
      JOIN items ON claims.item_id = items.id
      ORDER BY claims.created_at DESC
    `);

    res.json(claims.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while fetching claims' });
  }
};

// 2. UPDATE CLAIM STATUS (approve or reject)
export const updateClaimStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "approved" or "rejected"' });
    }

    const updatedClaim = await pool.query(
      'UPDATE claims SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (updatedClaim.rows.length === 0) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    // If approved, mark the item as resolved (returned)
    if (status === 'approved') {
      const claim = updatedClaim.rows[0];
      await pool.query(
        'UPDATE items SET status = $1 WHERE id = $2',
        ['resolved', claim.item_id]
      );
    }

    res.json({ message: `Claim ${status} successfully`, claim: updatedClaim.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while updating claim' });
  }
};

// 3. GET DASHBOARD STATS (for metrics cards)
export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalItems = await pool.query('SELECT COUNT(*) FROM items');
    const lostItems = await pool.query("SELECT COUNT(*) FROM items WHERE type = 'lost'");
    const foundItems = await pool.query("SELECT COUNT(*) FROM items WHERE type = 'found'");
    const pendingClaims = await pool.query("SELECT COUNT(*) FROM claims WHERE status = 'pending'");
    const returnedItems = await pool.query("SELECT COUNT(*) FROM items WHERE status = 'resolved'");

    res.json({
      totalItems: parseInt(totalItems.rows[0].count),
      lostItems: parseInt(lostItems.rows[0].count),
      foundItems: parseInt(foundItems.rows[0].count),
      pendingClaims: parseInt(pendingClaims.rows[0].count),
      returnedItems: parseInt(returnedItems.rows[0].count)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while fetching stats' });
  }
};