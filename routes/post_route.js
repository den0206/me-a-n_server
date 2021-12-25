const express = require('express');
const router = express.Router();
const {checkAuth} = require('../middleware/check_auth');
const upload = require('../middleware/upload');
const postController = require('../controllers/post_controller');

router.post('/', checkAuth, upload.single('image'), postController.uploadPost);
router.get('/', checkAuth, postController.getPosts);
router.get('/:id', checkAuth, postController.findByid);
router.delete('/:id', checkAuth, postController.deletePost);
router.put(
  '/:id',
  checkAuth,
  upload.single('image'),
  postController.updatePost
);

module.exports = router;
