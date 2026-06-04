// Daisy GT - Racing Routes
// Author: Douglas Owens Jr.
// Race creation, telemetry, ghost system, real-time tracking

const express = require('express');
const router = express.Router();
const { db, authenticateToken, io } = require('../server');

// ============ CREATE A NEW RACE ============
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { 
      raceName, 
      maxRacers, 
      isPrivate, 
      vehicleId, 
      route, 
      raceType,
      isBracket,
      entryFee
    } = req.body;
    
    const result = await db.query(
      `INSERT INTO races (
        creator_id, race_name, max_racers, is_private, status, 
        route_data, race_type, is_bracket, entry_fee, created_at
      ) VALUES ($1, $2, $3, $4, 'waiting', $5, $6, $7, $8, NOW())
      RETURNING *`,
      [req.user.userId, raceName, maxRacers || 12, isPrivate || false, 
       JSON.stringify(route || {}), raceType || 'drag', isBracket || false, entryFee || 0]
    );
    
    res.json({ success: true, race: result.rows[0] });
  } catch (error) {
    console.error('Create race error:', error);
    res.status(500).json({ error: 'Failed to create race' });
  }
});

// ============ JOIN A RACE ============
router.post('/join/:raceId', authenticateToken, async (req, res) => {
  try {
    const { raceId } = req.params;
    const { vehicleId } = req.body;
    
    // Check if race exists
    const race = await db.query('SELECT * FROM races WHERE id = $1', [raceId]);
    if (race.rows.length === 0) {
      return res.status(404).json({ error: 'Race not found' });
    }
    
    // Check if race is full
    const participantCount = await db.query(
      'SELECT COUNT(*) FROM race_participants WHERE race_id = $1',
      [raceId]
    );
    
    if (parseInt(participantCount.rows[0].count) >= race.rows[0].max_racers) {
      return res.status(400).json({ error: 'Race is full' });
    }
    
    // Check if already joined
    const existing = await db.query(
      'SELECT * FROM race_participants WHERE race_id = $1 AND user_id = $2',
      [raceId, req.user.userId]
    );
    
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Already joined this race' });
    }
    
    // Join race
    await db.query(
      `INSERT INTO race_participants (race_id, user_id, vehicle_id, joined_at)
       VALUES ($1, $2, $3, NOW())`,
      [raceId, req.user.userId, vehicleId]
    );
    
    // Notify via WebSocket
    io.to(`race_${raceId}`).emit('player_joined', { 
      userId: req.user.userId,
      username: req.user.username 
    });
    
    res.json({ success: true, message: 'Joined race' });
  } catch (error) {
    console.error('Join race error:', error);
    res.status(500).json({ error: 'Failed to join race' });
  }
});

// ============ START RACE ============
router.post('/start/:raceId', authenticateToken, async (req, res) => {
  try {
    const { raceId } = req.params;
    
    // Verify user is race creator
    const race = await db.query('SELECT * FROM races WHERE id = $1', [raceId]);
    if (race.rows.length === 0) {
      return res.status(404).json({ error: 'Race not found' });
    }
    
    if (race.rows[0].creator_id !== req.user.userId) {
      return res.status(403).json({ error: 'Only race creator can start' });
    }
    
    // Update race status
    await db.query(
      `UPDATE races SET status = 'racing', started_at = NOW() WHERE id = $1`,
      [raceId]
    );
    
    // Get all participants
    const participants = await db.query(
      `SELECT rp.*, u.username, u.display_name 
       FROM race_participants rp
       JOIN users u ON rp.user_id = u.id
       WHERE rp.race_id = $1`,
      [raceId]
    );
    
    // Notify all participants
    io.to(`race_${raceId}`).emit('race_started', { 
      raceId, 
      participants: participants.rows,
      startTime: new Date()
    });
    
    res.json({ success: true, message: 'Race started', participants: participants.rows });
  } catch (error) {
    console.error('Start race error:', error);
    res.status(500).json({ error: 'Failed to start race' });
  }
});

