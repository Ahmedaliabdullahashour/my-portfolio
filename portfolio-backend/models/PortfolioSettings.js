const mongoose = require('mongoose');

const socialLinkSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    icon: { type: String, required: true },
    url: { type: String, default: '' },
  },
  { _id: false }
);

const portfolioSettingsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, default: 'Ahmed Ali Abdullah Ashour' },
    shortName: { type: String, required: true, default: 'Ahmed Ashour' },
    title: { type: String, required: true, default: 'Front-End Developer' },
    tagline: {
      type: String,
      default: 'I design and build fast, accessible interfaces for the modern web.',
    },
    intro: {
      type: String,
      default:
        'Front-end developer focused on Angular, TypeScript and thoughtful UI engineering. I turn complex requirements into clean, responsive experiences that feel effortless to use.',
    },
    bio: [{ type: String }],
    careerGoals: [{ type: String }],
    email: { type: String, required: true, default: 'ahmed.ashour@example.com' },
    phone: { type: String, default: '' },
    location: { type: String, default: 'Egypt' },
    availability: {
      type: String,
      default: 'Open to junior roles, internships & freelance work',
    },
    cvUrl: { type: String, default: 'assets/cv/ahmed-ashour-cv.pdf' },
    profileImage: { type: String, default: 'assets/images/profile.svg' },
    socialImage: { type: String, default: 'assets/images/social-preview.svg' },
    socials: [socialLinkSchema],
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

module.exports = mongoose.model('PortfolioSettings', portfolioSettingsSchema);
