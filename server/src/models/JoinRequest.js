import mongoose from 'mongoose';

const joinRequestSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'RequestedBy (User ID) is required']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound unique index so a user cannot send more than one join request to the same project
joinRequestSchema.index({ project: 1, requestedBy: 1 }, { unique: true });

export const JoinRequest = mongoose.model('JoinRequest', joinRequestSchema);
