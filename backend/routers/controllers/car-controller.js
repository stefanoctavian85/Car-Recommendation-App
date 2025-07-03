import models from "../../models/index.js";
import mongoose from "mongoose";

const searchBrands = async (req, res, next) => {
    try {
        const cars = await models.Car.find({}, "Masina");

        if (cars.length === 0) {
            return res.status(404).json({
                message: "Cars not found",
            });
        }

        const brands = [...new Set(cars.map((car) => car.Masina.split(" ")[0]))];

        return res.status(200).json({
            brands,
        });
    } catch (err) {
        next(err);
    }
}

const searchModels = async (req, res, next) => {
    try {
        const { brand } = req.params;

        if (!brand) {
            return res.status(400).json({
                message: "This brand does not exists",
            });
        }

        const cars = await models.Car.find({}, "Masina");

        if (cars.length === 0) {
            return res.status(404).json({
                message: "Cars not found",
            });
        }

        const brandModels = [...new Set(cars
            .filter(car => car.Masina.split(" ")[0] === brand)
            .map(car => car.Masina.split(" ").slice(1).join(" "))
        )];

        if (brandModels.length === 0) {
            return res.status(404).json({
                message: "Models not found",
            });
        }

        return res.status(200).json({
            brandModels,
        });
    } catch (err) {
        next(err);
    }
}

const searchBodyTypes = async (req, res, next) => {
    try {
        const cars = await models.Car.find({}, ["Tip Caroserie"]);

        if (cars.length === 0) {
            return res.status(404).json({
                message: "Cars not found",
            });
        }

        const bodyTypes = [...new Set(cars.map(car => car["Tip Caroserie"]))];

        return res.status(200).json({
            bodyTypes,
        });
    } catch (err) {
        next(err);
    }
}

const searchSpecificCars = async (req, res, next) => {
    try {
        const { brand, model, bodytype, price, page } = req.query;

        let query = {};

        if (brand && model) {
            query.Masina = { $regex: `^${brand} ${model}`, $options: 'i' };
        } else if (brand) {
            query.Masina = { $regex: `^${brand}`, $options: 'i' };
        } else if (model) {
            query.Masina = { $regex: `${model}`, $options: 'i' };
        }

        if (bodytype && bodytype !== undefined) {
            query["Tip Caroserie"] = bodytype;
        }

        if (price && price !== undefined && !isNaN(price)) {
            query.Pret = { $lte: parseInt(price) };
        }

        const limit = 20;
        const currentPage = parseInt(page, 10);
        const validPage = (currentPage && currentPage > 0) ? currentPage : 1;
        const skip = (validPage - 1) * limit;

        let cars = await models.Car.find(query).skip(skip).limit(limit);

        if (cars.length === 0) {
            return res.status(404).json({
                message: "Car not found",
            });
        }

        const totalCars = await models.Car.countDocuments(query);
        const totalPages = Math.ceil(totalCars / limit);

        return res.status(200).json({
            cars,
            totalCars,
            totalPages,
        });

    } catch (err) {
        next(err);
    }
}

const searchCarById = async (req, res, next) => {
    try {
        const { id } = req.query;

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Something went wrong! Please try again later!',
            });
        }

        const car = await models.Car.findById(id);

        if (!car) {
            return res.status(404).json({
                message: 'Car not found!',
            });
        }

        return res.status(200).json({
            car
        });
    } catch (err) {
        next(err);
    }
}

export default {
    searchBrands,
    searchModels,
    searchBodyTypes,
    searchSpecificCars,
    searchCarById
}