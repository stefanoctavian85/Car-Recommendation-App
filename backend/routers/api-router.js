import express from 'express';
import controllers from './controllers/index.js';
import middleware from '../middleware/index.js';

const apiRouter = express.Router();
apiRouter.use(middleware.auth);

apiRouter.get('/users/:uid/profile', controllers.profile.userInformations);

apiRouter.post('/users/:uid/forms', controllers.form.predict);

apiRouter.get('/cars/brands', controllers.car.searchBrands);
apiRouter.get('/cars/brands/:brand', controllers.car.searchModels);
apiRouter.get('/cars/bodytypes', controllers.car.searchBodyTypes);
apiRouter.post('/cars', controllers.car.searchSpecificCars);


export default apiRouter;