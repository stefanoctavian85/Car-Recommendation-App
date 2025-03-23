import models from "../../models/index.js";

const searchBrands = async (req, res, next) => {
    try {
        const cars = await models.Car.find({}, "Masina");

        if (!cars) {
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

        if (!cars) {
            return res.status(404).json({
                message: "Cars not found",
            });
        }

        const brandModels = [...new Set(cars.map(car => {
            if (car.Masina.split(" ")[0] === brand) {
                return car.Masina.split(" ").slice(1).join(" ");
            }
        }))].filter(model => model !== null && model !== undefined);

        if (!brandModels) {
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

        if (!cars) {
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

        if (brand && brand !== undefined) {
            query.Masina = { $regex: `^${brand}`, $options: 'i' };
        }

        if (model && model !== undefined) {
            query.Masina = query.Masina || {};
            query.Masina.$regex = query.Masina.$regex || '';
            query.Masina.$regex += ` ${model}`;
        }

        if (bodytype && bodytype !== undefined) {
            query["Tip Caroserie"] = bodytype;
        }

        if (price && price !== undefined && !isNaN(price)) {
            query.Pret = { $lte: parseInt(price) };
        }

        query.Status = "Available";

        const limit = 20;
        const skip = (page - 1) * limit;

        let cars = await models.Car.find(query).skip(skip).limit(limit);

        if (!cars) {
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