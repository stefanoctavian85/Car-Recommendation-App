import models from "../../models/index.js";
import fetch from 'node-fetch';
import csv from 'csv-parser';
import fs from 'fs';

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

const offer = async (req, res, next) => {
    try {
        const { uid, car } = req.params;
        const results = [];
        
        fs.createReadStream('./assets/cars_cleaned_dataset.csv')
            .pipe(csv())
            .on('data', (data) => {
                if (data.Masina === car) {
                    results.push(data);
                }
            })
            .on('end', () => {
                return res.status(200).json({
                    cars: results,
                });
            });
    } catch (err) {
        next(err);
    }
}

export default {
    predict,
    offer
}