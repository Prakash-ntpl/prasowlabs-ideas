import pool from '../config/database.js';

export class Idea {
  static async create(content, userId = null, sessionId = null) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO ideas (content, user_id, session_id) VALUES (?, ?, ?)',
        [content, userId, sessionId]
      );
      
      const [rows] = await pool.execute(
        'SELECT * FROM ideas WHERE id = ?',
        [result.insertId]
      );
      
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByUser(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM ideas WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findBySession(sessionId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM ideas WHERE session_id = ? AND user_id IS NULL ORDER BY created_at DESC',
        [sessionId]
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, userId = null, sessionId = null) {
    try {
      let query, params;
      
      if (userId) {
        query = 'DELETE FROM ideas WHERE id = ? AND user_id = ?';
        params = [id, userId];
      } else {
        query = 'DELETE FROM ideas WHERE id = ? AND session_id = ? AND user_id IS NULL';
        params = [id, sessionId];
      }
      
      const [result] = await pool.execute(query, params);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async migrateSessionToUser(sessionId, userId) {
    try {
      const [result] = await pool.execute(
        'UPDATE ideas SET user_id = ?, session_id = NULL WHERE session_id = ? AND user_id IS NULL',
        [userId, sessionId]
      );
      
      return result.affectedRows;
    } catch (error) {
      throw error;
    }
  }
}