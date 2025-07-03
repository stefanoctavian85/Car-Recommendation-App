import models from "../../models/index.js";
import dayjs from 'dayjs';

const todaysDate = dayjs().startOf('day').toDate();
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
                $gte: todaysDate,
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
        const dayAfterLastWeekSunday = dayjs(lastWeekSundayDate).add(1, 'day').startOf('day').toDate();

        const reservationsLastWeek = await models.Reservation.find({
            createdAt: {
                $gte: lastWeekMondayDate,
                $lt: dayAfterLastWeekSunday,
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

        let mostPredictedCar = '';
        let numberOfMostPredictedCar = 0;

        if (forms.length !== 0) {
            const carMap = {};

            forms.forEach(form => {
                if (Array.isArray(form.predictions)) {
                    form.predictions.forEach(prediction => {
                        if (prediction in carMap) {
                            carMap[prediction]++;
                        } else {
                            carMap[prediction] = 1;
                        }
                    });
                }
            });

            const sortedCars = Object.entries(carMap).sort((a, b) => b[1] - a[1]);

            if (sortedCars.length > 0) {
                mostPredictedCar = sortedCars[0][0];
                numberOfMostPredictedCar = sortedCars[0][1];
            }
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

        if (!filter) {
            return res.status(400).json({
                message: "Invalid filter!",
            })
        }

        if (req.user.status !== 'admin') {
            return res.status(401).json({
                message: 'Unauthorized',
            });
        }

        const today = dayjs();
        const firstDayOfMonth = today.startOf('month');

        const weekRanges = [];
        const weeks = ['First Week', 'Second Week', 'Third Week', 'Fourth Week'];
        for (let i = 0; i < 4; i++) {
            const start = firstDayOfMonth.add(i * 7, 'day');
            const end = i === 3 ? firstDayOfMonth.endOf('month') : firstDayOfMonth.add((i + 1) * 7, 'day').subtract(1, 'millisecond');
            weekRanges.push({ start: start.toDate(), end: end.toDate() });
        }

        const reservationsLastMonth = await models.Reservation.find({
            createdAt: {
                $gt: firstDayOfMonth.toDate(),
                $lte: today.endOf('day').toDate(),
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

        let filteredData = weeks.map(week => ({ week }));

        reservationsLastMonth.forEach((reservation) => {
            if (!reservation.carId) return;

            const car = reservation.carId.toObject();
            const reservationDate = reservation.createdAt;
            if (Object.hasOwn(car, filter)) {
                const value = car[filter];
                if (value == null || typeof value !== 'string') {
                    return;
                }

                for (let i = 0; i < 4; i++) {
                    if (reservationDate >= weekRanges[i].start && reservationDate <= weekRanges[i].end) {
                        filteredData[i][value] = (filteredData[i][value] || 0) + 1;
                        break;
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

        filteredData = filteredData.map(weekData => {
            labels.forEach(label => {
                if (typeof weekData[label] !== 'number') {
                    weekData[label] = 0;
                }
            })
            return weekData;
        })

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

        if (!date || isNaN(Date.parse(date))) {
            return res.status(400).json({
                message: "Invalid or missing date parameter!",
            })
        }

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