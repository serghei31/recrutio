const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });
const app = require('./app');

const PORT = 3000;

const BD = process.env.BD.replace('<password>', process.env.DB_PASS);

//Connect to MongoDB server
mongoose.connect(BD).then(() => {
  console.log('DB is connected!');
});

const server = app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}...`);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled rejection, shutting down...');
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.log('Uncaught exception, shutting down...');
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});
