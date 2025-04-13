import SpotifyService from "../services/spotify.service.js";

export const ensureToken = async (req, res, next) => {
  try {
    await SpotifyService.refreshAccessToken();
    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);
    res.status(401).json({ error: "Failed to authenticate with Spotify" });
  }
};
