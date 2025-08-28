import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// In-memory user database for demo purposes
const users: any[] = [];

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, dateOfBirth } = req.body;

    // Input validation
    if (!firstName || !lastName || !email || !password || !dateOfBirth) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }



    // Date validation
    let dateOfBirthObj;
    try {
      dateOfBirthObj = new Date(dateOfBirth);
      if (isNaN(dateOfBirthObj.getTime())) {
        throw new Error('Invalid date');
      }
    } catch (error) {
      return res.status(400).json({ message: 'Please provide a valid date of birth' });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = {
      userId: uuidv4(),
      firstName,
      lastName,
      email,
      password: hashedPassword,
      dateOfBirth: dateOfBirthObj
    };

    // Add to "database"
    users.push(newUser);

    // Create JWT
    const token = jwt.sign(
      { userId: newUser.userId, email: newUser.email },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        userId: newUser.userId,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        dateOfBirth: newUser.dateOfBirth
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    // Provide more specific error message if available
    const errorMessage = error.message || 'An unexpected error occurred during registration';
    res.status(500).json({ 
      message: 'Registration failed', 
      detail: errorMessage,
      code: 'REGISTRATION_ERROR'
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create and return JWT
    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Logged in successfully',
      token,
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        dateOfBirth: user.dateOfBirth
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    // Provide more specific error message if available
    const errorMessage = error.message || 'An unexpected error occurred during login';
    res.status(500).json({ 
      message: 'Login failed', 
      detail: errorMessage,
      code: 'LOGIN_ERROR'
    });
  }
});

export default router;
