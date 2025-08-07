const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Validation middleware
const validatePost = [
  body('title').notEmpty().withMessage('Post title is required')
    .isLength({ max: 100 }).withMessage('Title cannot be more than 100 characters'),
  body('content').notEmpty().withMessage('Post content is required')
    .isLength({ max: 1000 }).withMessage('Post cannot be more than 1000 characters')
];

const validatePostUpdate = [
  body('title').optional().isLength({ max: 100 }).withMessage('Title cannot be more than 100 characters'),
  body('content').optional().isLength({ max: 1000 }).withMessage('Post cannot be more than 1000 characters')
];

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name')
      .populate('likes', 'name')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load posts. Please try again.'
    });
  }
});

// Create a post (with optional image)
router.post('/', protect, upload.single('image'), validatePost, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Please check your input and try again.',
        errors: errors.array()
      });
    }

    const { title, content } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const post = await Post.create({
      title,
      content,
      image: imageUrl,
      author: req.user._id
    });

    // Populate author info
    await post.populate('author', 'name');

    res.status(201).json({
      success: true,
      message: 'Post created successfully!',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post. Please try again.'
    });
  }
});

// Get post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name')
      .populate('likes', 'name');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load post. Please try again.'
    });
  }
});

// Update post
router.put('/:id', protect, validatePostUpdate, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Please check your input and try again.',
        errors: errors.array()
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    // Check if user owns the post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'You can only edit your own posts.'
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'name');

    res.json({
      success: true,
      message: 'Post updated successfully!',
      post: updatedPost
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post. Please try again.'
    });
  }
});

// Delete post
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    // Check if user owns the post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'You can only delete your own posts.'
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Post deleted successfully!'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post. Please try again.'
    });
  }
});

// Like/Unlike post
router.put('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found.'
      });
    }

    const likeIndex = post.likes.indexOf(req.user._id);
    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(req.user._id);
    }

    await post.save();
    await post.populate('author', 'name');
    await post.populate('likes', 'name');

    res.json({
      success: true,
      message: likeIndex > -1 ? 'Post unliked!' : 'Post liked!',
      post
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like post. Please try again.'
    });
  }
});

module.exports = router; 