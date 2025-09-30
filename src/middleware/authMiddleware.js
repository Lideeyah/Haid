// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');


function authMiddleware(req, res, next) {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Fetch full user profile from DB
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    prisma.user.findUnique({ where: { id: decoded.id } })
      .then(user => {
        if (!user) return res.status(401).json({ message: 'User not found' });
        req.user = user;
        next();
      })
      .catch(err => {
        res.status(500).json({ message: 'Error fetching user profile' });
      });
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}

module.exports = authMiddleware;
