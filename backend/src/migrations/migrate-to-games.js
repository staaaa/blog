/**
 * One-time migration: Reviews → Games + Reviews
 * 
 * For each existing review that has no gameId set:
 *   1. Creates a Game record from the review's game-level fields
 *   2. Copies genre/series/studio associations from review to game
 *   3. Sets review.gameId and review.userId
 * 
 * This script is idempotent — it only processes reviews where gameId IS NULL.
 */

const { sequelize, Review, Game, Genre, User } = require('../models');

const slugify = (text) => {
  return text.toLowerCase()
    .replace(/[ąĄ]/g, 'a').replace(/[ćĆ]/g, 'c').replace(/[ęĘ]/g, 'e')
    .replace(/[łŁ]/g, 'l').replace(/[ńŃ]/g, 'n').replace(/[óÓ]/g, 'o')
    .replace(/[śŚ]/g, 's').replace(/[źŹżŻ]/g, 'z')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

const migrateReviewsToGames = async () => {
  // Find reviews that haven't been migrated yet (no gameId)
  const unmigrated = await Review.findAll({
    where: { gameId: null },
    include: [
      { model: Genre, as: 'genres' }
    ]
  });

  if (unmigrated.length === 0) {
    console.log('ℹ️  No reviews to migrate (all already have gameId).');
    return;
  }

  console.log(`🔄 Migrating ${unmigrated.length} review(s) to Game model...`);

  // Find admin user to assign as creator and author
  const admin = await User.findOne({ where: { role: 'admin' } });
  if (!admin) {
    console.error('❌ No admin user found. Cannot migrate.');
    return;
  }

  const transaction = await sequelize.transaction();

  try {
    for (const review of unmigrated) {
      const gameTitle = review.gameTitle || review.title;
      let slug = slugify(gameTitle);

      // Ensure slug uniqueness
      let existingGame = await Game.findOne({ where: { slug }, transaction });
      let suffix = 1;
      const baseSlug = slug;
      while (existingGame) {
        slug = `${baseSlug}-${suffix}`;
        existingGame = await Game.findOne({ where: { slug }, transaction });
        suffix++;
      }

      // Check if a game with this exact title already exists
      let game = await Game.findOne({
        where: { gameTitle },
        transaction
      });

      if (!game) {
        // Create the Game record from review's game-level data
        game = await Game.create({
          gameTitle,
          slug,
          coverImage: review.coverImage || null,
          releaseDate: review.releaseDate || null,
          soundtrackUrl: review.soundtrackUrl || null,
          platforms: review.platforms || [],
          seriesId: review.seriesId || null,
          studioId: review.studioId || null,
          createdById: admin.id
        }, { transaction });

        // Copy genre associations from review to game
        const genreIds = (review.genres || []).map(g => g.id);
        if (genreIds.length > 0) {
          await game.setGenres(genreIds, { transaction });
        }

        console.log(`  ✅ Created game: "${gameTitle}" (id: ${game.id})`);
      } else {
        console.log(`  ℹ️  Game "${gameTitle}" already exists (id: ${game.id}), linking review.`);
      }

      // Link review to game and assign author
      await review.update({
        gameId: game.id,
        userId: admin.id
      }, { transaction });

      console.log(`  ✅ Linked review "${review.title}" (id: ${review.id}) → game "${gameTitle}" (id: ${game.id})`);
    }

    await transaction.commit();
    console.log(`✅ Migration complete! ${unmigrated.length} review(s) migrated.`);
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

module.exports = migrateReviewsToGames;
