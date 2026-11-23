const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema(
  {
    institution: { type: String, required: true, trim: true },
    faculty: { type: String, required: true, trim: true },
    degree: { type: String, required: true, trim: true },
    startYear: { type: String, required: true, trim: true },
    endYear: { type: String, default: null },
    location: { type: String, default: '' },
    description: { type: String, required: true },
    relevantCourses: [{ type: String }],
    isPlaceholder: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
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

module.exports = mongoose.model('Education', educationSchema);
