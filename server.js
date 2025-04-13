import express from 'express';
import cors from 'cors';
import spotifyRoutes from './routes/spotify.routes.js';
import spotifyConfig from './config/spotify.config.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/spotify', spotifyRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(spotifyConfig.PORT, () => {
  console.log(`Server running on port ${spotifyConfig.PORT}`);
});

export default app;