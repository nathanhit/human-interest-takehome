import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Enum for claim status
export enum ClaimStatus {
  PENDING = 'pending',
  COVERED = 'covered',
  NOT_COVERED = 'not_covered',
  MORE_INFO_NEEDED = 'more_information_needed'
}

// Interface for Claim document
export interface IClaim extends mongoose.Document {
  claimId: string;
  userId: string;
  providerName: string;
  service: string;
  amount: number;
  date: Date;
  status: ClaimStatus;
  notes?: string;
}

// Claim schema
const claimSchema = new mongoose.Schema(
  {
    claimId: {
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
    providerName: {
      type: String,
      required: true,
      trim: true
    },
    service: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    status: {
      type: String,
      enum: Object.values(ClaimStatus),
      default: ClaimStatus.PENDING
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Claim = mongoose.model<IClaim>('Claim', claimSchema);

export default Claim;
