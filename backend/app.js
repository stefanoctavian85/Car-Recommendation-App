import express from 'express';
import dotenv from 'dotenv';
import database from './models/index.js';
import routers from './routers/index.js'

const app = express();
app.use(express.json());
dotenv.config();

database.connectToDatabase();
database.createAdminUser();

app.use('/auth', routers.authRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server has started on PORT ${PORT}`);
})