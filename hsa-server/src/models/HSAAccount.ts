import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Interface for HSA Account document
export interface IHSAAccount extends mongoose.Document {
  accountId: string;
  userId: string;
  balance: number;
  cardIssued: boolean;
  cardNumber: string | null;
  cardExpiryDate: Date | null;
  cardCVV: string | null;
}

// HSA Account schema
const hsaAccountSchema = new mongoose.Schema(
  {
    accountId: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4()
    },
    userId: {
      type: String,
      required: true,
      ref: 'User'
    },
    balance: {
      type: Number,
      default: 0,
      min: 0
    },
    cardIssued: {
      type: Boolean,
      default: false
    },
    cardNumber: {
      type: String,
      default: null
    },
    cardExpiryDate: {
      type: Date,
      default: null
    },
    cardCVV: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Generate a card number when a card is issued
hsaAccountSchema.methods.issueCard = function() {
  // Generate a 16-digit card number (for demo purposes only)
  this.cardNumber = `4000${Math.floor(Math.random() * 10000000000000).toString().padStart(12, '0')}`;
  
  // Set expiry date to 3 years from now
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 3);
  this.cardExpiryDate = expiryDate;
  
  // Generate a 3-digit CVV
  this.cardCVV = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  this.cardIssued = true;
  return this;
};

const HSAAccount = mongoose.model<IHSAAccount>('HSAAccount', hsaAccountSchema);

export default HSAAccount;
