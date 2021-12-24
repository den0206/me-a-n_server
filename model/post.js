const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  title: {type: String, required: true},
  content: {type: String, required: true},
  imagePath: {type: String, required: true},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
});

postSchema.virtual('id').get(function () {
  if (this._id) return this._id.toHexString();
});

postSchema.set('toJSON', {
  virtuals: true,
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
