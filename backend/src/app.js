require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { sequelize, User } = require('./models');
const migrateReviewsToGames = require('./migrations/migrate-to-games');

// Routes
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/games');
const reviewRoutes = require('./routes/reviews');
const genreRoutes = require('./routes/genres');
const seriesRoutes = require('./routes/series');
const studioRoutes = require('./routes/studios');
const uploadRoutes = require('./routes/upload');
const accountRoutes = require('./routes/account');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files statically
const uploadsPath = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/studios', studioRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Dynamic sitemap.xml
app.get('/sitemap.xml', async (req, res) => {
  try {
    const { Game, Review, Genre, Series, Studio } = require('./models');
    const { Op } = require('sequelize');

    const baseUrl = 'https://giercujemy-staa.duckdns.org';

    // Get all games with published reviews
    const games = await Game.findAll({
      attributes: ['slug', 'updatedAt'],
      include: [{
        model: Review,
        as: 'reviews',
        where: { isDraft: false },
        attributes: ['id'],
        required: true
      }],
      order: [['updatedAt', 'DESC']]
    });

    // Get all genres
    const genres = await Genre.findAll({ attributes: ['slug'] });

    // Get all series
    const seriesList = await Series.findAll({ attributes: ['slug'] });

    // Get all studios
    const studios = await Studio.findAll({ attributes: ['slug'] });

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Home page
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}/</loc>\n`;
    xml += '    <changefreq>daily</changefreq>\n';
    xml += '    <priority>1.0</priority>\n';
    xml += '  </url>\n';

    // Game pages
    for (const game of games) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/game/${game.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(game.updatedAt).toISOString().split('T')[0]}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.9</priority>\n';
      xml += '  </url>\n';
    }

    // Genre pages
    for (const genre of genres) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/genres/${genre.slug}</loc>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.6</priority>\n';
      xml += '  </url>\n';
    }

    // Series pages
    for (const s of seriesList) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/series/${s.slug}</loc>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.6</priority>\n';
      xml += '  </url>\n';
    }

    // Studio pages
    for (const studio of studios) {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/studios/${studio.slug}</loc>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.6</priority>\n';
      xml += '  </url>\n';
    }

    xml += '</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Create default admin user if not exists
const createDefaultAdmin = async () => {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    let existingAdmin = await User.findOne({ where: { username: adminUsername } });
    
    if (!existingAdmin) {
      existingAdmin = await User.create({
        username: adminUsername,
        passwordHash: adminPassword,
        role: 'admin',
        displayName: 'Administrator'
      });
      console.log(`✅ Default admin user created: ${adminUsername}`);
    } else if (existingAdmin.role !== 'admin') {
      await existingAdmin.update({ role: 'admin' });
      console.log(`✅ Updated existing user "${adminUsername}" to admin role`);
    }
  } catch (error) {
    console.error('Error creating/updating default admin:', error);
  }
};

// Initialize database and start server
const startServer = async () => {
  try {
    // Try enabling pg_trgm and unaccent extensions for fuzzy search
    try {
      await sequelize.query('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
      console.log('✅ PostgreSQL pg_trgm extension enabled');
    } catch (err) {
      console.log('ℹ️ pg_trgm extension not available (fallback search will be used)');
    }

    try {
      await sequelize.query('CREATE EXTENSION IF NOT EXISTS unaccent;');
      console.log('✅ PostgreSQL unaccent extension enabled');
    } catch (err) {
      // Ignored if not permitted
    }

    // Sync database schema
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized');

    // Create default admin
    await createDefaultAdmin();

    // Run review-to-game migration for existing data
    await migrateReviewsToGames();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📁 Uploads served from /uploads`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
