import 'dotenv/config';
import express from 'express';
import { authenticateJWT } from './middlewares/authenticateJWT';
import authRoutes from './routes/auth.routes';
import studentRoutes from './routes/student.routes';
import parentRoutes from './routes/parent.routes';
import { createServer } from 'http';
import { initSocket } from './lib/socket';
import { initDb } from './db/index';

initDb();

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/student', studentRoutes);
app.use('/api/parent', parentRoutes);

// A public route (No middleware)
app.get('/public', (req, res) => {
  res.json({ message: "Anyone can see this!" });
});

// A protected route (Uses JWT middleware)
app.get('/protected', authenticateJWT, (req, res) => {
  // req.auth is available because the middleware verified the token!
  res.json({ 
    message: "You are authenticated!", 
    user: req.auth 
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
