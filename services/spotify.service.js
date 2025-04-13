import axios from "axios";
import spotifyConfig from "../config/spotify.config.js";

let accessToken = "";

class SpotifyService {
  static async refreshAccessToken() {
    try {
      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: spotifyConfig.refreshToken,
          client_id: spotifyConfig.clientId,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization:
              "Basic " +
              Buffer.from(
                `${spotifyConfig.clientId}:${spotifyConfig.clientSecret}`
              ).toString("base64"),
          },
        }
      );

      accessToken = response.data.access_token;
      return accessToken;
    } catch (error) {
      console.error("Error refreshing access token:", error);
      throw error;
    }
  }

  static async getNowPlaying() {
    try {
      if (!accessToken) await this.refreshAccessToken();

      const response = await axios.get(
        "https://api.spotify.com/v1/me/player/currently-playing",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.status === 204) {
        return { is_playing: false };
      }

      return {
        is_playing: true,
        track: {
          name: response.data.item.name,
          artists: response.data.item.artists.map((artist) => artist.name),
          album: response.data.item.album.name,
          duration_ms: response.data.item.duration_ms,
          progress_ms: response.data.progress_ms,
          external_url: response.data.item.external_urls.spotify,
          album_image: response.data.item.album.images[0]?.url,
          uri: response.data.item.uri,
        },
      };
    } catch (error) {
      console.error("Error fetching now playing:", error);
      throw error;
    }
  }

  static async getTopTracks() {
    try {
      if (!accessToken) await this.refreshAccessToken();

      const response = await axios.get(
        "https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=short_term",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      return response.data.items.map((track) => ({
        name: track.name,
        artists: track.artists.map((artist) => artist.name),
        album: track.album.name,
        duration_ms: track.duration_ms,
        external_url: track.external_urls.spotify,
        album_image: track.album.images[0]?.url,
        uri: track.uri,
      }));
    } catch (error) {
      console.error("Error fetching top tracks:", error);
      throw error;
    }
  }

  static async pausePlayback() {
    try {
      if (!accessToken) await this.refreshAccessToken();

      await axios.put(
        "https://api.spotify.com/v1/me/player/pause",
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return true;
    } catch (error) {
      console.error("Error pausing playback:", error);
      throw error;
    }
  }

  static async startPlayback(trackUri) {
    try {
      if (!accessToken) await this.refreshAccessToken();

      await axios.put(
        "https://api.spotify.com/v1/me/player/play",
        { uris: [trackUri] },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return true;
    } catch (error) {
      console.error("Error starting playback:", error);
      throw error;
    }
  }
}

export default SpotifyService;