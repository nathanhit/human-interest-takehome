import request from 'supertest';
import app from '../index';
import jwt from 'jsonwebtoken';

describe('Claims Routes', () => {
  // Create a test user and token
  const userId = 'test-user-456';
  const token = jwt.sign(
    { userId, email: 'claims@example.com' },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '1h' }
  );
  
  let claimId: string;
  
  describe('POST /api/claims', () => {
    it('should create a new claim for authenticated user', async () => {
      const claimData = {
        providerName: 'Test Medical Center',
        service: 'Annual Physical',
        amount: 150
      };
      
      const res = await request(app)
        .post('/api/claims')
        .set('Authorization', `Bearer ${token}`)
        .send(claimData);
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('claim');
      expect(res.body.claim.userId).toBe(userId);
      expect(res.body.claim.providerName).toBe(claimData.providerName);
      expect(res.body.claim.service).toBe(claimData.service);
      expect(res.body.claim.amount).toBe(claimData.amount);
      expect(res.body.claim.status).toBe('covered'); // Should be auto-approved as it's in the eligible list
      
      claimId = res.body.claim.claimId;
    });
  });
  
  describe('GET /api/claims', () => {
    it('should return user claims', async () => {
      const res = await request(app)
        .get('/api/claims')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('claims');
      expect(Array.isArray(res.body.claims)).toBe(true);
      expect(res.body.claims.length).toBeGreaterThan(0);
      expect(res.body.claims[0].userId).toBe(userId);
    });
  });
  
  describe('GET /api/claims/:id', () => {
    it('should return specific claim by ID', async () => {
      const res = await request(app)
        .get(`/api/claims/${claimId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('claim');
      expect(res.body.claim.claimId).toBe(claimId);
    });
    
    it('should return 404 for non-existent claim', async () => {
      const res = await request(app)
        .get('/api/claims/non-existent-id')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(404);
    });
  });
  
  describe('PUT /api/claims/:id', () => {
    it('should update claim status', async () => {
      const updateData = {
        status: 'more_information_needed',
        notes: 'Please provide itemized receipt'
      };
      
      const res = await request(app)
        .put(`/api/claims/${claimId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('claim');
      expect(res.body.claim.status).toBe(updateData.status);
      expect(res.body.claim.notes).toBe(updateData.notes);
    });
  });
  
  describe('POST /api/claims/check-eligibility', () => {
    it('should return eligibility for a known service', async () => {
      const res = await request(app)
        .post('/api/claims/check-eligibility')
        .send({ service: 'Dental Cleaning' });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('eligible', true);
      expect(res.body).toHaveProperty('confidence');
      expect(res.body.confidence).toBeGreaterThan(90);
    });
    
    it('should return ineligibility for a known non-covered service', async () => {
      const res = await request(app)
        .post('/api/claims/check-eligibility')
        .send({ service: 'Gym Membership' });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('eligible', false);
    });
    
    it('should handle unknown services with low confidence', async () => {
      const res = await request(app)
        .post('/api/claims/check-eligibility')
        .send({ service: 'Random Unavailable Service' });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('eligible', false);
      expect(res.body).toHaveProperty('confidence');
      expect(res.body.confidence).toBeLessThan(50);
      expect(res.body).toHaveProperty('suggestedServices');
      expect(Array.isArray(res.body.suggestedServices)).toBe(true);
    });
  });
});
