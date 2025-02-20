import express from 'express';
import controllers from './controllers/index.js'

const authRouter = express.Router();

authRouter.post('/login', controllers.auth.login);
authRouter.post('/register', controllers.auth.register);

export default authRouter;
