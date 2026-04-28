import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Do not hardcode credentials in source code.
// Provide these via `.env` (ignored by git) or environment variables.
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-dev-secret';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Connect to MongoDB
  if (!MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI not set. API routes will return 503 until configured.');
  } else {
    mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  })
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => {
      console.error('❌ MongoDB connection error:', err.message);
    });
  }

  mongoose.set('bufferCommands', false);

  // Middleware to check database connection
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') && mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: 'Database connection not established. Please check your MongoDB Atlas credentials and network access.',
        status: mongoose.connection.readyState
      });
    }
    next();
  });

  // JWT Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      req.user = decoded;
      next();
    } catch {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
  };

  // ─── Mongoose Schemas ─────────────────────────────────────────────────────

  const userSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String }, // bcrypt hash
    role: { type: String, default: 'USER' },
    photoUrl: { type: String },
    phone: String,
    dateOfBirth: String,
    location: String,
    education: {
      college: String,
      degree: String,
      specialization: String,
      graduationYear: String
    },
    createdAt: { type: Date, default: Date.now }
  });

  const questionSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    text: { type: String, required: true },
    options: [String],
    optionImages: [String],
    correctAnswer: { type: String, required: true },
    category: { type: String, required: true },
    explanation: String,
    imageUrl: { type: String },
    instructions: String,
    createdAt: { type: Date, default: Date.now }
  });

  const testSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    category: String,
    duration: { type: Number, required: true },
    questionIds: [String],
    createdAt: { type: Date, default: Date.now }
  });

  const testResultSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    testId: { type: String, required: true },
    testTitle: { type: String, required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    accuracy: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    subjectWise: mongoose.Schema.Types.Mixed,
    weakAreas: [String]
  });

  const User = mongoose.model('User', userSchema);
  const Question = mongoose.model('Question', questionSchema);
  const Test = mongoose.model('Test', testSchema);
  const TestResult = mongoose.model('TestResult', testResultSchema);

  // ─── Auth Routes ─────────────────────────────────────────────────────────

  // Register
  app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, phone, dateOfBirth, education } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    try {
      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

      const passwordHash = await bcrypt.hash(password, 10);
      const uid = Math.random().toString(36).substr(2, 12) + Date.now().toString(36);
      const role = email === 'vivekghule777@gmail.com' ? 'ADMIN' : 'USER';

      const user = new User({ uid, name, email, passwordHash, role, phone, dateOfBirth, education });
      await user.save();

      const token = jwt.sign({ uid, email, role }, JWT_SECRET, { expiresIn: '7d' });
      res.json({
        token,
        profile: { uid, name, email, role, phone, dateOfBirth, education, createdAt: new Date().toISOString() }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
      const user = await User.findOne({ email });
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return res.status(401).json({ error: 'Invalid email or password.' });

      const token = jwt.sign({ uid: user.uid, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      const profile = {
        uid: user.uid,
        name: user.name,
        email: user.email,
        role: user.role,
        photoUrl: user.photoUrl,
        phone: user.phone,
        location: user.location,
        education: user.education,
        createdAt: (user.createdAt as Date).toISOString()
      };
      res.json({ token, profile });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Get current user from token
  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    try {
      const user = await User.findOne({ uid: req.user.uid });
      if (!user) return res.status(404).json({ error: 'User not found' });

      res.json({
        uid: user.uid,
        name: user.name,
        email: user.email,
        role: user.role,
        photoUrl: user.photoUrl,
        phone: user.phone,
        location: user.location,
        education: user.education,
        createdAt: (user.createdAt as Date).toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // ─── User Routes ──────────────────────────────────────────────────────────

  app.get('/api/users/:uid', async (req, res) => {
    try {
      const user = await User.findOne({ uid: req.params.uid });
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/api/users', async (req, res) => {
    const { uid, name, email, role, photoUrl, phone, location, education } = req.body;
    let finalRole = email === 'vivekghule777@gmail.com' ? 'ADMIN' : (role || 'USER');
    try {
      await User.findOneAndUpdate(
        { uid },
        { uid, name, email, role: finalRole, photoUrl, phone, location, education },
        { upsert: true, new: true }
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.patch('/api/users/:uid', async (req, res) => {
    try {
      const update = { ...req.body };
      delete update.uid;
      delete update.email;
      delete update.passwordHash;
      await User.findOneAndUpdate({ uid: req.params.uid }, update, { new: true });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.delete('/api/users/:uid', async (req, res) => {
    try {
      await User.findOneAndDelete({ uid: req.params.uid });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get('/api/users', async (req, res) => {
    try {
      const users = await User.find().sort({ createdAt: -1 });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // ─── Question Routes ──────────────────────────────────────────────────────

  app.get('/api/questions', async (req, res) => {
    try {
      const questions = await Question.find().sort({ createdAt: -1 });
      res.json(questions);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/api/questions', async (req, res) => {
    const { text, options, optionImages, correctAnswer, category, imageUrl, explanation, instructions } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    try {
      const question = new Question({ id, text, options, optionImages, correctAnswer, category, imageUrl, explanation, instructions });
      await question.save();
      res.json({ id });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.patch('/api/questions/:id', async (req, res) => {
    try {
      await Question.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.delete('/api/questions/:id', async (req, res) => {
    try {
      await Question.findOneAndDelete({ id: req.params.id });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // ─── Test Routes ──────────────────────────────────────────────────────────

  app.get('/api/tests', async (req, res) => {
    try {
      const tests = await Test.find().sort({ createdAt: -1 });
      res.json(tests);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get('/api/tests/:id', async (req, res) => {
    try {
      const test = await Test.findOne({ id: req.params.id });
      if (!test) return res.status(404).json({ error: 'Test not found' });
      res.json(test);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/api/tests', async (req, res) => {
    const { title, category, duration, questionIds } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    try {
      const test = new Test({ id, title, category, duration, questionIds });
      await test.save();
      res.json({ id });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.delete('/api/tests/:id', async (req, res) => {
    try {
      await Test.findOneAndDelete({ id: req.params.id });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // ─── Result Routes ────────────────────────────────────────────────────────

  app.get('/api/results', async (req, res) => {
    try {
      const results = await TestResult.find().sort({ timestamp: -1 });
      const resultsWithUserInfo = await Promise.all(results.map(async (r: any) => {
        const user = await User.findOne({ uid: r.userId });
        return {
          ...r.toObject(),
          userName: user?.name || 'Anonymous',
          userPhoto: user?.photoUrl
        };
      }));
      res.json(resultsWithUserInfo);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.get('/api/results/user/:userId', async (req, res) => {
    try {
      const results = await TestResult.find({ userId: req.params.userId }).sort({ timestamp: -1 });
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/api/results', async (req, res) => {
    const { userId, testId, testTitle, score, totalQuestions, accuracy, subjectWise, weakAreas } = req.body;
    const id = Math.random().toString(36).substr(2, 9);
    try {
      const result = new TestResult({ id, userId, testId, testTitle, score, totalQuestions, accuracy, subjectWise, weakAreas });
      await result.save();
      res.json({ id });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // ─── Vite / Static ───────────────────────────────────────────────────────

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
