import models from "../../models/index.js";
import dayjs from 'dayjs';

const todaysDate = new Date(dayjs().format('YYYY-MM-DD 00:00'));
const tommorowDate = dayjs(todaysDate).add(1, 'day').toDate();
const todaysDayIndex = (dayjs().day() + 6) % 7;

const dashboardReports = async (req, res, next) => {
    try {
        if (req.user.status !== 'admin') {
            return res.status(401).json({
                message: 'Unauthorized',
            });
        }

        const reservationsToday = await models.Reservation.find({
            createdAt: {
                $gt: todaysDate,
                $lt: tommorowDate
            }
        });

        let todaysRevenue = 0, lastWeekRevenue = 0;
        let todaysBookings = 0, lastWeekBookings = 0;

        if (reservationsToday.length > 0) {
            todaysRevenue = reservationsToday.reduce((sum, element) => sum + element.totalPrice, 0);
        }


        const lastWeekMondayDate = dayjs(todaysDate).subtract(todaysDayIndex + 7, 'day').toDate();
        const lastWeekSundayDate = dayjs(todaysDate).subtract(todaysDayIndex, 'day').toDate();

        const reservationsLastWeek = await models.Reservation.find({
            createdAt: {
                $lt: lastWeekSundayDate,
                $gt: lastWeekMondayDate,
            }
        });

        if (reservationsLastWeek.length > 0) {
            lastWeekRevenue = reservationsLastWeek.reduce((sum, element) => sum + element.totalPrice, 0);
        }

        todaysRevenue = parseFloat(todaysRevenue.toFixed(2));
        lastWeekRevenue = parseFloat(lastWeekRevenue.toFixed(2));
        todaysBookings = reservationsToday.length;
        lastWeekBookings = reservationsLastWeek.length;

        const lastYearDate = dayjs(todaysDate).subtract(todaysDayIndex + 365, 'day').toDate();

        const forms = await models.Form.find({
            createdAt: {
                $gt: lastYearDate,
            }
        });

        const carMap = {};
        let mostPredictedCar = '';
        let numberOfMostPredictedCar = 0;

        forms.forEach(form => {
            form.predictions.forEach(prediction => {
                if (prediction in carMap) {
                    carMap[prediction]++;
                } else {
                    carMap[prediction] = 1;
                }
            });
        });

        const sortedCars = Object.entries(carMap).sort((a, b) => b[1] - a[1]);

        if (sortedCars.length > 0) {
            mostPredictedCar = sortedCars[0][0];
            numberOfMostPredictedCar = sortedCars[0][1];
        }

        return res.status(200).json({
            todaysRevenue, lastWeekRevenue,
            todaysBookings, lastWeekBookings,
            mostPredictedCar, numberOfMostPredictedCar
        })
    } catch (err) {
        next(err);
    }
}

const getDataForCharts = async (req, res, next) => {
    try {
        const { filter } = req.query;

        if (req.user.status !== 'admin') {
            return res.status(401).json({
                message: 'Unauthorized',
            });
        }

        const monthDays = dayjs().date();

        const lastMonthDate = dayjs(todaysDate).subtract(monthDays - 1, 'day').toDate();
        const firstWeekDate = dayjs(lastMonthDate).add(7, 'day').toDate();
        const secondWeekDate = dayjs(lastMonthDate).add(14, 'day').toDate();
        const thirdWeekDate = dayjs(lastMonthDate).add(21, 'day').toDate();
        const fourthWeekDate = dayjs(lastMonthDate).add(28, 'day').toDate();

        const reservationsLastMonth = await models.Reservation.find({
            createdAt: {
                $gt: lastMonthDate,
            }
        })
            .populate({
                path: 'carId',
            });

        if (reservationsLastMonth.length === 0) {
            return res.status(404).json({
                message: 'No reservation was made in this month!',
            });
        }

        const weeks = ['First Week', 'Second Week', 'Third Week', 'Fourth Week'];
        const weekRanges = [firstWeekDate, secondWeekDate, thirdWeekDate, fourthWeekDate];

        let filteredData = [];
        const weeksCount = 4;

        for (let i = 0; i < weeksCount; i++) {
            filteredData.push({ week: weeks[i] });
        }

        reservationsLastMonth.forEach((reservation) => {
            const car = reservation.carId._doc;
            const reservationDate = reservation.createdAt;
            if (Object.hasOwn(car, filter)) {
                const value = car[filter];

                for (let i = 0; i < weeksCount; i++) {
                    if (reservationDate < weekRanges[i] && reservationDate > weekRanges[i - 1]) {
                        filteredData[i][value] = filteredData[i][value] ? filteredData[i][value]++ : 1;
                    }
                }
            }
        });

        let labels = [];
        filteredData.forEach((data, _) => {
            Object.keys(data).forEach(key => {
                if (key !== 'week' && !labels.includes(key)) {
                    labels.push(key);
                }
            })
        });

        return res.status(200).json({
            filteredData,
            labels
        });
    } catch (err) {
        next(err);
    }
}

const getLogs = async (req, res, next) => {
    try {
        const { date } = req.query;

        if (req.user.status !== 'admin') {
            return res.status(401).json({
                message: 'Unauthorized',
            });
        }

        const logs = await models.Reservation.find({
            createdAt: {
                $gt: date,
            }
        })
            .populate({
                path: 'userId',
                select: 'firstname lastname email'
            })
            .populate({
                path: 'carId',
                select: 'Masina'
            });
        
        if (logs.length === 0) {
            return res.status(404).json({
                message: 'There are no reservation logs in the selected period of time!',
            });
        }

        return res.status(200).json({
            logs,
        });

    } catch (err) {
        next(err);
    }
}

export default {
    dashboardReports,
    getDataForCharts,
    getLogs
}