import express from 'express';
import dotenv from 'dotenv';
import { connectToDatabase, createAdminUser } from './models/index.js';

const app = express();
app.use(express.json());
dotenv.config();

connectToDatabase();
createAdminUser();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server has started on PORT ${PORT}`);
})