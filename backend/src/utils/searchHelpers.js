const { foldDiacritics } = require('./slugify');

// Normalize string: lowercase, remove punctuation & diacritics
const normalizeForSearch = (str) => {
  if (!str) return '';
  return foldDiacritics(str.toLowerCase())
    .replace(/[^a-z0-9]/g, '');
};

// Extract search tokens (words)
const getTokens = (str) => {
  if (!str) return [];
  return foldDiacritics(str.toLowerCase())
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 0);
};

// Levenshtein distance between two strings
const levenshtein = (a, b) => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

// Check if query word fuzzy matches target word
const wordFuzzyMatch = (qWord, tWord) => {
  if (qWord === tWord) return { match: true, score: 1.0 };
  if (tWord.includes(qWord)) return { match: true, score: qWord.length / tWord.length };
  if (qWord.includes(tWord) && tWord.length >= 2) return { match: true, score: tWord.length / qWord.length };

  const maxDistance = qWord.length >= 8 ? 2 : (qWord.length >= 3 ? 1 : 0);
  if (maxDistance > 0) {
    const dist = levenshtein(qWord, tWord);
    if (dist <= maxDistance) {
      const similarity = 1 - (dist / Math.max(qWord.length, tWord.length));
      return { match: true, score: similarity * 0.85 };
    }
  }

  return { match: false, score: 0 };
};

// Calculate match score for a game and its reviews
const calculateGameFuzzyScore = (game, rawQuery, normalizedQuery, queryTokens) => {
  let score = 0;

  const gameTitle = game.gameTitle || '';
  const gameTitleNorm = normalizeForSearch(gameTitle);
  const gameTokens = getTokens(gameTitle);

  // 1. Exact or normalized full match on Game Title
  if (gameTitleNorm === normalizedQuery) {
    return 1000;
  }
  if (gameTitleNorm.includes(normalizedQuery) && normalizedQuery.length >= 2) {
    score += 600;
  } else if (normalizedQuery.includes(gameTitleNorm) && gameTitleNorm.length >= 2) {
    score += 450;
  }

  // 2. Full game title Levenshtein distance
  if (normalizedQuery.length >= 3 && gameTitleNorm.length >= 3) {
    const fullTitleDist = levenshtein(normalizedQuery, gameTitleNorm);
    const maxFullAllowed = normalizedQuery.length >= 7 ? 2 : 1;
    if (fullTitleDist <= maxFullAllowed) {
      score += (400 - fullTitleDist * 50);
    }
  }

  // 3. Token-by-token fuzzy matching
  if (queryTokens.length > 0) {
    let matchedGameTokensCount = 0;
    let totalGameTokenScore = 0;

    for (const qWord of queryTokens) {
      let bestWordScore = 0;
      for (const gWord of gameTokens) {
        const { match, score: s } = wordFuzzyMatch(qWord, gWord);
        if (match && s > bestWordScore) {
          bestWordScore = s;
        }
      }
      if (bestWordScore > 0) {
        matchedGameTokensCount++;
        totalGameTokenScore += bestWordScore;
      }
    }

    if (matchedGameTokensCount > 0) {
      const matchRatio = matchedGameTokensCount / queryTokens.length;
      if (matchRatio === 1) {
        score += 500 * (totalGameTokenScore / queryTokens.length);
      } else if (matchRatio >= 0.5) {
        score += 250 * matchRatio;
      } else {
        score += 100 * matchRatio;
      }
    }
  }

  // 4. Content / review titles matching in associated reviews
  if (game.reviews && game.reviews.length > 0 && queryTokens.length > 0) {
    for (const rev of game.reviews) {
      const revTitle = rev.title || '';
      const revContent = foldDiacritics(rev.content || '').toLowerCase();
      const revTokens = getTokens(revTitle);

      let matchedRevTokens = 0;
      for (const qWord of queryTokens) {
        for (const rWord of revTokens) {
          const { match } = wordFuzzyMatch(qWord, rWord);
          if (match) {
            matchedRevTokens++;
            break;
          }
        }
      }
      if (matchedRevTokens > 0) {
        score += 80 * (matchedRevTokens / queryTokens.length);
      }

      let contentHits = 0;
      for (const qWord of queryTokens) {
        if (qWord.length >= 3 && revContent.includes(qWord)) {
          contentHits++;
        }
      }
      if (contentHits > 0) {
        score += 25 * (contentHits / queryTokens.length);
      }
    }
  }

  return score;
};

module.exports = {
  foldDiacritics,
  normalizeForSearch,
  getTokens,
  levenshtein,
  wordFuzzyMatch,
  calculateGameFuzzyScore
};
