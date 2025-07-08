import models from "../../models/index.js";
import fs from 'fs';
import mongoose from "mongoose";
import { SERVER } from "../../utils/global.js";
import pingOllamaToStart from '../../utils/ollama-utils.js';

const userInformation = async (req, res, next) => {
    try {
        const { uid } = req.params;

        if (!uid || !mongoose.Types.ObjectId.isValid(uid)) {
            return res.status(400).json({
                message: 'Invalid user id!',
            });
        }

        const user = await models.User.findOne({
            _id: uid,
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found!",
            });
        }

        const userObj = user.toObject();
        delete userObj.password;

        return res.status(200).json({
            user: userObj,
        });
    } catch (err) {
        next(err);
    }
}

const savePhoneNumber = async (req, res, next) => {
    try {
        const { id, phoneNumber } = req.body;

        if (!id || !phoneNumber) {
            return res.status(400).json({
                message: "ID and Phone number are required!",
            })
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: 'Invalid user id!',
            });
        }

        const user = await models.User.findOne({
            _id: id,
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const phoneNumberRegex = /^\d{10}$/;
        if (!phoneNumberRegex.test(phoneNumber)) {
            return res.status(400).json({
                message: "Invalid phone number. Must be exactly 10 digits!",
            });
        }

        user.phoneNumber = phoneNumber;
        await user.save();

        return res.status(200).json({
            message: "Phone number updated successfully!",
        });
    } catch (err) {
        next(err);
    }
}

const sendDocuments = async (req, res, next) => {
    try {
        const files = req.files;

        if (!files['id-card'] || files['id-card'].length === 0 || !files['driver-license'] || files['driver-license'].length === 0) {
            return res.status(400).json({
                message: 'Missing documents!',
            })
        };

        const isReady = await pingOllamaToStart("llama3.2:3b");

        if (!isReady) {
            return res.status(500).json({
                message: "Document validation is not available right now! Please create a ticket using the chat!",
            });
        }

        res.status(200).json({
            documentsSent: true,
        });

        const idCardPath = "../backend/" + files['id-card'][0].destination + files['id-card'][0].filename;
        const driverLicensePath = "../backend/" + files['driver-license'][0].destination + files['driver-license'][0].filename;

        const user = req.user;
        user.statusAccountVerified = 'pending';
        await user.save();

        validateDocuments(user, idCardPath, driverLicensePath);
    } catch (err) {
        next(err);
    }
}

const validateDocuments = async (user, idCardPath, driverLicensePath) => {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => {
            controller.abort()
        }, 60000);
        const flaskResponse = await fetch(`${SERVER}/validate-documents`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                idCardPath,
                driverLicensePath,
                firstname: user.firstname,
                lastname: user.lastname,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!flaskResponse.ok) {
            const data = await flaskResponse.json();
            console.log(data.error);
            user.statusAccountVerified = 'rejected';
            await user.save();
            return;
        }

        const results = await flaskResponse.json();
        const userIdentityScore = JSON.parse(results.content);
        const isValid = userIdentityScore.isValid;

        user.statusAccountVerified = isValid ? 'approved' : 'rejected';
        await user.save();

        fs.unlink(idCardPath, () => { });
        fs.unlink(driverLicensePath, () => { });
    } catch (err) {
        if (err.name === 'AbortError') {
            console.log("Abort at validating documents: ", err)
        }
        fs.unlink(idCardPath, () => { });
        fs.unlink(driverLicensePath, () => { });
        user.statusAccountVerified = 'rejected';
        await user.save();
        console.error("Error at validating documents: ", err);
    }
}

export default {
    userInformation,
    savePhoneNumber,
    sendDocuments,
}