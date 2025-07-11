import rateLimit from 'express-rate-limit';


export  const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, 
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});


export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true,
});


export const modifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 30, 
  message: {
    error: 'Too many modification requests, please try again later.',
    retryAfter: '10 minutes'
  },
});
