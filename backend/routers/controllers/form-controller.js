import models from "../../models/index.js";
import fetch from 'node-fetch';

const predict = async (req, res, next) => {
    try {
        const { responses } = req.body;
        const user = req.user;
        
        if (responses.length !== 9) {
            return res.status(400).json({
                message: "Invalid number of inputs",
            });
        }

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const flaskResponse = await fetch('http://localhost:5000/predict', {
            method: 'POST',
            headers: {
                'Content-Type': "application/json",
            },
            body: JSON.stringify({
                responses
            })
        });

        const prediction = await flaskResponse.json();
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