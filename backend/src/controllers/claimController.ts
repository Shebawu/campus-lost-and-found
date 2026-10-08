import { Response } from 'express';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth';

// 1. CREATE A CLAIM (A student claims a found item)
export const createClaim = async (req: AuthRequest, res: Response) => {
  try {
    // Get the user ID from the verified token
    const claimant_id = req.user?.id;
    const { item_id, proof_description } = req.body;

    // Check if the item exists and is actually a 'found' item
    const itemCheck = await pool.query('SELECT * FROM items WHERE id = $1', [item_id]);
    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    if (itemCheck.rows[0].type !== 'found') {
      return res.status(400).json({ error: 'You can only claim items that were found' });
    }

    // Insert the claim into the database
    const newClaim = await pool.query(
      'INSERT INTO claims (item_id, claimant_id, proof_description) VALUES ($1, $2, $3) RETURNING *',
      [item_id, claimant_id, proof_description]
    );

    res.status(201).json({ message: 'Claim submitted successfully!', claim: newClaim.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while creating claim' });
  }
};

// 2. GET CLAIMS FOR A SPECIFIC ITEM (Usually for the item owner or admin to review)
export const getClaimsForItem = async (req: AuthRequest, res: Response) => {
  try {
    const { item_id } = req.params;
    
    const claims = await pool.query(
      `SELECT claims.*, users.name AS claimant_name, users.email AS claimant_email 
       FROM claims 
       JOIN users ON claims.claimant_id = users.id 
       WHERE claims.item_id = $1`,
      [item_id]
    );

    res.json(claims.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while fetching claims' });
  }
};