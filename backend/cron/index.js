import cron from 'node-cron';
import reservationsCronJob from './reservation-cronjob.js';

function startCronJobs() {
    try {
        cron.schedule('0 0 * * *', reservationsCronJob.completedReservations);
    } catch (err) {
        console.log(err);
    }
}

export default {
    startCronJobs
}