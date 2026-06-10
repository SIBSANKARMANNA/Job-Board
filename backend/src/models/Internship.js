const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Internship title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: ['remote', 'onsite', 'hybrid'],
        message: 'Type must be remote, onsite, or hybrid',
      },
      required: [true, 'Internship type is required'],
    },
    stipend: {
      type: Number,
      min: [0, 'Stipend cannot be negative'],
      default: 0,
    },
    duration: {
      type: String,
      required: [true, 'Duration is required'],
      trim: true, // e.g. "3 months", "6 weeks"
    },
    skills: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    openings: {
      type: Number,
      default: 1,
      min: [1, 'At least 1 opening is required'],
    },
    applicationDeadline: {
      type: Date,
    },
    isActive: { type: Boolean, default: true },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applicationsCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes for filtering/search
internshipSchema.index({ location: 1 });
internshipSchema.index({ skills: 1 });
internshipSchema.index({ type: 1 });
internshipSchema.index({ isActive: 1, createdAt: -1 });
internshipSchema.index({ postedBy: 1 });
internshipSchema.index({ title: 'text', companyName: 'text', description: 'text' });

module.exports = mongoose.model('Internship', internshipSchema);