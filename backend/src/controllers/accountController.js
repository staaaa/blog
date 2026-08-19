const { User, Game, Review, Favorite, ReadMark, Genre, Studio, Series } = require('../models');
const bcrypt = require('bcryptjs');

// PUT /api/account/profile - Update displayName and avatarUrl
const updateProfile = async (req, res) => {
  try {
    const { displayName, avatarUrl } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }

    await user.update({
      displayName: displayName !== undefined ? displayName.trim() : user.displayName,
      avatarUrl: avatarUrl !== undefined ? avatarUrl : user.avatarUrl
    });

    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Błąd serwera podczas aktualizacji profilu' });
  }
};

// PUT /api/account/password - Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Obecne hasło i nowe hasło są wymagane' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Nowe hasło musi mieć co najmniej 6 znaków' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }

    const isValid = await user.validatePassword(currentPassword);
    if (!isValid) {
      return res.status(400).json({ error: 'Obecne hasło jest nieprawidłowe' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await user.update({ passwordHash: newHash });

    res.json({ message: 'Hasło zostało zmienione pomyślnie' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Błąd serwera podczas zmiany hasła' });
  }
};

// GET /api/account/favorites - Get user's favorited games
const getFavorites = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: Game,
          as: 'favoriteGames',
          include: [
            { model: Genre, as: 'genres' },
            { model: Studio, as: 'studio' },
            { model: Series, as: 'series' },
            {
              model: Review,
              as: 'reviews',
              where: { isDraft: false },
              required: false,
              include: [
                { model: User, as: 'author', attributes: ['id', 'username', 'displayName', 'avatarUrl'] }
              ]
            }
          ]
        }
      ]
    });

    const games = (user ? user.favoriteGames : []).map(g => {
      const plain = g.toJSON();
      const published = (plain.reviews || []).filter(r => !r.isDraft);
      const avg = published.length > 0
        ? parseFloat((published.reduce((s, r) => s + (r.averageRating || 0), 0) / published.length).toFixed(1))
        : 0;

      return {
        ...plain,
        averageRating: avg,
        reviewCount: published.length
      };
    });

    res.json(games);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Błąd serwera podczas pobierania ulubionych' });
  }
};

// POST /api/account/favorites/:gameId - Toggle favorite
const toggleFavorite = async (req, res) => {
  try {
    const gameId = parseInt(req.params.gameId);
    const existing = await Favorite.findOne({
      where: { userId: req.user.id, gameId }
    });

    let favorited = false;
    if (existing) {
      await existing.destroy();
      favorited = false;
    } else {
      await Favorite.create({ userId: req.user.id, gameId });
      favorited = true;
    }

    const favoriteCount = await Favorite.count({ where: { gameId } });
    return res.json({
      favorited,
      favoriteCount,
      message: favorited ? 'Dodano do ulubionych' : 'Usunięto z ulubionych'
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ error: 'Błąd serwera podczas zmiany ulubionych' });
  }
};

// GET /api/account/read - Get user's read reviews
const getReadMarks = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          model: Review,
          as: 'readReviews',
          include: [
            { model: Game, as: 'game' },
            { model: User, as: 'author', attributes: ['id', 'username', 'displayName', 'avatarUrl'] }
          ]
        }
      ]
    });

    res.json(user ? user.readReviews : []);
  } catch (error) {
    console.error('Get read marks error:', error);
    res.status(500).json({ error: 'Błąd serwera podczas pobierania przeczytanych' });
  }
};

// POST /api/account/read/:reviewId - Toggle read mark
const toggleReadMark = async (req, res) => {
  try {
    const reviewId = parseInt(req.params.reviewId);
    const existing = await ReadMark.findOne({
      where: { userId: req.user.id, reviewId }
    });

    if (existing) {
      await existing.destroy();
      return res.json({ isRead: false, message: 'Oznaczono jako nieprzeczytaną' });
    } else {
      await ReadMark.create({ userId: req.user.id, reviewId });
      return res.json({ isRead: true, message: 'Oznaczono jako przeczytaną' });
    }
  } catch (error) {
    console.error('Toggle read mark error:', error);
    res.status(500).json({ error: 'Błąd serwera podczas oznaczania jako przeczytana' });
  }
};

module.exports = {
  updateProfile,
  changePassword,
  getFavorites,
  toggleFavorite,
  getReadMarks,
  toggleReadMark
};
