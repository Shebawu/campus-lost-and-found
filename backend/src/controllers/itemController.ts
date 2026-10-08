import { Request, Response } from 'express';
import pool from '../config/db';

// 1. CREATE A NEW ITEM (Report a Lost or Found item)
export const createItem = async (req: Request, res: Response) => {
  try {
    const { reported_by, category_id, title, description, type, location, image_url } = req.body;

    const newItem = await pool.query(
      'INSERT INTO items (reported_by, category_id, title, description, type, location, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [reported_by, category_id, title, description, type, location, image_url]
    );

    res.status(201).json({ message: 'Item reported successfully!', item: newItem.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while creating item' });
  }
};
// 2. GET ALL ITEMS (with optional filter for lost/found)
export const getAllItems = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    
    let query = 'SELECT * FROM items';
    let values: any[] = [];

    if (type) {
      query += ' WHERE type = $1';
      values.push(type);
    }

    query += ' ORDER BY date_reported DESC';

    const allItems = await pool.query(query, values);
    res.json(allItems.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while fetching items' });
  }
};

// 3. GET A SINGLE ITEM BY ID
export const getItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const item = await pool.query('SELECT * FROM items WHERE id = $1', [id]);

    if (item.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(item.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while fetching item' });
  }
};