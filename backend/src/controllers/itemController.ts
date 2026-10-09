import { Request, Response } from 'express';
import pool from '../config/db';
import cloudinary from '../config/cloudinary';
import { AuthRequest } from '../middleware/auth';

// 1. CREATE A NEW ITEM (Report a Lost or Found item)
export const createItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { category_id, title, description, type, location } = req.body;

    let imageUrl = null;

    if (req.file) {
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'campus_lost_found' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(req.file!.buffer);
      });

      imageUrl = result.secure_url;
    }

    const newItem = await pool.query(
      'INSERT INTO items (reported_by, category_id, title, description, type, location, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, category_id, title, description, type, location, imageUrl]
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