import request from 'supertest';
import app from '../index';

describe('Auth Routes', () => {
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    dateOfBirth: '1990-01-01'
  };
  
  let token: string;
  
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('userId');
      expect(res.body.user.firstName).toBe(testUser.firstName);
      expect(res.body.user.email).toBe(testUser.email);
      
      token = res.body.token;
    });
    
    it('should not register a user with existing email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'User already exists');
    });
  });
  
  describe('POST /api/auth/login', () => {
    it('should login a user with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(testUser.email);
    });
    
    it('should not login a user with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });
  });
});
