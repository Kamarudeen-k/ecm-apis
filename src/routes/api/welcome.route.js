import { Router } from 'express';

const welcomeRoute = Router();

welcomeRoute.get('/', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Welcome to E-Commerce web-app`s backend APIs'
  });
});

export default welcomeRoute;
