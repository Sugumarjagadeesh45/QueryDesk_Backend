const mongoose = require('mongoose');

const querySchema = new mongoose.Schema(
  {
    // Auto-generated readable ID like QRY-1001
    queryId: {
      type: String,
      unique: true,
      required: true,
    },
    // Reference to the user who created the query
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [100, 'Subject cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    // Status lifecycle: PENDING → IN_PROGRESS → RESOLVED → CLOSED
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'],
      default: 'PENDING',
    },
    // Admin fills this when updating the query
    adminResponse: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Query', querySchema);
