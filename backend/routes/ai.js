// Daisy GT - AI Routes (Gemini API)
// Author: Douglas Owens Jr.
// Emotion detection, mood colors, persona learning

const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { db, authenticateToken } = require('../server');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// ============ MOOD-BASED COLOR GENERATION ============
router.post('/mood-color', authenticateToken, async (req, res) => {
  try {
    const { facialExpression, heartRate, speed, gForce, recentRaceResult } = req.body;
    
    const prompt = `You are Daisy, an AI racing companion. Based on this driver's real-time data:
      - Facial expression: ${facialExpression || 'neutral'}
      - Heart rate: ${heartRate || 'unknown'} bpm
      - Current speed: ${speed || 0} mph
      - G-force: ${gForce || 0} G
      - Last race result: ${recentRaceResult || 'no race yet'}
      
      Generate a racing-themed UI color scheme. Return ONLY valid JSON with:
      {
        "primary": "hex code for main accent",
        "secondary": "hex code for secondary elements", 
        "telemetry": "hex code for data numbers",
        "ghost": "hex code for ghost vehicle",
        "mood_description": "one sentence describing driver's state"
      }
      
      Use aggressive, high-performance racing colors. If driver seems tired, use energizing colors. If excited, use victory colors.`;
    
    const result = await geminiModel.generateContent(prompt);
    const response = result.response.text();
    
    // Parse JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const colorScheme = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      primary: '#FF1800',
      secondary: '#00FFFF',
      telemetry: '#FFFFFF',
      ghost: '#00FF88',
      mood_description: 'Aggressive racing mode engaged'
    };
    
    res.json(colorScheme);
  } catch (error) {
    console.error('Gemini mood-color error:', error);
    // Fallback colors based on speed
    const speed = req.body.speed || 0;
    let fallbackScheme;
    if (speed > 100) {
      fallbackScheme = { primary: '#FF0000', secondary: '#FF4400', telemetry: '#FFFFFF', ghost: '#00FF88', mood_description: 'Hyperspeed mode!' };
    } else if (speed > 60) {
      fallbackScheme = { primary: '#FF6600', secondary: '#FFAA00', telemetry: '#FFFFFF', ghost: '#00FF88', mood_description: 'Pushing hard' };
    } else {
      fallbackScheme = { primary: '#FF1800', secondary: '#00FFFF', telemetry: '#FFFFFF', ghost: '#00FF88', mood_description: 'Ready to race' };
    }
    res.json(fallbackScheme);
  }
});

// ============ PERSONA LEARNING (VOICE + BEHAVIOR) ============
router.post('/persona', authenticateToken, async (req, res) => {
  try {
    const { voiceTranscript, drivingStyle, recentRaces, preferredColor } = req.body;
    
    const prompt = `You are Daisy AI learning a driver's unique persona.
      
      Data collected:
      - Voice sample: "${voiceTranscript || 'No voice data yet'}"
      - Driving style: ${drivingStyle || 'learning'}
      - Recent race results: ${JSON.stringify(recentRaces || [])}
      - Preferred color: ${preferredColor || 'unknown'}
      
      Generate a complete driver persona profile. Return ONLY valid JSON:
      {
        "primary_emotion": "calm/aggressive/focused/tired/excited",
        "recommended_voice_tone": "warm/serious/energetic/calm/coaching",
        "catchphrases": ["3 short phrases Daisy might use for this driver"],
        "color_preference": "hex code based on personality",
        "driving_coach_style": "aggressive/technical/motivational/patient",
        "persona_name": "unique name for this driver's Daisy persona"
      }`;
    
    const result = await geminiModel.generateContent(prompt);
    const response = result.response.text();
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const persona = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      primary_emotion: 'focused',
      recommended_voice_tone: 'energetic',
      catchphrases: ['Let\'s go!', 'Nice line!', 'Push it!'],
      color_preference: '#FF1800',
      driving_coach_style: 'motivational',
      persona_name: 'Daisy'
    };
    
    // Save to database
    await db.query(
      `INSERT INTO user_personas (user_id, persona_data, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id) DO UPDATE SET 
         persona_data = $2, 
         updated_at = NOW()`,
      [req.user.userId, JSON.stringify(persona)]
    );
    
    res.json({ success: true, persona });
  } catch (error) {
    console.error('Persona learning error:', error);
    res.status(500).json({ error: 'Failed to generate persona' });
  }
});

// ============ GET USER'S SAVED PERSONA ============
router.get('/persona', authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT persona_data, updated_at FROM user_personas WHERE user_id = $1`,
      [req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.json({ success: true, persona: null, message: 'No persona saved yet' });
    }
    
    res.json({ success: true, persona: result.rows[0].persona_data, updatedAt: result.rows[0].updated_at });
  } catch (error) {
    console.error('Get persona error:', error);
    res.status(500).json({ error: 'Failed to retrieve persona' });
  }
});

// ============ AI RACE ANALYSIS (POST-RACE) ============
router.post('/race-analysis', authenticateToken, async (req, res) => {
  try {
    const { raceData, telemetry, finishTime, position, bestLap } = req.body;
    
    const prompt = `You are Daisy AI race coach. Analyze this driver's race performance:
      
      Race data: ${JSON.stringify(raceData)}
      Telemetry summary: ${JSON.stringify(telemetry)}
      Finish time: ${finishTime}
      Position: ${position}
      Best lap: ${bestLap}
      
      Provide actionable feedback. Return ONLY valid JSON:
      {
        "strengths": ["array of 2-3 things done well"],
        "improvements": ["array of 2-3 things to work on"],
        "suggestion": "one sentence specific tip to improve next race",
        "morale_boost": "one encouraging sentence"
      }`;
    
    const result = await geminiModel.generateContent(prompt);
    const response = result.response.text();
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      strengths: ["Good speed on straights"],
      improvements: ["Corner entry needs work"],
      suggestion: "Brake 10 meters earlier into turn 3",
      morale_boost: "You're improving every race!"
    };
    
    // Save analysis
    await db.query(
      `INSERT INTO race_analytics (user_id, race_id, analysis_data, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [req.user.userId, raceData?.raceId || null, JSON.stringify(analysis)]
    );
    
    res.json({ success: true, analysis });
  } catch (error) {
    console.error('Race analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze race' });
  }
});

// ============ CHAT WITH DAISY ============
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, context } = req.body;
    
    // Get user's persona for personalized responses
    const personaResult = await db.query(
      `SELECT persona_data FROM user_personas WHERE user_id = $1`,
      [req.user.userId]
    );
    
    const userPersona = personaResult.rows[0]?.persona_data || { driving_coach_style: 'motivational' };
    
    const prompt = `You are Daisy, an AI racing companion integrated into Daisy GT. 
      
      User's persona: ${JSON.stringify(userPersona)}
      Current context: ${context || 'general conversation'}
      
      User message: "${message}"
      
      Respond as a supportive, energetic racing AI. Keep responses under 3 sentences unless asking for detailed help.
      Be encouraging but direct. Use racing terminology occasionally.
      If user asks about telemetry or racing tips, provide specific actionable advice.`;
    
    const result = await geminiModel.generateContent(prompt);
    const response = result.response.text();
    
    res.json({ success: true, reply: response });
  } catch (error) {
    console.error('Chat error:', error);
    res.json({ success: true, reply: "I'm here to help with your race! What do you need?" });
  }
});

module.exports = router;
