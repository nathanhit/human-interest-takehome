// HSA-eligible services database
// Data sourced from HealthEquity (https://www.healthequity.com/hsa-qme)

export interface HSAEligibleService {
  name: string;
  category: string;
  irsQualified: boolean;
  requiresPrescription: boolean;
  requiresLetterOfMedicalNecessity: boolean;
  description?: string;
}

export const hsaEligibleServices: HSAEligibleService[] = [
  // Medical Services
  { name: 'Abortion', category: 'Medical', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false, description: 'Legal abortion services are eligible' },
  { name: 'Acne treatment', category: 'Medical', irsQualified: true, requiresPrescription: true, requiresLetterOfMedicalNecessity: false, description: 'For treatment of acne when prescribed' },
  { name: 'Acupuncture', category: 'Alternative Medicine', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Adoption (medical expenses)', category: 'Medical', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false, description: 'Medical expenses for adopted child' },
  { name: 'Adult diapers', category: 'Medical Supplies', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Age-related cognitive decline treatment', category: 'Medical', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: true },
  { name: 'Alcohol addiction treatment', category: 'Medical', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Allergy medicine', category: 'Pharmacy', irsQualified: true, requiresPrescription: true, requiresLetterOfMedicalNecessity: false },
  { name: 'Allergy treatment', category: 'Medical', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Ambulance', category: 'Medical', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Annual physical examination', category: 'Medical', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Artificial limbs', category: 'Medical Equipment', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Artificial teeth', category: 'Dental', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },

  // Dental Services
  { name: 'Dental treatment', category: 'Dental', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Dental cleaning', category: 'Dental', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Dentures', category: 'Dental', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Dental X-rays', category: 'Dental', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Dental fillings', category: 'Dental', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Dental implants', category: 'Dental', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Dental surgery', category: 'Dental', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Orthodontia', category: 'Dental', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },

  // Vision Services
  { name: 'Eye exam', category: 'Vision', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Eyeglasses', category: 'Vision', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Contact lenses', category: 'Vision', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Contact lens solution', category: 'Vision', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Laser eye surgery', category: 'Vision', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Prescription sunglasses', category: 'Vision', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },

  // Mental Health
  { name: 'Therapy session', category: 'Mental Health', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Psychiatric care', category: 'Mental Health', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Psychologist', category: 'Mental Health', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Mental health counseling', category: 'Mental Health', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Substance abuse treatment', category: 'Mental Health', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },

  // Pharmacy/Medications
  { name: 'Prescription medication', category: 'Pharmacy', irsQualified: true, requiresPrescription: true, requiresLetterOfMedicalNecessity: false },
  { name: 'Insulin', category: 'Pharmacy', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Birth control pills', category: 'Pharmacy', irsQualified: true, requiresPrescription: true, requiresLetterOfMedicalNecessity: false },
  { name: 'Antacids', category: 'Pharmacy', irsQualified: true, requiresPrescription: true, requiresLetterOfMedicalNecessity: false },
  { name: 'Pain relievers', category: 'Pharmacy', irsQualified: true, requiresPrescription: true, requiresLetterOfMedicalNecessity: false },
  { name: 'Cold medicine', category: 'Pharmacy', irsQualified: true, requiresPrescription: true, requiresLetterOfMedicalNecessity: false },
  { name: 'Antibiotic ointment', category: 'Pharmacy', irsQualified: true, requiresPrescription: true, requiresLetterOfMedicalNecessity: false },

  // Medical Equipment
  { name: 'Bandages', category: 'Medical Supplies', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Crutches', category: 'Medical Equipment', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Wheelchair', category: 'Medical Equipment', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Blood pressure monitor', category: 'Medical Equipment', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Hearing aids', category: 'Medical Equipment', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'CPAP machine', category: 'Medical Equipment', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Oxygen equipment', category: 'Medical Equipment', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },

  // Therapy
  { name: 'Physical therapy', category: 'Therapy', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Speech therapy', category: 'Therapy', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Occupational therapy', category: 'Therapy', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Chiropractic treatment', category: 'Therapy', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Massage therapy', category: 'Therapy', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: true, description: 'Requires letter of medical necessity' },

  // Preventive Care
  { name: 'Flu shot', category: 'Preventive Care', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Vaccines', category: 'Preventive Care', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Mammogram', category: 'Preventive Care', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Colonoscopy', category: 'Preventive Care', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },
  { name: 'Well-baby visits', category: 'Preventive Care', irsQualified: true, requiresPrescription: false, requiresLetterOfMedicalNecessity: false },

  // Non-qualified items (for reference)
  { name: 'Gym membership', category: 'Fitness', irsQualified: false, requiresPrescription: false, requiresLetterOfMedicalNecessity: true, description: 'May be eligible with letter of medical necessity' },
  { name: 'Cosmetic surgery', category: 'Medical', irsQualified: false, requiresPrescription: false, requiresLetterOfMedicalNecessity: true, description: 'Only eligible if medically necessary, not for cosmetic purposes' },
  { name: 'Teeth whitening', category: 'Dental', irsQualified: false, requiresPrescription: false, requiresLetterOfMedicalNecessity: false, description: 'Cosmetic procedure, not eligible' },
  { name: 'Vitamins', category: 'Supplements', irsQualified: false, requiresPrescription: false, requiresLetterOfMedicalNecessity: true, description: 'Only eligible with prescription for specific medical condition' },
  { name: 'Weight loss programs', category: 'Fitness', irsQualified: false, requiresPrescription: false, requiresLetterOfMedicalNecessity: true, description: 'May be eligible with letter of medical necessity for specific conditions' },
  { name: 'Maternity clothes', category: 'Personal', irsQualified: false, requiresPrescription: false, requiresLetterOfMedicalNecessity: false, description: 'Personal expense, not eligible' },
  { name: 'Funeral expenses', category: 'Personal', irsQualified: false, requiresPrescription: false, requiresLetterOfMedicalNecessity: false, description: 'Not eligible' },
  { name: 'Childcare', category: 'Personal', irsQualified: false, requiresPrescription: false, requiresLetterOfMedicalNecessity: false, description: 'Not eligible unless for medical care' },
  { name: 'Diapers for infants', category: 'Personal', irsQualified: false, requiresPrescription: false, requiresLetterOfMedicalNecessity: false, description: 'Not eligible' },
  { name: 'Toothpaste', category: 'Personal', irsQualified: false, requiresPrescription: false, requiresLetterOfMedicalNecessity: false, description: 'General health product, not eligible' }
];

// Function to search for HSA-eligible services
export const findEligibleService = (query: string): { 
  service: HSAEligibleService | null;
  confidence: number;
  exactMatch: boolean;
} => {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Try exact match first
  const exactMatch = hsaEligibleServices.find(
    service => service.name.toLowerCase() === normalizedQuery
  );
  
  if (exactMatch) {
    return {
      service: exactMatch,
      confidence: 100,
      exactMatch: true
    };
  }
  
  // Try contains match
  const containsMatches = hsaEligibleServices.filter(
    service => service.name.toLowerCase().includes(normalizedQuery) || 
               normalizedQuery.includes(service.name.toLowerCase())
  );
  
  if (containsMatches.length > 0) {
    // Sort by name length (shorter names are more likely to be exact matches)
    containsMatches.sort((a, b) => a.name.length - b.name.length);
    
    // Calculate confidence based on string similarity
    const bestMatch = containsMatches[0];
    const nameLength = bestMatch.name.length;
    const queryLength = normalizedQuery.length;
    const lengthRatio = Math.min(nameLength, queryLength) / Math.max(nameLength, queryLength);
    
    // Confidence between 70-95% based on string similarity
    const confidence = bestMatch.irsQualified ? 
      Math.round(70 + 25 * lengthRatio) : 
      Math.round(50 + 20 * lengthRatio);
    
    return {
      service: bestMatch,
      confidence,
      exactMatch: false
    };
  }
  
  // No match found
  return {
    service: null,
    confidence: 30,
    exactMatch: false
  };
};
