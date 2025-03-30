import express from 'express';
import controllers from './controllers/index.js';
import middleware from '../middleware/index.js';

const apiRouter = express.Router();
apiRouter.use(middleware.auth);

apiRouter.get('/users/:uid/profile', controllers.profile.userInformation);
apiRouter.post('/users/:uid/forms', controllers.form.predict);
apiRouter.patch('/users/save-phone-number', controllers.profile.savePhoneNumber);
apiRouter.post('/users/send-documents', middleware.uploadFiles, controllers.profile.sendDocuments, controllers.profile.checkDocuments);


apiRouter.get('/cars/brands', controllers.car.searchBrands);
apiRouter.get('/cars/brands/:brand', controllers.car.searchModels);
apiRouter.get('/cars/bodytypes', controllers.car.searchBodyTypes);
apiRouter.get('/cars', controllers.car.searchSpecificCars);
apiRouter.get('/car', controllers.car.searchCarById);


export default apiRouter;