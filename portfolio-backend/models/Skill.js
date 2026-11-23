const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    level: { type: Number, min: 0, max: 100, default: 50 },
    category: {
      type: String,
      enum: ['Frontend', 'Backend', 'Programming', 'Computer Science'],
      default: 'Frontend',
    },
    icon: { type: String, default: 'code' },
    note: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('Skill', skillSchema);
