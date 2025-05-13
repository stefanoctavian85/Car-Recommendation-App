import cron from 'node-cron';
import reservationsCronJob from './reservation-cronjob.js';
import chatCronjob from './chat-cronjob.js';

function startCronJobs() {
    try {
        cron.schedule('*/5 * * * *', reservationsCronJob.completedReservations);
        cron.schedule('*/5 * * * *', chatCronjob.deleteIncompleteConversation);
    } catch (err) {
        console.log(err);
    }
}

export default {
    startCronJobs
}