import { Request, Response, NextFunction } from 'express';

// Simple in-memory rate limiter
const requestCounts: Record<string, { count: number; resetTime: number }> = {};

// Rate limit configuration
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // 100 requests per window

export const rateLimiter = (req: Request, res: Response, next: NextFunction): void => {
  // Get client IP
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  
  const now = Date.now();
  
  // Initialize or reset if window has passed
  if (!requestCounts[ip] || now > requestCounts[ip].resetTime) {
    requestCounts[ip] = {
      count: 1,
      resetTime: now + WINDOW_MS
    };
    next();
    return;
  }
  
  // Increment count
  requestCounts[ip].count++;
  
  // Check if limit exceeded
  if (requestCounts[ip].count > MAX_REQUESTS) {
    res.status(429).json({ 
      success: false, 
      message: 'Too many requests, please try again later.' 
    });
    return;
  }
  
  next();
};
