import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import database from './models/index.js';
import routers from './routers/index.js';
import cronJobs from './cron/index.js';

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

database.connectToDatabase();
database.createAdminUser();
cronJobs.startCronJobs();

app.use('/auth', routers.authRouter);
app.use('/api', routers.apiRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server has started on PORT ${PORT}`);
});