import express from 'express';
import { registerUser, loginUser } from '../controllers/userController';

const router = express.Router();

// Route to register a new user
router.post('/register', registerUser);

// Route to login
router.post('/login', loginUser);

export default router;