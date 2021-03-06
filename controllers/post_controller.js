const Post = require('../model/post');
const {encodeBase64, decodeToBase64} = require('../utils/base64');
const {checkId} = require('../db/database');

async function uploadPost(req, res, next) {
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

  /// setted by  checkAuth method
  const userId = req.userData.userid;
  console.log(userId);

  const post = new Post({
    title: body.title,
    content: body.content,
    imagePath: imagePath,
    user: userId,
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
}

async function getPosts(req, res, next) {
  const cursor = req.query.cursor;
  const limit = +req.query.limit || 10;
  let query = {};

  if (cursor) {
    /// 複合化
    query['_id'] = {
      /// 複合化
      $lt: decodeToBase64(cursor),
    };
  }
  console.log(query);

  let posts = await Post.find(query)
    .sort({_id: -1})
    .limit(limit + 1)
    .populate('user', 'name');

  if (!posts) {
    return res.status(500).json({success: false, message: 'No find Posts'});
  }

  const hasNextPage = posts.length > limit;
  posts = hasNextPage ? posts.slice(0, -1) : posts;

  /// 暗号化
  const nextPageCursor = hasNextPage
    ? encodeBase64(posts[posts.length - 1].id)
    : null;

  const pageFeed = {
    taskFeed: posts,
    pageInfo: {
      nextPageCursor: nextPageCursor,
      hasNextPage: hasNextPage,
    },
  };

  res.status(201).json(pageFeed);
}

async function findByid(req, res) {
  const id = req.params.id;

  const post = await Post.findById(id);

  if (!post)
    return res.status(404).json({success: false, message: 'Not find Post'});

  res.send(post);
}

async function updatePost(req, res) {
  const id = req.params.id;
  if (!checkId(id)) return res.status(400).send('Invalid ID');
  const findPost = await Post.findById(id);
  if (!findPost)
    return res.status(404).json({success: false, message: 'Not find Post'});

  /// from token payload
  const userId = req.userData.userid;

  console.log(userId);

  if (findPost.user != userId)
    return res
      .status(404)
      .json({success: false, message: 'You cant update this post'});

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
    user: userId,
  };

  try {
    const updatePost = await Post.findByIdAndUpdate(id, body, {new: true});
    return res.send(updatePost);
  } catch (e) {
    return res
      .status(501)
      .json({status: false, message: 'Fatal Error', error: e});
  }
}

async function deletePost(req, res) {
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
}

module.exports = {uploadPost, getPosts, updatePost, findByid, deletePost};

/// simple pagenation
// const currentPage = +req.query.page;
// const limit = +req.query.limit ?? 10;
// const postQuery = Post.find();

// if (perPage && currentPage) {
//   postQuery.skip(perPage * (currentPage - 1)).limit(perPage);
// }

// const posts = await postQuery.find();
