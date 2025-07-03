import models from "../models/index.js";
import dayjs from 'dayjs';

const completedReservations = async () => {
    try {
        const currentDate = dayjs();

        const completedReservations = await models.Reservation.find({
            status: 'confirmed',
            endDate: {
                $lt: currentDate
            }
        });

        for (const reservation of completedReservations) {
            try {
                reservation.status = 'completed';
                await reservation.save();
            } catch (err) {
                console.error(`Failed to update reservation ${reservation._id}`, err);
            }
        }

        console.log(`Today - ${currentDate.format("DD-MM-YYYY HH:mm")} - expired ${completedReservations.length}`);
    } catch (err) {
        console.log("Cron-job completed reservations error: " + err);
    }
}

export default {
    completedReservations
}