// ============ SUBMIT TELEMETRY (REAL-TIME) ============
router.post('/telemetry/:raceId', authenticateToken, async (req, res) => {
  try {
    const { raceId } = req.params;
    const { 
      speed, lat, lng, altitude, heading, 
      gForce, rpm, throttle, brake, gear 
    } = req.body;
    
    // Store telemetry
    await db.query(
      `INSERT INTO telemetry_data (
        race_id, user_id, speed, latitude, longitude, altitude, 
        heading, g_force, rpm, throttle, brake, gear, timestamp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
      [raceId, req.user.userId, speed, lat, lng, altitude, heading, 
       gForce, rpm, throttle, brake, gear]
    );
    
    // Broadcast to race participants and spectators
    io.to(`race_${raceId}`).emit('telemetry_update', {
      userId: req.user.userId,
      speed,
      lat,
      lng,
      heading,
      gForce,
      rpm,
      timestamp: new Date()
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Telemetry error:', error);
    res.status(500).json({ error: 'Failed to record telemetry' });
  }
});

// ============ GET RACE STATUS ============
router.get('/status/:raceId', authenticateToken, async (req, res) => {
  try {
    const { raceId } = req.params;
    
    const race = await db.query('SELECT * FROM races WHERE id = $1', [raceId]);
    if (race.rows.length === 0) {
      return res.status(404).json({ error: 'Race not found' });
    }
    
    const participants = await db.query(
      `SELECT rp.*, u.username, u.display_name, u.avatar_url,
        (SELECT speed FROM telemetry_data 
         WHERE race_id = $1 AND user_id = rp.user_id 
         ORDER BY timestamp DESC LIMIT 1) as last_speed
       FROM race_participants rp
       JOIN users u ON rp.user_id = u.id
       WHERE rp.race_id = $1`,
      [raceId]
    );
    
    const latestTelemetry = await db.query(
      `SELECT DISTINCT ON (user_id) user_id, speed, latitude, longitude, heading, g_force, rpm, timestamp
       FROM telemetry_data
       WHERE race_id = $1
       ORDER BY user_id, timestamp DESC`,
      [raceId]
    );
    
    res.json({
      race: race.rows[0],
      participants: participants.rows,
      liveTelemetry: latestTelemetry.rows
    });
  } catch (error) {
    console.error('Race status error:', error);
    res.status(500).json({ error: 'Failed to get race status' });
  }
});

// ============ FINISH RACE ============
router.post('/finish/:raceId', authenticateToken, async (req, res) => {
  try {
    const { raceId } = req.params;
    const { finishTime, position } = req.body;
    
    // Verify user is in race
    const participant = await db.query(
      'SELECT * FROM race_participants WHERE race_id = $1 AND user_id = $2',
      [raceId, req.user.userId]
    );
    
    if (participant.rows.length === 0) {
      return res.status(403).json({ error: 'Not a participant in this race' });
    }
    
    // Update participant finish data
    await db.query(
      `UPDATE race_participants 
       SET finish_time = $1, final_position = $2, finished_at = NOW()
       WHERE race_id = $3 AND user_id = $4`,
      [finishTime, position, raceId, req.user.userId]
    );
    
    // Check if all finished
    const allParticipants = await db.query(
      'SELECT * FROM race_participants WHERE race_id = $1',
      [raceId]
    );
    
    const finishedCount = await db.query(
      'SELECT COUNT(*) FROM race_participants WHERE race_id = $1 AND finished_at IS NOT NULL',
      [raceId]
    );
    
    if (parseInt(finishedCount.rows[0].count) === allParticipants.rows.length) {
      // Race complete - calculate final results
      const results = await db.query(
        `SELECT rp.*, u.username, u.display_name
         FROM race_participants rp
         JOIN users u ON rp.user_id = u.id
         WHERE rp.race_id = $1
         ORDER BY rp.final_position ASC NULLS LAST, rp.finish_time ASC`,
        [raceId]
      );
      
      await db.query(`UPDATE races SET status = 'completed', completed_at = NOW() WHERE id = $1`, [raceId]);
      
      io.to(`race_${raceId}`).emit('race_completed', { results: results.rows });
      
      res.json({ success: true, raceComplete: true, results: results.rows });
    } else {
      io.to(`race_${raceId}`).emit('player_finished', { 
        userId: req.user.userId, 
        finishTime, 
        position 
      });
      
      res.json({ success: true, raceComplete: false });
    }
  } catch (error) {
    console.error('Finish race error:', error);
    res.status(500).json({ error: 'Failed to record finish' });
  }
});

// ============ GET RACE HISTORY ============
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    
    const result = await db.query(
      `SELECT r.*, 
        (SELECT COUNT(*) FROM race_participants WHERE race_id = r.id) as participant_count,
        (SELECT final_position FROM race_participants WHERE race_id = r.id AND user_id = $1) as my_position
       FROM races r
       WHERE r.status = 'completed' AND (r.is_private = false OR r.creator_id = $1)
       ORDER BY r.completed_at DESC
       LIMIT $2`,
      [req.user.userId, limit]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Race history error:', error);
    res.status(500).json({ error: 'Failed to get race history' });
  }
});

// ============ GET ACTIVE RACES (FOR SPECTATOR MODE) ============
router.get('/active', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT r.*, u.username as creator_name,
        (SELECT COUNT(*) FROM race_participants WHERE race_id = r.id) as racer_count
       FROM races r
       JOIN users u ON r.creator_id = u.id
       WHERE r.status = 'racing' AND r.is_private = false
       ORDER BY r.started_at DESC
       LIMIT 20`
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Active races error:', error);
    res.status(500).json({ error: 'Failed to get active races' });
  }
});

module.exports = router;
