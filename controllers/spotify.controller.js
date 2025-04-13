import SpotifyService from '../services/spotify.service.js';

export async function getNowPlaying(req, res) {
    try {
        const nowPlaying = await SpotifyService.getNowPlaying();
        res.json(nowPlaying);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch currently playing track' });
    }
}

export async function getTopTracks(req, res) {
    try {
        const topTracks = await SpotifyService.getTopTracks();
        res.json({ tracks: topTracks });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch top tracks' });
    }
}

export async function pausePlayback(req, res) {
    try {
        await SpotifyService.pausePlayback();
        res.json({ success: true, message: 'Playback paused' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to pause playback' });
    }
}

export async function startPlayback(req, res) {
    try {
        const { track_uri } = req.query;
        if (!track_uri) {
            return res.status(400).json({ error: 'track_uri parameter is required' });
        }
        
        await SpotifyService.startPlayback(track_uri);
        res.json({ success: true, message: 'Playback started' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to start playback' });
    }
}

export function generateAuthUrl() {
    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.append('client_id', process.env.SPOTIFY_CLIENT_ID);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', process.env.REDIRECT_URI);
    authUrl.searchParams.append('scope', 'user-read-currently-playing user-top-read user-modify-playback-state');
    return authUrl.toString();
}