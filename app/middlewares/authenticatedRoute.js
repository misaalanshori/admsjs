import jwt from "jsonwebtoken";
import db from '../models/index.js';


const authenticateToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const dbuser = await db.models.api.APIUser.findByPk(decoded.id);
    const decodedDateSigned = new Date(decoded.dateSigned)
    if (dbuser.hash_valid > decodedDateSigned) return null;
    return dbuser;
  } catch {
    return null;
  }
};

const authenticatedRoute = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).send({
    error: true,
    message: 'No token provided',
    data: null
  });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(403).send({
    error: true,
    message: 'No token provided',
    data: null
  });

  const user = await authenticateToken(token);
  if (user) {
    req.user = user;
    next();
  } else {
    return res.status(500).send({
      error: true,
      message: 'Failed to authenticate token',
      data: null
    });
  }
};

export {authenticateToken, authenticatedRoute};