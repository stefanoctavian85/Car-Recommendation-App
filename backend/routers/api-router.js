import express from 'express';
import controllers from './controllers/index.js';
import middleware from '../middleware/index.js';

const apiRouter = express.Router();
apiRouter.use(middleware.auth);

apiRouter.get('/users/:uid/profile', controllers.profile.userInformation);
apiRouter.post('/users/:uid/forms', controllers.form.predict);
apiRouter.get('/users/quick-recommendations', controllers.form.quickRecommendations);
apiRouter.patch('/users/save-phone-number', controllers.profile.savePhoneNumber);
apiRouter.post('/users/send-documents', middleware.uploadProfileDocuments, controllers.profile.sendDocuments, controllers.profile.checkDocuments);

apiRouter.get('/reservations/:cid', controllers.reservation.getReservations);
apiRouter.get('/reservations/check-another-reservation/:uid/:cid', controllers.reservation.checkAnotherReservation);
apiRouter.post('/reservations/check-availability', controllers.reservation.checkDateAvailability);
apiRouter.post('/reservations/calculate-rental-price', controllers.reservation.calculateRentalPrice);
apiRouter.post('/reservations/create-payment-intent', controllers.reservation.createPaymentIntent);
apiRouter.post('/reservations/check-payment', controllers.reservation.checkPayment);
apiRouter.post('/reservations/rent-car', controllers.reservation.rentCar);
apiRouter.get('/reservations/get-reservations-by-id/:uid', controllers.reservation.getReservationById);
apiRouter.patch('/reservations/change-rental-details', controllers.reservation.changeRentalDetails);

apiRouter.get('/cars/brands', controllers.car.searchBrands);
apiRouter.get('/cars/brands/:brand', controllers.car.searchModels);
apiRouter.get('/cars/bodytypes', controllers.car.searchBodyTypes);
apiRouter.get('/cars', controllers.car.searchSpecificCars);
apiRouter.get('/car', controllers.car.searchCarById);

apiRouter.get('/dashboard/dashboard-reports', controllers.dashboard.dashboardReports);
apiRouter.get('/dashboard/dashboard-charts', controllers.dashboard.getDataForCharts);
apiRouter.get('/dashboard/logs', controllers.dashboard.getLogs);

apiRouter.get('/chat/send-AI-first-message', controllers.chat.sendFirstMessage);
apiRouter.post('/chat/send-message', controllers.chat.sendMessage);
apiRouter.patch('/chat/close-conversation', controllers.chat.closeChat);
apiRouter.get('/chat/get-conversation-info/:conversationId', controllers.chat.getConversationInfo);
apiRouter.post('/chat/attach-documents', middleware.uploadChatDocuments, controllers.chat.attachFilesToConversation);
apiRouter.get('/chat/download-documents/:filename', controllers.chat.downloadDocuments);
apiRouter.patch('/chat/approve-documents', controllers.chat.approveDocumentsByAdmin);

apiRouter.use(middleware.error);

export default apiRouter;