const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Internship',
      required: [true, 'Internship reference is required'],
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant reference is required'],
    },
    coverLetter: {
      type: String,
      required: [true, 'Cover letter is required'],
      minlength: [50, 'Cover letter must be at least 50 characters'],
      maxlength: [1000, 'Cover letter cannot exceed 1000 characters'],
    },
    resumeUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
        message: 'Invalid application status',
      },
      default: 'pending',
    },
    statusHistory: [],
    employerNote: {
      type: String,
      maxlength: [500, 'Note cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// One application per internship per applicant
applicationSchema.index({ internship: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1, createdAt: -1 });
applicationSchema.index({ internship: 1, status: 1 });



module.exports = mongoose.model('Application', applicationSchema);