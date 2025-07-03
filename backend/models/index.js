import mongoose from "mongoose";
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './User.js';
import Car from './Car.js';
import Reservation from './Reservation.js';
import Form from './Form.js';
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

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
    try {
        const email = process.env.ADMIN_EMAIL;
        let admin = await User.findOne({ email });
        if (!admin) {
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
            admin = await User.create({
                email: process.env.ADMIN_EMAIL, password: hashedPassword, firstname: process.env.ADMIN_FIRSTNAME,
                lastname: process.env.ADMIN_LASTNAME, status: "admin", phoneNumber: process.env.ADMIN_PHONENUMBER
            });
            await admin.save();
            console.log("Admin user has been created!");
        } else {
            console.log("Admin user already exists!");
        }
    } catch (err) {
        console.error("Error at creating admin user: ", err);
    }
}

let database;

const connectToFirebase = () => {
    try {
        const firebaseConfig = {
            apiKey: process.env.API_KEY,
            authDomain: process.env.AUTH_DOMAIN,
            projectId: process.env.PROJECT_ID,
            storageBucket: process.env.STORAGE_BUCKET,
            messagingSenderId: process.env.MESSAGING_SENDER_ID,
            appId: process.env.APP_ID,
            databaseURL: process.env.DATABASE_URL,
        };

        const firebase = initializeApp(firebaseConfig);
        database = getDatabase(firebase);
        console.log("Connected to Firebase Realtime Database!");
    } catch (err) {
        console.log("Connection to Firebase Realtime Database FAILED!");
    }
}

export default {
    connectToDatabase,
    createAdminUser,
    User,
    Car,
    Reservation,
    Form,
    connectToFirebase,
};

export {
    database,
}