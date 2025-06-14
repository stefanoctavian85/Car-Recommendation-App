import models from "../../models/index.js";
import fetch from 'node-fetch';
import { SERVER } from '../../utils/global.js';

const getRecommendationsByText = async (req, res, next) => {
    try {
        const { text } = req.body;

        if (!text || text.length > 300) {
            return res.status(400).json({
                message: "Invalid text!"
            });
        }

        let carInfo = {};

        try {
            const flaskResponse = await fetch(`${SERVER}/transform-text-to-json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            if (!flaskResponse.ok) {
                const data = await flaskResponse.json();
                return res.status(flaskResponse.status).json({
                    message: data.error,
                });
            };

            const response = await flaskResponse.json();
            carInfo = JSON.parse(response.content);
        } catch (err) {
            return res.status(500).json({
                message: 'Internal Server Error. Please try again later!',
            });
        }

        try {
            if (Object.keys(carInfo).length !== 0) {
                const flaskResponse = await fetch(`${SERVER}/predict`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': "application/json",
                    },
                    body: JSON.stringify({
                        content: carInfo,
                    })
                });

                if (!flaskResponse.ok) {
                    const data = await flaskResponse.json();
                    return res.status(flaskResponse.status).json({
                        message: data.error,
                    });
                };

                const prediction = await flaskResponse.json();
                const cluster = prediction.cluster;
                const cars = prediction.cars;

                req.user.cluster = cluster;
                const user = req.user;
                await user.save();

                return res.status(200).json({
                    cars
                });
            }
        } catch (err) {
            return res.status(500).json({
                message: 'Internal Server Error. Please try again later!',
            });
        }
    } catch (err) {
        next(err);
    }
}

const predict = async (req, res, next) => {
    try {
        const { questions, responses } = req.body;

        if (responses.length !== 10) {
            return res.status(400).json({
                message: "Invalid number of inputs",
            });
        }

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        try {
            const flaskResponse = await fetch(`${SERVER}/predict`, {
                method: 'POST',
                headers: {
                    'Content-Type': "application/json",
                },
                body: JSON.stringify({
                    responses
                })
            });

            if (!flaskResponse.ok) {
                const data = await flaskResponse.json();
                return res.status(flaskResponse.status).json({
                    message: data.error,
                });
            };

            const prediction = await flaskResponse.json();
            const cluster = prediction.cluster;
            const cars = prediction.cars;

            const combinedResponses = questions.map((question, index) => ({
                question,
                answer: responses[index],
            }));

            const form = await models.Form.create({
                userId: user._id,
                responses: combinedResponses,
                predictions: cars,
                cluster: cluster
            });
            await form.save();

            req.user.cluster = cluster;
            const user = req.user;
            await user.save();

            return res.status(200).json({
                cars
            });
        } catch (err) {
            return res.status(500).json({
                message: 'Internal Server Error. Please try again later!',
            });
        }
    } catch (err) {
        next(err);
    }
}

const quickRecommendations = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user.cluster) {
            return res.status(404).json({
                message: 'Cluster not found!',
            });
        }

        const userCluster = user.cluster;

        const latestFiveCars = await models.Car.find({ Cluster: userCluster },
            { Masina: 1, "Anul productiei": 1, Combustibil: 1, "Tip Caroserie": 1, Imagine: 1 })
            .sort({ _id: -1 }).limit(4);

        if (!latestFiveCars) {
            return res.status(404).json({
                message: 'Cars not found!',
            });
        }

        return res.status(200).json({
            recommendations: latestFiveCars,
        });

    } catch (err) {
        next(err);
    }
}

export default {
    getRecommendationsByText,
    predict,
    quickRecommendations,
}