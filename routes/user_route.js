const express = require('express');
const router = express.Router();
const User = require('../model/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

router.get('/', async (req, res, next) => {
  const users = await User.find();

  if (!users)
    return res.status(501).json({status: false, message: 'Not find any users'});

  return res.status(201).json(users);
});

router.post('/signup', async (req, res, next) => {
  const body = req.body;
  console.log(body);

  const isFind = await User.findOne({email: body.email});
  if (isFind)
    return res
      .status(400)
      .json({success: false, message: 'Already Email Exist'});

  const hashed = await bcrypt.hash(body.password, 10);
  let user = new User({
    name: body.name,
    email: body.email,
    passwordHash: hashed,
  });

  user = await user.save();

  if (!user)
    return res.status(400).json({success: false, message: 'Can7y create user'});

  res.send(user);
});

router.post(`/login`, async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  console.log(password);

  const user = await User.findOne({email: email});

  if (!user)
    return res.status(400).json({success: false, message: 'No  Exist Email'});

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid)
    return res
      .status(400)
      .json({success: false, message: 'Password not match'});

  const secret = process.env.JWT_SECRET_KEY || 'mysecretkey';
  const payload = {userid: user.id, email: user.email};
  const token = jwt.sign(payload, secret, {expiresIn: '1d'});

  return res.status(200).json({email: user.email, token: token});
});

module.exports = router;
