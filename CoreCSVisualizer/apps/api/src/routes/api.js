import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import User from '../models/User.js';
import SavedQuery from '../models/SavedQuery.js';
import { simulate } from '../services/cpu.js';
import { executeSql } from '../services/minidb.js';
import { analyzeJava } from '../services/solid.js';

const router = Router();
const jwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured.');
  return secret;
};
const fail = (message, status = 400) => Object.assign(new Error(message), { status });
const bearer = (req) => req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7).trim() : '';
const publicUser = (user, token) => ({ id: user.id, name: user.name, email: user.email, token });
const issueSession = async (user) => {
  user.sessionId = randomUUID(); await user.save();
  return jwt.sign({ sub: user.id, jti: user.sessionId }, jwtSecret(), { expiresIn: '7d' });
};

router.post('/auth/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email || '') || !password) throw fail('Name, valid email and password are required.');
    if (password.length < 6) throw fail('Password must contain at least 6 characters.');
    if (await User.exists({ email: email.trim().toLowerCase() })) throw fail('An account with this email already exists.', 409);
    const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), passwordHash: await bcrypt.hash(password, 12) });
    res.json(publicUser(user, await issueSession(user)));
  } catch (e) { next(e); }
});

router.post('/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email: String(email || '').trim().toLowerCase() });
    if (!user || !await bcrypt.compare(password || '', user.passwordHash)) throw fail('Invalid email or password.', 401);
    res.json(publicUser(user, await issueSession(user)));
  } catch (e) { next(e); }
});

router.get('/auth/me', async (req, res, next) => {
  try {
    const token = bearer(req); if (!token) throw fail('Authentication required.', 401);
    const decoded = jwt.verify(token, jwtSecret()); const user = await User.findById(decoded.sub);
    if (!user || !decoded.jti || user.sessionId !== decoded.jti) throw fail('Session expired. Please sign in again.', 401);
    res.json({ id: user.id, name: user.name, email: user.email });
  } catch (e) { next(e); }
});
router.post('/auth/logout', async (req, res, next) => {
  try {
    const token = bearer(req);
    if (token) { const decoded = jwt.verify(token, jwtSecret()); await User.updateOne({ _id: decoded.sub, sessionId: decoded.jti }, { $set: { sessionId: null } }); }
    res.status(204).end();
  } catch (e) { if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError') return res.status(204).end(); next(e); }
});

router.post('/cpu/simulate', (req, res, next) => { try { res.json(simulate(req.body || {})); } catch (e) { next(e); } });
router.post('/db/query', (req, res, next) => { try { res.json(executeSql(req.body?.sql)); } catch (e) { next(e); } });
router.post('/solid/analyze', (req, res, next) => { try { res.json(analyzeJava(req.body?.code)); } catch (e) { next(e); } });

router.get('/saved-queries', async (_req, res, next) => {
  try { const records = await SavedQuery.find().sort({ createdAt: -1 }).lean(); res.json(records.map((q) => ({ id: q._id, name: q.name, sql: q.sql, createdAt: q.createdAt }))); }
  catch (e) { next(e); }
});
router.post('/saved-queries', async (req, res, next) => {
  try {
    const { name, sql } = req.body || {}; if (!name?.trim() || !sql?.trim()) throw fail('Name and SQL are required.');
    const q = await SavedQuery.create({ name: name.trim(), sql }); res.status(201).json({ id: q.id, name: q.name, sql: q.sql, createdAt: q.createdAt });
  } catch (e) { next(e); }
});
router.delete('/saved-queries/:id', async (req, res, next) => {
  try { if (!/^[a-f\d]{24}$/i.test(req.params.id)) throw fail('Saved query not found.', 404); const q = await SavedQuery.findByIdAndDelete(req.params.id); if (!q) throw fail('Saved query not found.', 404); res.status(204).end(); }
  catch (e) { next(e); }
});

export default router;
