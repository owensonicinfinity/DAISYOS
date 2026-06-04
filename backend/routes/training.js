const express = require('express');
const router = express.Router();
const { db, authenticateToken } = require('../server-core');

// Log workout
router.post('/log', authenticateToken, async (req, res) => {
  const { workoutType, metrics } = req.body;
  
  const result = await db.query(
    `INSERT INTO physical_workouts (user_id, workout_type, metrics, performed_at)
     VALUES ($1, $2, $3, NOW()) RETURNING *`,
    [req.user.userId, workoutType, JSON.stringify(metrics)]
  );
  
  // Update leaderboard based on workout type
  if (workoutType === 'bench_press' && metrics.weight && metrics.reps) {
    const oneRepMax = metrics.weight * (1 + metrics.reps / 30);
    await db.query(
      `INSERT INTO leaderboards (user_id, category, value, updated_at)
       VALUES ($1, 'bench_press_max', $2, NOW())
       ON CONFLICT (user_id, category) DO UPDATE SET value = GREATEST(leaderboards.value, $2)`,
      [req.user.userId, oneRepMax]
    );
  }
  
  if (workoutType === 'pullups' && metrics.reps) {
    await db.query(
      `INSERT INTO leaderboards (user_id, category, value, updated_at)
       VALUES ($1, 'pullups_max', $2, NOW())
       ON CONFLICT (user_id, category) DO UPDATE SET value = GREATEST(leaderboards.value, $2)`,
      [req.user.userId, metrics.reps]
    );
  }
  
  if (workoutType === 'punch_speed' && metrics.speed) {
    await db.query(
      `INSERT INTO leaderboards (user_id, category, value, updated_at)
       VALUES ($1, 'punch_speed', $2, NOW())
       ON CONFLICT (user_id, category) DO UPDATE SET value = GREATEST(leaderboards.value, $2)`,
      [req.user.userId, metrics.speed]
    );
  }
  
  res.json({ success: true, workout: result.rows[0] });
});

// Get user's workout history
router.get('/history', authenticateToken, async (req, res) => {
  const { limit = 50 } = req.query;
  const result = await db.query(
    `SELECT * FROM physical_workouts 
     WHERE user_id = $1 
     ORDER BY performed_at DESC 
     LIMIT $2`,
    [req.user.userId, limit]
  );
  res.json(result.rows);
});

// Get leaderboards
router.get('/leaderboard/:category', async (req, res) => {
  const { category } = req.params;
  const { limit = 100 } = req.query;
  
  const result = await db.query(
    `SELECT u.username, u.display_name, u.avatar_url, l.value
     FROM leaderboards l
     JOIN users u ON l.user_id = u.id
     WHERE l.category = $1
     ORDER BY l.value DESC
     LIMIT $2`,
    [category, limit]
  );
  
  res.json(result.rows);
});

module.exports = router;