const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Candidate must have a name'],
    trim: true,
    maxLenght: [40, 'A name is allowed to have at most 40 characters'],
  },
  lastname: {
    type: String,
    required: [true, 'Candidate must have a lastname'],
    trim: true,
    maxLenght: [40, 'A lastname is allowed to have at most 40 characters'],
  },
  profilePicture: {
    type: String,
    lowercase: true,
    required: [true, 'Candidate must have a profile picture'],
    trim: true,
  },
  birthDate: {
    type: Date,
  },
  cv: {
    type: String,
    lowercase: true,
    trim: true,
  },
  gender: {
    type: String,
    lowercase: true,
    enum: {
      values: ['male', 'female', 'other'],
      message: '{VALUE} is not a valid gender',
    },
  },
  phone: {
    type: String,
    match:
      /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/,
    rim: true,
    lowercase: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: [true, 'Email address is required'],
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  },
  expYears: {
    type: Number,
    max: 100,
  },
  position: {
    type: String,
    trim: true,
    enum: {
      values: [
        'Web Frontend',
        'Web Backend',
        'Fullstack',
        'Mobile',
        'Machine Learning',
        'DevOps',
        'Cloud',
      ],
      message: '{VALUE} is not supported',
    },
  },
  skills: {
    type: [String],
    default: undefined,
  },
});

const Candidate = mongoose.model('Candidate', candidateSchema);

module.exports = Candidate;
