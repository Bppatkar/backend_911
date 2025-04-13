import express from 'express';
import axios from "axios";
const router = express.Router();
import { ensureToken } from '../middlewares/auth.middleware.js';
import {
    getNowPlaying,
    getTopTracks,
    pausePlayback,
    startPlayback,
    generateAuthUrl
} from '../controllers/spotify.controller.js';

router.get('/auth', (req, res) => {
    try {
        const authUrl = generateAuthUrl();
        res.redirect(authUrl);
    } catch (error) {
        console.error('Auth URL generation error:', error);
        res.status(500).json({ error: 'Failed to generate authorization URL' });
    }
});

router.get('/callback', async (req, res) => {
    try {
      const { code, error } = req.query;
      
      if (error) {
        console.error('Spotify auth error:', error);
        return res.status(400).json({ error: 'User denied access' });
      }
  
      if (!code) {
        return res.status(400).json({ error: 'No authorization code received' });
      }
  
      // Exchange code for tokens
      const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', 
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: process.env.REDIRECT_URI
        }), {
          headers: {
            'Authorization': 'Basic ' + Buffer.from(
              `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
            ).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });
  
      const { access_token, refresh_token, expires_in } = tokenResponse.data;
      
      // Store tokens securely (in DB or session)
      console.log('Successfully authenticated!');
    //   console.log('Access Token:', access_token);
    //   console.log('Refresh Token:', refresh_token);
  
      // Redirect or return tokens
      res.json({ 
        success: true, 
        access_token, 
        expires_in: `${expires_in} seconds` 
      });
      
    }  catch (err) {
        console.error('Full callback error:', {
          message: err.message,
          response: err.response?.data,
          stack: err.stack
        });
        res.status(500).json({ 
          error: 'Authentication failed',
          details: err.response?.data || err.message 
        });
      }
  });

router.get('/now-playing', ensureToken, getNowPlaying);
router.get('/top-tracks', ensureToken, getTopTracks);
router.put('/pause', ensureToken, pausePlayback);
router.put('/play', ensureToken, startPlayback);

export default router;