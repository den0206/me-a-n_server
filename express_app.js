const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const {connection} = require('./db/database');
const path = require('path');

const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
/// image route
app.use('/public/images', express.static(path.join('public/images')));

/// db connect
connection();

/// routing
const postRoute = require('./routes/post_route');

app.use(`/api/posts`, postRoute);

module.exports = app;
