const express = require('express');
const upload = require('../utils/fileupload');

const {
  getAllCandidates,
  createCandidate,
  getCandidate,
  updateCandidate,
  deleteCandidate,
} = require('../controllers/candidateController');

const { protect } = require('../controllers/userController');

const candidateRouter = express.Router();

candidateRouter
  .route('/')
  .get(protect, getAllCandidates)
  .post(protect, upload, createCandidate);
candidateRouter
  .route('/:id')
  .get(getCandidate)
  .put(updateCandidate)
  .delete(deleteCandidate);

module.exports = candidateRouter;
