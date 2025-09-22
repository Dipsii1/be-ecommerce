// middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// khusus User
const verifyUserToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token user tidak ditemukan' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'user' && decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Akses hanya untuk user/admin' });
    }
    req.user = decoded; // { userId, email, role }
    next();
  } catch {
    return res.status(401).json({ error: 'Token user tidak valid' });
  }
};

// khusus Merchant
const verifyMerchantToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token merchant tidak ditemukan' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'merchant' && decoded.role !== 'admin') {
      return res
        .status(403)
        .json({ error: 'Akses hanya untuk merchant/admin' });
    }
    req.merchant = decoded; // { merchantId, shopName, role }
    next();
  } catch {
    return res.status(401).json({ error: 'Token merchant tidak valid' });
  }
};

module.exports = { verifyUserToken, verifyMerchantToken };
