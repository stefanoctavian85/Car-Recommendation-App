import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import database from './models/index.js';
import routers from './routers/index.js';
import cronJobs from './cron/index.js';
import utils from './utils/index.js';

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

app.use('/uploads', express.static(path.join(utils.pathUtils.filesRootPath, 'uploads')));

database.connectToDatabase();
database.createAdminUser();
database.connectToFirebase();
cronJobs.startCronJobs();

app.use('/auth', routers.authRouter);
app.use('/api', routers.apiRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server has started on PORT ${PORT}`);
});