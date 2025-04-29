import models from "../../models/index.js";
import dayjs from 'dayjs';
import messages from '../../utils/index.js';

const RESERVATIONS_LIMIT_PER_USER = 3;

const getReservations = async (req, res, next) => {
    try {
        const { cid } = req.params;

        const reservations = await models.Reservation.find({
            carId: cid,
        });

        if (!reservations) {
            return res.status(404).json({
                message: messages.reservationMessages.RESERVATION_NOT_FOUND,
            })
        }

        const reservationDates = reservations.map((res) => ({
            startDate: res.startDate,
            endDate: res.endDate,
        }));

        return res.status(200).json({
            reservationDates
        });
    } catch (err) {
        next(err);
    }
}

const checkAnotherReservation = async (req, res, next) => {
    try {
        const { uid, cid } = req.params;

        let validationPassed = {
            validatedDocuments: true,
            nonexistingReservation: true,
            underLimit: true,
        };

        let sendMessages = [];

        if (req.user.statusAccountVerified !== 'approved') {
            validationPassed.validatedDocuments = false;
            sendMessages.push(messages.reservationMessages.FAILED_DOCUMENTS);
        }

        const reservationsForTheSameCar = await models.Reservation.find({
            userId: uid,
            carId: cid,
            status: 'confirmed',
        });

        if (reservationsForTheSameCar.length > 0) {
            validationPassed.nonexistingReservation = false;
            sendMessages.push(messages.reservationMessages.EXISTING_RESERVATION);
        }

        const userReservations = await models.Reservation.find({
            userId: uid,
            status: 'confirmed',
        });

        if (userReservations.length >= RESERVATIONS_LIMIT_PER_USER) {
            validationPassed.underLimit = false;
            sendMessages.push(messages.reservationMessages.RESERVATIONS_LIMIT_REACHED);
        }

        return res.status(200).json({
            validationPassed,
            sendMessages
        })

    } catch (err) {
        next(err);
    }
}

const checkDateAvailability = async (req, res, next) => {
    try {
        const { cid, startDate, endDate } = req.body;

        const reservations = await models.Reservation.find({
            carId: cid,
        });

        let isAvailable = true;

        if (!reservations) {
            return res.status(200).json({
                available: isAvailable,
            })
        }

        reservations.forEach(element => {
            if (dayjs(startDate).isBefore(element.endDate, 'day') && dayjs(endDate).isAfter(element.startDate, 'day')) {
                isAvailable = false;
                return;
            }
        })

        if (!isAvailable) {
            return res.status(400).json({
                available: isAvailable,
                message: messages.reservationMessages.UNAVAILABLE_RENTAL_PERIOD,
            });
        }

        return res.status(200).json({
            available: isAvailable,
        });
    } catch (err) {
        next(err);
    }
}

const insurancePricesPerDay = {
    thirdPartyLiability: 1.5,
    collisionDamageWaiver: 1.5,
    theftProtection: 1,
};

const calculateRentalPrice = async (req, res, next) => {
    try {
        const { cid, startDate, endDate, insuranceOptions } = req.body;

        const car = await models.Car.findById({ _id: cid });

        if (!car) {
            return res.status(404).json({
                message: 'Car not found!',
            })
        };

        let rentalPrice = 0;

        const rentalPeriod = dayjs(endDate).diff(dayjs(startDate), 'day') + 1;

        let dailyRate = 0;
        let insuranceDailyFee = 0;
        let luxuryPrice = 0;

        if (rentalPeriod < 7) {
            dailyRate = 0.0025 * car.Pret;
        } else if (rentalPeriod < 14) {
            dailyRate = 0.0020 * car.Pret;
        } else if (rentalPeriod < 30) {
            dailyRate = 0.0018 * car.Pret;
        } else {
            dailyRate = 0.0015 * car.Pret;
        }

        if (insuranceOptions.thirdPartyLiability === true) {
            insuranceDailyFee += insurancePricesPerDay.thirdPartyLiability;
        }

        if (insuranceOptions.collisionDamageWaiver === true) {
            insuranceDailyFee += insurancePricesPerDay.collisionDamageWaiver;
        }

        if (insuranceOptions.theftProtection === true) {
            insuranceDailyFee += insurancePricesPerDay.theftProtection;
        }

        if (parseFloat(car["Anul productiei"]) >= 2020 || car.Pret > 50000) {
            luxuryPrice += 0.0005 * car.Pret;
        }

        rentalPrice = ((dailyRate + insuranceDailyFee + luxuryPrice) * rentalPeriod).toFixed(2);

        if (rentalPrice === 0 || rentalPrice === undefined) {
            return res.status(404).json({
                message: 'Something went wrong...',
            });
        }

        return res.status(200).json({
            rentalPrice
        });

    } catch (err) {
        next(err);
    }
}

const rentCar = async (req, res, next) => {
    try {
        const { cid, startDate, endDate, insuranceOptions, rentalPrice } = req.body;

        if (!cid || !startDate || !endDate || !insuranceOptions || !rentalPrice) {
            return res.status(400).json({
                completed: false,
                message: 'Missing required fields!',
            });
        }

        const reservation = await models.Reservation.create({ userId: req.user._id, carId: cid, startDate: startDate, endDate: endDate, insurance: insuranceOptions, status: 'confirmed', totalPrice: rentalPrice });
        await reservation.save();

        return res.status(200).json({
            completed: true,
        });
    } catch (err) {
        next(err);
    }
}

const getReservationById = async (req, res, next) => {
    try {
        const { uid } = req.params;

        const reservations = await models.Reservation.find({
            userId: uid,
            status: 'confirmed',
        });

        if (!reservations) {
            return res.status(404).json({
                message: 'The user has not made any reservations yet!',
            });
        }

        let carIds = [];

        reservations.forEach((reservation) => {
            carIds.push(reservation.carId);
        });

        const cars = await models.Car.find({
            _id: {
                $in: carIds,
            }
        });

        const rentedCarsMap = new Map();
        cars.forEach((car) => {
            rentedCarsMap.set(car._id.toString(), car);
        });

        const rentedCars = reservations.map((reservation) => {
            return {
                ...reservation.toObject(),
                car: rentedCarsMap.get(reservation.carId.toString())
            };
        });

        return res.status(200).json({
            rentedCars
        });
    } catch (err) {
        next(err);
    }
}

const changeRentalDetails = async (req, res, next) => {
    try {
        const { cid, startDate, endDate, insuranceOptions, rentalPrice } = req.body;

        if (!cid || !startDate || !endDate || !insuranceOptions || !rentalPrice) {
            return res.status(400).json({
                completed: false,
                message: 'Missing required fields!',
            });
        }

        const reservation = await models.Reservation.findOne({
            carId: cid,
        });

        if (!reservation) {
            return res.status(404).json({
                message: messages.reservationMessages.RESERVATION_NOT_FOUND,
                completed: false,
            })
        };

        const reservationFirstPrice = parseFloat(reservation.totalPrice);

        reservation.endDate = endDate;
        reservation.insurance = insuranceOptions;
        reservation.totalPrice = reservationFirstPrice + parseFloat(rentalPrice);

        await reservation.save();

        return res.status(200).json({
            message: 'Reservation has been updated successfully!',
            completed: true,
        })
    } catch (err) {
        next(err);
    }
}

export default {
    getReservations,
    checkAnotherReservation,
    checkDateAvailability,
    calculateRentalPrice,
    rentCar,
    getReservationById,
    changeRentalDetails
}