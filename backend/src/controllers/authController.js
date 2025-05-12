const prisma = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { generateToken } = require('../utils/jwtUtils');

exports.registerUser = async (req, res, next) => {
    try {
      const { username, email, password } = req.body;
      const hashedPassword = await hashPassword(password);
  
      const user = await prisma.user.create({
        data: {
          username,
          email,
          password_hash: hashedPassword,
          role: 'CUSTOMER',
        },
      });
  
      const token = generateToken({ id: user.id, role: user.role });
      res.status(201).json({ message: 'User registered', token, user: { id: user.id, username, email, role: user.role } });
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(400).json({ message: 'Username or email already exists' });
      }
      next(error);
    }
  };

exports.loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await comparePassword(password, user.password_hash))) {
      return res.status(401).json({ message: 'invalid email or password' });
    }

    const token = generateToken({ id: user.id, role: user.role });
    res.json({ message: 'Login successful', token, user: { id: user.id, username: user.username, email, role: user.role } });
  } catch (error) {
    next(error);
  }
};