import express from 'express';
import { Idea } from '../models/Idea.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all ideas for user or session
router.get('/', authenticateToken, async (req, res) => {
  try {
    let ideas;
    
    if (req.user) {
      // Get ideas for authenticated user
      ideas = await Idea.findByUser(req.user.id);
    } else {
      // Get ideas for anonymous session
      const sessionId = req.headers['x-session-id'];
      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID required for anonymous access' });
      }
      ideas = await Idea.findBySession(sessionId);
    }

    res.json(ideas);
  } catch (error) {
    console.error('Get ideas error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new idea
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Content is required' });
    }

    if (content.length > 1000) {
      return res.status(400).json({ message: 'Content must be less than 1000 characters' });
    }

    let idea;
    
    if (req.user) {
      // Create idea for authenticated user
      idea = await Idea.create(content.trim(), req.user.id);
    } else {
      // Create idea for anonymous session
      const sessionId = req.headers['x-session-id'];
      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID required for anonymous access' });
      }
      idea = await Idea.create(content.trim(), null, sessionId);
    }

    res.status(201).json(idea);
  } catch (error) {
    console.error('Create idea error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete idea
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    let success;

    if (req.user) {
      // Delete idea for authenticated user
      success = await Idea.delete(id, req.user.id);
    } else {
      // Delete idea for anonymous session
      const sessionId = req.headers['x-session-id'];
      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID required for anonymous access' });
      }
      success = await Idea.delete(id, null, sessionId);
    }

    if (!success) {
      return res.status(404).json({ message: 'Idea not found or access denied' });
    }

    res.json({ message: 'Idea deleted successfully' });
  } catch (error) {
    console.error('Delete idea error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;