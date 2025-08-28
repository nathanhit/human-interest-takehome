import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Interface for User document
export interface IUser extends mongoose.Document {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dateOfBirth: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// User schema
const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      default: () => uuidv4()
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
