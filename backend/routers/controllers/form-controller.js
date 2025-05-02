import models from "../../models/index.js";
import fetch from 'node-fetch';
import { SERVER } from '../../utils/global.js';

const predict = async (req, res, next) => {
    try {
        const { questions, responses } = req.body;
        const user = req.user;

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

        const flaskResponse = await fetch(`${SERVER}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': "application/json",
            },
            body: JSON.stringify({
                responses
            })
        });

        const prediction = await flaskResponse.json();

        const combinedResponses = questions.map((question, index) => ({
            question,
            answer: responses[index],
        }));

        const form = await models.Form.create({
            userId: user._id,
            responses: combinedResponses,
            predictions: prediction
        });
        await form.save();

        return res.status(200).json({
            cars: prediction
        });
    } catch (err) {
        next(err);
    }
}

export default {
    predict,    
}