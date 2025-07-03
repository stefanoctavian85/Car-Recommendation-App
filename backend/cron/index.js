import cron from 'node-cron';
import reservationsCronJob from './reservation-cronjob.js';
import chatCronJob from './chat-cronjob.js';
import recommendationCronJob from './recommendation-cronjob.js';

function startCronJobs() {
    try {
        recommendationCronJob.pingOllamaToStart();
        cron.schedule('*/5 * * * *', reservationsCronJob.completedReservations);
        cron.schedule('*/5 * * * *', chatCronJob.deleteIncompleteConversation);
    } catch (err) {
        console.log(err);
    }
}

export default {
    startCronJobs
}