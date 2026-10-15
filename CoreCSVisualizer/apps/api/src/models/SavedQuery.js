import mongoose from 'mongoose';

const savedQuerySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  sql: { type: String, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model('SavedQuery', savedQuerySchema);
