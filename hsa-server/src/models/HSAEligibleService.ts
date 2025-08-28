import mongoose from 'mongoose';

// Interface for HSA Eligible Service document
export interface IHSAEligibleService extends mongoose.Document {
  name: string;
  category: string;
  description?: string;
  irsQualified: boolean;
}

// HSA Eligible Service schema
const hsaEligibleServiceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    irsQualified: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Create text index for fuzzy search
hsaEligibleServiceSchema.index({ 
  name: 'text', 
  category: 'text',
  description: 'text' 
});

const HSAEligibleService = mongoose.model<IHSAEligibleService>('HSAEligibleService', hsaEligibleServiceSchema);

export default HSAEligibleService;
