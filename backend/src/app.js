require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { sequelize, User } = require('./models');

// Routes
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/reviews');
const genreRoutes = require('./routes/genres');
const seriesRoutes = require('./routes/series');
const studioRoutes = require('./routes/studios');
const uploadRoutes = require('./routes/upload');

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
app.use('/api/reviews', reviewRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/series', seriesRoutes);
app.use('/api/studios', studioRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
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

    const existingAdmin = await User.findOne({ where: { username: adminUsername } });
    
    if (!existingAdmin) {
      await User.create({
        username: adminUsername,
        passwordHash: adminPassword
      });
      console.log(`✅ Default admin user created: ${adminUsername}`);
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
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

    // Sync database (create tables if not exist)
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized');

    // Create default admin
    await createDefaultAdmin();

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
