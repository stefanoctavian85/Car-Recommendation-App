import express from 'express';
import controllers from './controllers/index.js';
import middleware from '../middleware/index.js';

const authRouter = express.Router();

authRouter.post('/login', controllers.auth.login);
authRouter.post('/register', middleware.register, controllers.auth.register);

export default authRouter;
