import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import authMiddleware from '../middleware/auth';
import { hsaAccounts } from './hsa';
import { hsaEligibleServices, findEligibleService } from '../data/hsaEligibleServices';
import { checkEligibilityWithAI } from '../services/openai';

// Export claim status enum
export enum ClaimStatus {
  PENDING = 'pending',
  COVERED = 'covered',
  NOT_COVERED = 'not_covered',
  MORE_INFO_NEEDED = 'more_information_needed'
}

const router = express.Router();

// In-memory claims database for demo - exported to share with public routes
export const claims: any[] = [];

// Define interface for authenticated request
interface AuthRequest extends express.Request {
  user?: {
    userId: string;
    email: string;
  };
}

// Create a new claim
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const { providerName, service, amount, hasDocumentation = false, documentCount = 0 } = req.body;
    
    // Basic validation
    if (!providerName || !service || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    
    // Check if service is eligible using our enhanced database
    let status = ClaimStatus.PENDING;
    let notes = '';
    let requiresDocumentation = false;
    let documentationType = '';
    
    // Use our new service to check eligibility
    const result = findEligibleService(service);
    
    // If documentation was uploaded, always set status to pending for verification
    if (hasDocumentation) {
      status = ClaimStatus.PENDING;
      notes = `Claim submitted with ${documentCount} document(s). Under review.`;
    } else if (result.service && result.confidence >= 80) {
      // High confidence match - set status based on eligibility
      if (result.service.irsQualified) {
        status = ClaimStatus.COVERED;
        
        // Check if it requires prescription or letter of medical necessity
        if (result.service.requiresPrescription) {
          status = ClaimStatus.PENDING;
          notes = 'Requires prescription verification. Please upload a prescription.';
          requiresDocumentation = true;
          documentationType = 'prescription';
        } else if (result.service.requiresLetterOfMedicalNecessity) {
          status = ClaimStatus.PENDING;
          notes = 'Requires letter of medical necessity. Please upload documentation from your healthcare provider.';
          requiresDocumentation = true;
          documentationType = 'letter of medical necessity';
        }
      } else {
        // Even if not qualified, we'll mark as pending for review
        status = ClaimStatus.PENDING;
        notes = 'Service may not be HSA-eligible, under review';
      }
    } else {
      // Low confidence or no match - use AI to determine eligibility
      try {
        const aiResult = await checkEligibilityWithAI(service);
        
        if (aiResult.confidence >= 80) {
          // High AI confidence - trust the AI result
          if (aiResult.eligible) {
            status = ClaimStatus.COVERED;
            notes = `AI-verified as eligible (${aiResult.confidence}% confidence): ${aiResult.explanation}`;
          } else {
            status = ClaimStatus.PENDING;
            notes = `AI-verified as not eligible (${aiResult.confidence}% confidence): ${aiResult.explanation}`;
          }
        } else if (aiResult.confidence >= 60) {
          // Medium AI confidence - mark as pending with AI input
          status = ClaimStatus.PENDING;
          notes = `Under review with AI assessment (${aiResult.confidence}% confidence): ${aiResult.explanation}`;
        } else {
          // Low AI confidence - mark as pending for manual review
          status = ClaimStatus.PENDING;
          notes = `Requires manual review. AI assessment uncertain (${aiResult.confidence}% confidence): ${aiResult.explanation}`;
        }
      } catch (error) {
        // AI call failed - fallback to pending
        status = ClaimStatus.PENDING;
        notes = 'Eligibility could not be determined automatically, under review';
      }
    }
    
    // Create new claim
    const newClaim = {
      claimId: uuidv4(),
      userId: req.user.userId,
      providerName,
      service,
      amount: Number(amount),
      date: new Date(),
      status,
      notes,
      requiresDocumentation,
      documentationType,
      hasDocumentation,
      documentCount,
      createdAt: new Date()
    };
    
    claims.push(newClaim);
    
    // If the claim is covered, deduct the amount from the user's HSA account balance
    if (status === ClaimStatus.COVERED) {
      // Find the user's HSA account
      const userAccount = hsaAccounts.find(acc => acc.userId === req.user?.userId);
      if (userAccount) {
        // Check if there's enough balance
        if (userAccount.balance >= Number(amount)) {
          // Deduct the amount
          userAccount.balance -= Number(amount);
        } else {
          // If not enough balance, mark as pending instead
          newClaim.status = ClaimStatus.PENDING;
          newClaim.notes = 'Insufficient balance for automatic approval';
        }
      }
    }
    
    res.status(201).json({
      message: 'Claim submitted successfully',
      claim: newClaim,
      requiresDocumentation,
      documentationType
    });
  } catch (error) {
    console.error('Create claim error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's claims
router.get('/', authMiddleware, (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Get user's claims
    const userClaims = claims.filter(claim => claim.userId === req.user?.userId);
    
    res.status(200).json({ claims: userClaims });
  } catch (error) {
    console.error('Get claims error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get claim by ID
router.get('/:id', authMiddleware, (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const { id } = req.params;
    
    // Find claim
    const claim = claims.find(claim => claim.claimId === id && claim.userId === req.user?.userId);
    
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found' });
    }
    
    res.status(200).json({ claim });
  } catch (error) {
    console.error('Get claim error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update claim status
router.put('/:id', authMiddleware, (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const { id } = req.params;
    const { status, notes } = req.body;
    
    // Find claim
    const claimIndex = claims.findIndex(claim => claim.claimId === id && claim.userId === req.user?.userId);
    
    if (claimIndex === -1) {
      return res.status(404).json({ message: 'Claim not found' });
    }
    
    // Update claim
    if (status) {
      claims[claimIndex].status = status;
    }
    
    if (notes) {
      claims[claimIndex].notes = notes;
    }
    
    res.status(200).json({
      message: 'Claim updated successfully',
      claim: claims[claimIndex]
    });
  } catch (error) {
    console.error('Update claim error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check service eligibility
router.post('/check-eligibility', async (req, res) => {
  try {
    const { service } = req.body;
    
    if (!service) {
      return res.status(400).json({ message: 'Service name is required' });
    }
    
    // Check if service is eligible using our enhanced database
    const result = findEligibleService(service);
    
    // If we have a high confidence match (>= 70%), return the result
    if (result.service && result.confidence >= 70) {
      return res.status(200).json({
        eligible: result.service.irsQualified,
        confidence: result.confidence,
        service: result.service,
        exactMatch: result.exactMatch
      });
    }
    
    // For low confidence matches, use the AI service
    try {
      const aiResult = await checkEligibilityWithAI(service);
      
      // Combine database and AI results
      const eligibleServices = hsaEligibleServices.filter(s => s.irsQualified);
      const suggestedServices = eligibleServices
        .slice(0, 5)
        .map(s => s.name);
      
      return res.status(200).json({
        eligible: aiResult.eligible,
        confidence: aiResult.confidence,
        explanation: aiResult.explanation,
        suggestedAlternative: aiResult.suggestedAlternative,
        suggestedServices: suggestedServices,
        requiresReview: !aiResult.eligible || aiResult.confidence < 80
      });
    } catch (aiError) {
      console.error('AI eligibility check error:', aiError);
      
      // Fallback to database result if AI check fails
      const eligibleServices = hsaEligibleServices.filter(s => s.irsQualified);
      const suggestedServices = eligibleServices
        .slice(0, 5)
        .map(s => s.name);
      
      return res.status(200).json({
        eligible: false,
        confidence: result.confidence,
        service: result.service,
        message: 'Service eligibility could not be determined with high confidence',
        suggestedServices: suggestedServices,
        requiresReview: true
      });
    }
  } catch (error) {
    console.error('Eligibility check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
