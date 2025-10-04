const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { loggerApp: logger } = require('../utils/logger'); // gunakan loggerApp

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    logger.info(`Fetched ${users.length} users`);
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
    });
  } catch (error) {
    logger.error(`Error fetching users: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id))
      return res.status(400).json({ success: false, error: 'Invalid user ID' });

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      logger.warn(`User not found (ID: ${id})`);
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res
      .status(200)
      .json({ success: true, message: 'User retrieved', data: user });
  } catch (error) {
    logger.error(`Error fetching user: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Register user
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, and password are required',
      });
    }

    if (!email.includes('@')) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid email format' });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({
          success: false,
          error: 'Password must be at least 8 characters',
        });
    }

    const [existingUserByEmail, existingUserByUsername] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.user.findUnique({ where: { username } }),
    ]);

    if (existingUserByEmail) {
      return res
        .status(400)
        .json({ success: false, error: 'Email already registered' });
    }

    if (existingUserByUsername) {
      return res
        .status(400)
        .json({ success: false, error: 'Username already taken' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { username, email, password: hashedPassword, role: 'user' },
    });

    const { password: _, ...userWithoutPassword } = newUser;
    logger.info(`User registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: userWithoutPassword,
    });
  } catch (error) {
    logger.error(`Error registering user: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    logger.info(`User login: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user: userWithoutPassword, token },
    });
  } catch (error) {
    logger.error(`Error login user: ${error.message}`, { stack: error.stack });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { username, email, password } = req.body;

    if (isNaN(id))
      return res.status(400).json({ success: false, error: 'Invalid user ID' });

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: userWithoutPassword,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    logger.error(`Error updating user: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.user.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    logger.error(`Error deleting user: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Get current logged-in user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Current user retrieved successfully',
      data: user,
    });
  } catch (error) {
    logger.error(`Error fetching current user: ${error.message}`, {
      stack: error.stack,
    });
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
