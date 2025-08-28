import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import authMiddleware from '../middleware/auth';

const router = express.Router();

// In-memory HSA account database for demo
export const hsaAccounts: any[] = [];

// Define interface for authenticated request
interface AuthRequest extends express.Request {
  user?: {
    userId: string;
    email: string;
  };
}

// Create HSA Account
router.post('/', authMiddleware, (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Check if user already has an account
    const existingAccount = hsaAccounts.find(acc => acc.userId === req.user?.userId);
    if (existingAccount) {
      return res.status(400).json({ message: 'User already has an HSA account' });
    }
    
    // Create new account
    const newAccount = {
      accountId: uuidv4(),
      userId: req.user.userId,
      balance: 0,
      cardIssued: false,
      cardNumber: null,
      cardExpiryDate: null,
      cardCVV: null,
      createdAt: new Date()
    };
    
    hsaAccounts.push(newAccount);
    
    res.status(201).json({
      message: 'HSA account created successfully',
      account: newAccount
    });
  } catch (error) {
    console.error('HSA Account creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's HSA account
router.get('/', authMiddleware, (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Find user's account
    const account = hsaAccounts.find(acc => acc.userId === req.user?.userId);
    if (!account) {
      return res.status(404).json({ message: 'HSA account not found' });
    }
    
    res.status(200).json({ account });
  } catch (error) {
    console.error('Get HSA Account error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Deposit funds to HSA account
router.post('/deposit', authMiddleware, (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const { amount, routingNumber } = req.body;
    
    // Basic validation
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }
    
    if (!routingNumber) {
      return res.status(400).json({ message: 'Routing number is required' });
    }
    
    // Find user's account
    const accountIndex = hsaAccounts.findIndex(acc => acc.userId === req.user?.userId);
    if (accountIndex === -1) {
      return res.status(404).json({ message: 'HSA account not found' });
    }
    
    // Update balance
    hsaAccounts[accountIndex].balance += Number(amount);
    
    res.status(200).json({
      message: 'Funds deposited successfully',
      account: hsaAccounts[accountIndex]
    });
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Issue card for HSA account
router.post('/issue-card', authMiddleware, (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Find user's account
    const accountIndex = hsaAccounts.findIndex(acc => acc.userId === req.user?.userId);
    if (accountIndex === -1) {
      return res.status(404).json({ message: 'HSA account not found' });
    }
    
    // Check if card already issued
    if (hsaAccounts[accountIndex].cardIssued) {
      return res.status(400).json({ message: 'Card has already been issued' });
    }
    
    // Issue card
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 3);
    
    hsaAccounts[accountIndex].cardIssued = true;
    hsaAccounts[accountIndex].cardNumber = `4000${Math.floor(Math.random() * 10000000000000).toString().padStart(12, '0')}`;
    hsaAccounts[accountIndex].cardExpiryDate = expiryDate;
    hsaAccounts[accountIndex].cardCVV = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    // Return card info (in production, CVV would be excluded)
    res.status(200).json({
      message: 'Card issued successfully',
      card: {
        cardNumber: hsaAccounts[accountIndex].cardNumber,
        cardExpiryDate: hsaAccounts[accountIndex].cardExpiryDate,
        cardCVV: hsaAccounts[accountIndex].cardCVV
      }
    });
  } catch (error) {
    console.error('Card issuance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reissue card for HSA account
router.post('/reissue-card', authMiddleware, (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Find user's account
    const accountIndex = hsaAccounts.findIndex(acc => acc.userId === req.user?.userId);
    if (accountIndex === -1) {
      return res.status(404).json({ message: 'HSA account not found' });
    }
    
    // Check if card was previously issued
    if (!hsaAccounts[accountIndex].cardIssued) {
      return res.status(400).json({ message: 'No card exists to reissue. Please issue a new card first.' });
    }
    
    // Generate new card details
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 3);
    
    // Generate new card number, expiry, and CVV
    hsaAccounts[accountIndex].cardNumber = `4000${Math.floor(Math.random() * 10000000000000).toString().padStart(12, '0')}`;
    hsaAccounts[accountIndex].cardExpiryDate = expiryDate;
    hsaAccounts[accountIndex].cardCVV = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    // Card remains issued (cardIssued stays true)
    
    // Return new card info (in production, CVV would be excluded)
    res.status(200).json({
      message: 'Card reissued successfully',
      card: {
        cardNumber: hsaAccounts[accountIndex].cardNumber,
        cardExpiryDate: hsaAccounts[accountIndex].cardExpiryDate,
        cardCVV: hsaAccounts[accountIndex].cardCVV
      }
    });
  } catch (error) {
    console.error('Card reissuance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
