import models from "../../models/index.js";
import fetch from 'node-fetch';
import { SERVER } from '../../utils/global.js';
import pingOllamaToStart from '../../utils/ollama-utils.js';

const getRecommendationsByText = async (req, res, next) => {
    try {
        const { text } = req.body;

        if (!text || text.length > 300) {
            return res.status(400).json({
                message: "Text is required and must be less than 300 characters!"
            });
        }

        const isReady = await pingOllamaToStart("llama3.2:3b");


        if (!isReady) {
            return res.status(500).json({
                message: "This recommendation method is not available right now!"
            });
        }

        let carInfo = {};

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => {
                controller.abort();
            }, 60000);
            const flaskResponse = await fetch(`${SERVER}/transform-text-to-json`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (!flaskResponse.ok) {
                const data = await flaskResponse.json();
                return res.status(flaskResponse.status).json({
                    message: data.error,
                });
            };

            const response = await flaskResponse.json();
            carInfo = JSON.parse(response.content);
        } catch (err) {
            if (err.name === 'AbortError') {
                console.error("Abort at recommendation method by text", err);
            } else {
                console.error(err.message);
            }
            return res.status(500).json({
                message: err.message,
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
                req.user.hasCompletedRecommendation = true;
                const user = req.user;
                await user.save();

                return res.status(200).json({
                    cars
                });
            } else {
                return res.status(400).json({
                    message: "No valid car information could be extracted from the text!",
                })
            }
        } catch (err) {
            return res.status(500).json({
                message: err.message,
            });
        }
    } catch (err) {
        next(err);
    }
}

const predict = async (req, res, next) => {
    try {
        const { questions, responses } = req.body;
        const user = req.user;

        if (responses.some(answer => answer === null || answer === undefined)) {
            return res.status(400).json({
                message: "Form completed incorrectly! Please respond to all the questions!",
            });
        }

        if (!Array.isArray(questions) || !Array.isArray(responses)) {
            return res.status(400).json({
                message: "Questions and responses must be arrays!",
            });
        }

        if (!questions || !responses) {
            return res.status(400).json({
                message: "Questions and responses are required!",
            });
        }

        if (responses.length !== 10 || questions.length !== 10) {
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
            } else {
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
                req.user.hasCompletedRecommendation = true;
                const userToSave = req.user;
                await userToSave.save();

                return res.status(200).json({
                    cars
                });
            }
        } catch (err) {
            console.log(err.message);
            return res.status(500).json({
                message: err.message,
            });
        }
    } catch (err) {
        next(err);
    }
}

const quickRecommendations = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user.hasCompletedRecommendation) {
            return res.status(404).json({
                message: 'User has not completed any recommendation method yet!',
            });
        }

        const userCluster = user.cluster;

        const latestCars = await models.Car.find({ Cluster: userCluster },
            { Masina: 1, "Anul productiei": 1, Combustibil: 1, "Tip Caroserie": 1, Imagine: 1 })
            .sort({ _id: -1 }).limit(4);

        if (!latestCars || latestCars.length === 0) {
            return res.status(404).json({
                message: 'Cars not found!',
            });
        }

        return res.status(200).json({
            recommendations: latestCars,
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