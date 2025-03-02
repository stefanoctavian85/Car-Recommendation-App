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
        const data = req.body;
        console.log(data);
        let query = {};
        if (req.body.length === 1) {
            query.Masina = data;
        } else {
            if (data.brand) {
                query.Masina = { $regex: `^${data.brand}` };
            }

            if (data.model) {
                query.Masina = query.Masina || {};
                query.Masina.$regex = query.Masina.$regex || '';
                query.Masina.$regex += ` ${data.model}`;
            }

            if (data.bodytype) {
                query["Tip Caroserie"] = data.bodytype;
            }

            if (data.price) {
                query.Pret = { $lte: data.price };
            }
        }

        query.Status = "Available";

        let cars = await models.Car.find(query);

        if (!cars) {
            return res.status(404).json({
                message: "Car not found",
            });
        }

        return res.status(200).json({
            cars,
        });

    } catch (err) {
        next(err);
    }
}

export default {
    searchBrands,
    searchModels,
    searchBodyTypes,
    searchSpecificCars
}