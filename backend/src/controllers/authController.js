const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Register new reader account
const register = async (req, res) => {
  try {
    const { username, password, displayName } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Nazwa użytkownika i hasło są wymagane' });
    }

    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({ error: 'Nazwa użytkownika musi mieć od 3 do 50 znaków' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Hasło musi mieć co najmniej 6 znaków' });
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ error: 'Użytkownik o tej nazwie już istnieje' });
    }

    const user = await User.create({
      username,
      passwordHash: password,
      role: 'reader',
      displayName: displayName || username
    });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Błąd serwera podczas rejestracji' });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Nazwa użytkownika i hasło są wymagane' });
    }

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });
    }

    const isValid = await user.validatePassword(password);

    if (!isValid) {
      return res.status(401).json({ error: 'Nieprawidłowe dane logowania' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

// Current logged in user
const me = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'role', 'displayName', 'avatarUrl']
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }

    res.json(user);
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
};

module.exports = { register, login, me };
