import request from 'supertest';
import app from '../index';
import jwt from 'jsonwebtoken';

describe('HSA Routes', () => {
  // Create a test user and token
  const userId = 'test-user-123';
  const token = jwt.sign(
    { userId, email: 'test@example.com' },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '1h' }
  );
  
  describe('POST /api/hsa', () => {
    it('should create a new HSA account for authenticated user', async () => {
      const res = await request(app)
        .post('/api/hsa')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('account');
      expect(res.body.account.userId).toBe(userId);
      expect(res.body.account.balance).toBe(0);
      expect(res.body.account.cardIssued).toBe(false);
    });
    
    it('should not allow duplicate HSA accounts for a user', async () => {
      const res = await request(app)
        .post('/api/hsa')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'User already has an HSA account');
    });
  });
  
  describe('GET /api/hsa', () => {
    it('should return user HSA account details', async () => {
      const res = await request(app)
        .get('/api/hsa')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('account');
      expect(res.body.account.userId).toBe(userId);
    });
  });
  
  describe('POST /api/hsa/deposit', () => {
    it('should deposit funds to HSA account', async () => {
      const depositData = {
        amount: 500,
        routingNumber: '123456789'
      };
      
      const res = await request(app)
        .post('/api/hsa/deposit')
        .set('Authorization', `Bearer ${token}`)
        .send(depositData);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('account');
      expect(res.body.account.balance).toBe(500);
    });
    
    it('should reject invalid deposit amounts', async () => {
      const depositData = {
        amount: -100,
        routingNumber: '123456789'
      };
      
      const res = await request(app)
        .post('/api/hsa/deposit')
        .set('Authorization', `Bearer ${token}`)
        .send(depositData);
      
      expect(res.status).toBe(400);
    });
  });
  
  describe('POST /api/hsa/issue-card', () => {
    it('should issue a card for HSA account', async () => {
      const res = await request(app)
        .post('/api/hsa/issue-card')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('card');
      expect(res.body.card).toHaveProperty('cardNumber');
      expect(res.body.card).toHaveProperty('cardExpiryDate');
      expect(res.body.card).toHaveProperty('cardCVV');
    });
    
    it('should not allow issuing multiple cards', async () => {
      const res = await request(app)
        .post('/api/hsa/issue-card')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Card has already been issued');
    });
  });
});
