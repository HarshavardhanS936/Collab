import request from 'supertest';
import { app } from '../src/app.js';
import { User } from '../src/models/User.js';

describe('Auth Endpoints', () => {
  const userData = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    department: 'Computer Science',
    college: 'Tech University'
  };

  describe('POST /api/auth/register', () => {
    it('Successful registration returns 201 with a token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);
        
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(userData.email);
    });

    it('Duplicate email registration returns 400', async () => {
      await User.create(userData); // Pre-seed duplicate user

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Email already registered');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a user before trying to log them in
      await request(app).post('/api/auth/register').send(userData);
    });

    it('Login with correct credentials returns 200 with a token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email, password: userData.password });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });

    it('Login with wrong password returns 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email, password: 'wrongpassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('GET /api/auth/me without a token returns 401', async () => {
      const res = await request(app).get('/api/auth/me');
      
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
