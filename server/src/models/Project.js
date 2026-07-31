import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required']
  },
  domain: {
    type: String,
    required: [true, 'Project domain is required']
  },
  requiredSkills: {
    type: [String],
    required: [true, 'At least one required skill must be provided'],
    validate: {
      validator: function(v) {
        return v && v.length >= 1 && v.length <= 15;
      },
      message: 'Required skills must be an array of 1 to 15 items'
    }
  },
  deadline: {
    type: String,
    required: [true, 'Project duration/deadline is required']
  },
  teamSize: {
    type: Number,
    required: [true, 'Team size is required'],
    min: [2, 'Team size must be at least 2'],
    max: [10, 'Team size cannot exceed 10']
  },
  joinRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    message: String,
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }],
  submissionLink: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create text index on title and description
projectSchema.index({ title: 'text', description: 'text' });
// Create regular index on domain and requiredSkills
projectSchema.index({ domain: 1 });
projectSchema.index({ requiredSkills: 1 });

export const Project = mongoose.model('Project', projectSchema);
