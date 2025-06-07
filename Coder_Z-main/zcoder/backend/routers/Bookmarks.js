import express from 'express';
import auth from '../middleware/auth.js';
import Bookmark from '../models/Bookmark.js';

const router = express.Router();

// Bookmark a question
router.post('/:questionId', auth, async (req, res) => {
  try {
    const existingBookmark = await Bookmark.findOne({
      user: req.user.id,
      question: req.params.questionId
    });

    if (existingBookmark) {
      return res.status(400).json({ error: 'Question already bookmarked' });
    }

    const bookmark = new Bookmark({
      user: req.user.id,
      question: req.params.questionId
    });

    await bookmark.save();
    res.json(bookmark);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove bookmark
router.delete('/:questionId', auth, async (req, res) => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      user: req.user.id,
      question: req.params.questionId
    });

    if (!bookmark) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    res.json({ message: 'Bookmark removed' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's bookmarks
router.get('/', auth, async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.id })
      .populate('question')
      .sort({ createdAt: -1 });

    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
