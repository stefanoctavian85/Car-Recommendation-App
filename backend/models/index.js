import mongoose from "mongoose";
import dotenv from 'dotenv';
import User from './user.js';

dotenv.config();

async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB successfully");

    } catch (err) {
        console.warn(err);
    }
}

async function createAdminUser() {
    const email = process.env.ADMIN_EMAIL;
    let admin = await User.findOne({ email });
    if (!admin) {
        admin = await User.create({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, status: "admin" });
        await admin.save();
        console.log("Admin user has been created!");
    } else {
        console.log("Admin user already exists!");
    }
}

export default {
    connectToDatabase,
    createAdminUser
};