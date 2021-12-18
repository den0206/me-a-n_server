const mongoose = require('mongoose');

async function connection() {
  const name = process.env.DB_NAME;
  const pass = process.env.DB_PASS;
  try {
    await mongoose.connect(
      `mongodb+srv://${name}:${pass}@cluster0.dt5ji.mongodb.net/men_server?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log('Success DB');
  } catch (e) {
    console.log(e);
  }
}

function checkId(id) {
  return mongoose.isValidObjectId(id);
}

module.exports = {connection, checkId};
