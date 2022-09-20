const Candidate = require('../models/candidateModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const getAllCandidates = catchAsync(async (req, res, next) => {
  const candidates = await Candidate.find();

  res.status(200).json({
    status: 'success',
    results: candidates.length,
    data: {
      data: candidates,
    },
  });
});

const createCandidate = catchAsync(async (req, res, next) => {
  req.body.cv = req.files.cv[0].filename;
  req.body.profilePicture = req.files.profilePicture[0].filename;
  const candidate = await Candidate.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      data: candidate,
    },
  });
});

const getCandidate = catchAsync(async (req, res, next) => {
  const candidate = await Candidate.findOne({ _id: req.params.id });

  if (candidate) {
    res.status(200).json({
      status: 'success',
      data: {
        data: candidate,
      },
    });
  } else {
    return next(
      new AppError('No candidate found, please check the candidate ID', 404)
    );
  }
});

const updateCandidate = catchAsync(async (req, res, next) => {
  const candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (candidate) {
    res.status(200).json({
      status: 'updated successfully',
      data: {
        data: candidate,
      },
    });
  } else {
    return next(
      new AppError('No candidate found, please check the candidate ID', 404)
    );
  }
});

const deleteCandidate = catchAsync(async (req, res, next) => {
  const candidate = await Candidate.findByIdAndDelete(req.params.id);

  if (candidate) {
    res.status(204).json({
      status: 'Succesfully deleted candidate',
      data: {
        data: null,
      },
    });
  } else {
    return next(
      new AppError('No candidate found, please check the candidate ID', 404)
    );
  }
});

module.exports = {
  createCandidate,
  getAllCandidates,
  getCandidate,
  updateCandidate,
  deleteCandidate,
};
