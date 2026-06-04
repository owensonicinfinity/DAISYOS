const express = require('express');
const router = express.Router();
const { db, authenticateToken } = require('../server-core');

// Get all NFTs for sale
router.get('/list', authenticateToken, async (req, res) => {
  const result = await db.query(
    `SELECT n.*, u.display_name as creator_name, u2.display_name as owner_name
     FROM nft_assets n
     LEFT JOIN users u ON n.creator_id = u.id
     LEFT JOIN users u2 ON n.owner_id = u2.id
     WHERE n.status = 'minting' OR n.status = 'owned'
     ORDER BY n.created_at DESC`
  );
  res.json(result.rows);
});

// Get user's NFTs
router.get('/my', authenticateToken, async (req, res) => {
  const result = await db.query(
    `SELECT n.*, u.display_name as creator_name, r.race_name
     FROM nft_assets n
     LEFT JOIN users u ON n.creator_id = u.id
     LEFT JOIN races r ON n.race_id = r.id
     WHERE n.owner_id = $1
     ORDER BY n.purchased_at DESC`,
    [req.user.userId]
  );
  res.json(result.rows);
});

// Create NFT
router.post('/create', authenticateToken, async (req, res) => {
  const { raceId, title, description, videoUrl, price } = req.body;
  
  const result = await db.query(
    `INSERT INTO nft_assets (creator_id, owner_id, race_id, title, description, video_url, price, status, created_at)
     VALUES ($1, $1, $2, $3, $4, $5, $6, 'owned', NOW())
     RETURNING *`,
    [req.user.userId, raceId, title, description, videoUrl, price]
  );
  
  res.json({ success: true, nft: result.rows[0] });
});

// Purchase NFT
router.post('/purchase/:nftId', authenticateToken, async (req, res) => {
  const { nftId } = req.params;
  
  const nft = await db.query('SELECT * FROM nft_assets WHERE id = $1', [nftId]);
  if (nft.rows.length === 0) {
    return res.status(404).json({ error: 'NFT not found' });
  }
  
  await db.query(
    `UPDATE nft_assets SET owner_id = $1, status = 'owned', purchased_at = NOW()
     WHERE id = $2`,
    [req.user.userId, nftId]
  );
  
  res.json({ success: true, message: 'NFT purchased' });
});

// Sell NFT
router.post('/sell/:nftId', authenticateToken, async (req, res) => {
  const { nftId } = req.params;
  const { price } = req.body;
  
  await db.query(
    `UPDATE nft_assets SET price = $1, status = 'minting' WHERE id = $2 AND owner_id = $3`,
    [price, nftId, req.user.userId]
  );
  
  res.json({ success: true, message: 'NFT listed for sale' });
});

module.exports = router;