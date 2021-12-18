const Post = require('../model/post');
const express = require('express');
const {checkId} = require('../db/database');
const multer = require('multer');
const router = express.Router();
const MINE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MINE_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid mine type');
    if (isValid) {
      error = null;
    }

    cb(error, 'public/images');
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLocaleLowerCase().split(' ').join('-');
    const ext = MINE_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  },
});

const uploadOptions = multer({storage: storage});

router.post('/', uploadOptions.single('image'), async (req, res, next) => {
  const body = req.body;
  const file = req.file;

  if (!file)
    return res.status(400).json({
      error: 'no exist File',
      success: false,
    });
  const basePath = `${req.protocol}://${req.get('host')}/public/images/`;
  const imagePath = `${basePath}${req.file.filename}`;
  console.log(imagePath);

  const post = new Post({
    title: body.title,
    content: body.content,
    imagePath: imagePath,
  });

  try {
    await post.save();
    res.status(200).json(post);
  } catch (e) {
    console.log(e);
    throw res
      .status(501)
      .json({status: false, message: 'Fatal Error', error: e});
  }
});

router.get('/', async (req, res, next) => {
  const posts = await Post.find();

  if (!posts) {
    return res.status(500).json({success: false, message: 'No find Posts'});
  }

  res.status(201).json(posts);
});

router.get('/:id', async (req, res) => {
  const id = req.params.id;

  const post = await Post.findById(id);

  if (!post)
    return res.status(404).json({success: false, message: 'Not find Post'});

  res.send(post);
});

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
  const id = req.params.id;
  if (!checkId(id)) return res.status(400).send('Invalid ID');
  const findPost = await Post.findById(id);
  if (!findPost)
    return res.status(404).json({success: false, message: 'Not find Post'});

  const file = req.file;
  let imagePath;
  if (!file) {
    imagePath = findPost.imagePath;
  } else {
    const basePath = `${req.protocol}://${req.get('host')}/public/images/`;
    imagePath = `${basePath}${req.file.filename}`;
  }

  const body = {
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
  };

  try {
    const updatePost = await Post.findByIdAndUpdate(id, body, {new: true});
    return res.send(updatePost);
  } catch (e) {
    return res
      .status(501)
      .json({status: false, message: 'Fatal Error', error: e});
  }
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id;
  if (!checkId(id)) return res.status(400).send('Invalid ID');

  try {
    const post = await Post.findByIdAndDelete(id);
    if (!post)
      return res.status(404).json({success: false, message: 'Not find Post'});

    return res.status(200).json({success: true, message: 'Deleted Post'});
  } catch (e) {
    return res
      .status(501)
      .json({status: false, message: 'Fatal Error', error: e});
  }
});

module.exports = router;
