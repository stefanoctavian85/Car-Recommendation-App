import models from "../models/index.js";
import jwt from 'jsonwebtoken';

export default async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: "Unauthorized: No token provided!",
            });
        }
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        const email = decodedToken.email;

        const user = await models.User.findOne({
            email: email,
        });

        if (!user) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        req.user = user;
        next();
    } catch (err) {
        next(err);
    }
}