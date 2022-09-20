const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const candidateRouter = require('./routes/candidateRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//SET security HTTP headers
app.use(helmet());
//limit requests from same IP address
const limit = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP! Please try again in 1 hour.',
});
app.use('/api', limit);
// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
//Data sanitization against NoSQL query injection
app.use(mongoSanitize());
//Data sanitization against XSS
app.use(xss());

// ROUTES
app.use('/api/v1/candidates/', candidateRouter);
app.use('/api/v1/users/', userRouter);

module.exports = app;
