const { User, Review, Game } = require('../models');

// GET /api/admin/users - Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'role', 'displayName', 'avatarUrl', 'createdAt', 'updatedAt'],
      order: [['id', 'ASC']]
    });

    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Błąd serwera podczas pobierania użytkowników' });
  }
};

// POST /api/admin/users - Create user (e.g. admin creates a reviewer directly)
const createUser = async (req, res) => {
  try {
    const { username, password, role, displayName } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Nazwa użytkownika i hasło są wymagane' });
    }

    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(409).json({ error: 'Użytkownik o tej nazwie już istnieje' });
    }

    const user = await User.create({
      username,
      passwordHash: password,
      role: role || 'reviewer',
      displayName: displayName || username
    });

    res.status(201).json({
      id: user.id,
      username: user.username,
      role: user.role,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Błąd serwera podczas tworzenia użytkownika' });
  }
};

// PUT /api/admin/users/:id/role - Update user role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const targetUserId = parseInt(req.params.id);

    if (!['admin', 'reviewer', 'reader'].includes(role)) {
      return res.status(400).json({ error: 'Nieprawidłowa rola. Dostępne: admin, reviewer, reader' });
    }

    const user = await User.findByPk(targetUserId);
    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }

    // Protect against self-demoting the last admin
    if (user.id === req.user.id && role !== 'admin') {
      return res.status(400).json({ error: 'Nie możesz odebrać sobie uprawnień administratora' });
    }

    await user.update({ role });

    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Błąd serwera podczas zmiany roli' });
  }
};

// DELETE /api/admin/users/:id - Delete user
const deleteUser = async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id);

    if (targetUserId === req.user.id) {
      return res.status(400).json({ error: 'Nie możesz usunąć własnego konta administratora' });
    }

    const user = await User.findByPk(targetUserId);
    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }

    await user.destroy();
    res.json({ message: 'Użytkownik został usunięty' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Błąd serwera podczas usuwania użytkownika' });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUserRole,
  deleteUser
};
