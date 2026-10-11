import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import { AuthRequest } from '../middleware/auth';

// 1. REGISTER A NEW USER
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, passwordHash, 'student']
    );

    res.status(201).json({ message: 'User registered successfully!', user: newUser.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// 2. LOGIN A USER
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Logged in successfully!',
      token,
      user: {
        id: user.rows[0].id,
        name: user.rows[0].name,
        role: user.rows[0].role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// 3. GET MY ITEMS
export const getMyItems = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const items = await pool.query(
      `SELECT items.*, categories.name AS category_name 
       FROM items 
       LEFT JOIN categories ON items.category_id = categories.id 
       WHERE items.reported_by = $1 
       ORDER BY items.date_reported DESC`,
      [userId]
    );
    res.json(items.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while fetching your items' });
  }
};

// 4. GET MY CLAIMS
export const getMyClaims = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const claims = await pool.query(
      `SELECT claims.*, items.title AS item_title, items.image_url AS item_image, items.type AS item_type 
       FROM claims 
       JOIN items ON claims.item_id = items.id 
       WHERE claims.claimant_id = $1 
       ORDER BY claims.created_at DESC`,
      [userId]
    );
    res.json(claims.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while fetching your claims' });
  }
};