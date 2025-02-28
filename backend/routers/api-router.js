import express from 'express';
import controllers from './controllers/index.js';
import middleware from '../middleware/index.js';

const apiRouter = express.Router();
apiRouter.use(middleware.auth);

apiRouter.get('/users/:uid/profile', controllers.profile.userInformations);

apiRouter.post('/users/:uid/forms', controllers.form.predict);
apiRouter.get('/users/:uid/cars/:car', controllers.form.offer);

export default apiRouter;