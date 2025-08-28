import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

interface OpenAIResponse {
  eligible: boolean;
  confidence: number;
  explanation: string;
  suggestedAlternative?: string;
}

export const checkEligibilityWithAI = async (service: string): Promise<OpenAIResponse> => {
  try {
    if (!OPENAI_API_KEY) {
      console.warn('OpenAI API key not found. Using fallback response.');
      return getFallbackResponse(service);
    }

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a healthcare expense eligibility expert specializing in Health Savings Account (HSA) reimbursement according to IRS Publication 502 and current tax guidelines.

            IMPORTANT: Respond ONLY with a valid JSON object in this exact format:
            {
              "eligible": boolean,
              "confidence": number,
              "explanation": "string",
              "suggestedAlternative": "string or null"
            }

            Guidelines for determination:
            - eligible: true if the expense qualifies for HSA reimbursement, false if not
            - confidence: percentage from 0-100 based on how certain you are of the determination
            - explanation: 1-2 sentences explaining why it is or isn't eligible
            - suggestedAlternative: if not eligible, suggest a similar HSA-eligible option or null

            HSA-ELIGIBLE expenses (typically 85-100% confidence):
            - Medical care: doctor visits, surgeries, treatments, hospital stays
            - Dental care: cleanings, fillings, extractions, orthodontics
            - Vision care: eye exams, glasses, contacts, laser eye surgery
            - Prescription medications and insulin
            - Medical equipment: wheelchairs, crutches, hearing aids
            - Mental health services: therapy, counseling
            - Preventive care: annual physicals, vaccinations
            - Medical supplies: bandages, blood pressure monitors

            NOT HSA-ELIGIBLE (typically 85-100% confidence):
            - Cosmetic procedures (unless medically necessary)
            - General health items: vitamins, toothpaste, soap
            - Fitness: gym memberships, personal trainers (unless prescribed)
            - Insurance premiums (except COBRA, long-term care, Medicare)
            - Over-the-counter medications (unless prescribed)
            - Cosmetics and personal care items

            UNCERTAIN cases (40-70% confidence):
            - Medical procedures that could be cosmetic or medical
            - Alternative treatments not widely accepted
            - Items that might require prescription or medical necessity`
          },
          {
            role: 'user',
            content: `Is "${service}" eligible for HSA reimbursement? Please analyze and respond with the JSON format.`
          }
        ],
        temperature: 0.2,
        max_tokens: 300
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Try to directly parse the content as JSON
    try {
      const parsedResponse = JSON.parse(content);
      return {
        eligible: !!parsedResponse.eligible,
        confidence: parsedResponse.confidence || 50,
        explanation: parsedResponse.explanation || 'No explanation provided.',
        suggestedAlternative: parsedResponse.suggestedAlternative
      };
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      return getFallbackResponse(service);
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return getFallbackResponse(service);
  }
};

// Fallback response when API call fails
const getFallbackResponse = (service: string): OpenAIResponse => {
  return {
    eligible: false,
    confidence: 40,
    explanation: `Could not verify if "${service}" is HSA-eligible. Please consult with a healthcare professional or tax advisor.`,
    suggestedAlternative: undefined
  };
};
