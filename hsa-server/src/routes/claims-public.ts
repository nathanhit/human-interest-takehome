import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { hsaAccounts } from './hsa';
import { ClaimStatus } from '../models/Claim';
import { findEligibleService } from '../data/hsaEligibleServices';
import { checkEligibilityWithAI } from '../services/openai';

const router = express.Router();

// In-memory claims database for demo (shared with the auth version)
import { claims } from './claims';

// Create a new public claim based on card number
router.post('/card-transaction', async (req, res) => {
  try {
    const { cardNumber, providerName, service, amount, hasDocumentation = false, documentCount = 0 } = req.body;
    
    // Basic validation
    if (!cardNumber || !providerName || !service || !amount || amount <= 0) {
      return res.status(400).json({ 
        message: 'Please provide all required fields',
        details: 'Card number, provider name, service description, and amount are required'
      });
    }
    
    // Find account by card number
    const account = hsaAccounts.find(acc => acc.cardNumber === cardNumber && acc.cardIssued);
    
    if (!account) {
      return res.status(404).json({ 
        message: 'Card not found or not active',
        details: 'Please check the card number and try again'
      });
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
      userId: account.userId,
      providerName,
      service,
      amount: Number(amount),
      date: new Date(),
      status,
      notes: notes || 'Submitted via Transaction Submission portal',
      requiresDocumentation,
      documentationType,
      hasDocumentation,
      documentCount,
      createdAt: new Date()
    };
    
    // If the claim is covered, deduct the amount from the user's HSA account balance
    if (status === ClaimStatus.COVERED) {
      // Check if there's enough balance
      if (account.balance >= Number(amount)) {
        // Deduct the amount
        account.balance -= Number(amount);
      } else {
        // If not enough balance, mark as pending instead
        newClaim.status = ClaimStatus.PENDING;
        newClaim.notes = 'Insufficient balance for automatic approval';
      }
    }
    
    // Add to claims database
    claims.push(newClaim);
    
    return res.status(201).json({
      message: 'Transaction processed successfully',
      status: newClaim.status,
      notes: newClaim.notes,
      requiresDocumentation,
      documentationType,
      claim: {
        service: newClaim.service,
        amount: newClaim.amount,
        date: newClaim.date,
        status: newClaim.status
      }
    });
  } catch (error: any) {
    console.error('Public transaction error:', error);
    return res.status(500).json({ 
      message: 'Failed to process transaction',
      details: error.message || 'An unexpected error occurred'
    });
  }
});

// Check service eligibility (public endpoint)
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
        exactMatch: result.exactMatch,
        requiresPrescription: result.service.requiresPrescription,
        requiresLetterOfMedicalNecessity: result.service.requiresLetterOfMedicalNecessity,
        description: result.service.description
      });
    }
    
    // For low confidence matches, use the AI service
    try {
      const aiResult = await checkEligibilityWithAI(service);
      
      // Return AI result with suggested services
      const suggestedServices = result.service ? 
        [result.service.name] : 
        findEligibleService(service.split(' ')[0]).service?.name ? 
          [findEligibleService(service.split(' ')[0]).service?.name] : 
          [];
      
      return res.status(200).json({
        eligible: aiResult.eligible,
        confidence: aiResult.confidence,
        explanation: aiResult.explanation,
        suggestedAlternative: aiResult.suggestedAlternative || suggestedServices[0],
        requiresReview: !aiResult.eligible || aiResult.confidence < 80
      });
    } catch (aiError) {
      console.error('AI eligibility check error:', aiError);
      
      // Fallback to database result if AI check fails
      return res.status(200).json({
        eligible: false,
        confidence: result.confidence,
        service: result.service,
        message: 'Service eligibility could not be determined with high confidence',
        requiresReview: true
      });
    }
  } catch (error: any) {
    console.error('Eligibility check error:', error);
    return res.status(500).json({ 
      message: 'Failed to check eligibility',
      details: error.message || 'An unexpected error occurred'
    });
  }
});

export default router;
