import Joi from 'joi';

export default async (req, res, next) => {
    try {
        const userCredentials = req.body;

        const registerSchema = Joi.object({
            email: Joi.string().email().required(),
            firstname: Joi.string().min(3).max(20).required(),
            lastname: Joi.string().min(3).max(20).required(),
            password: Joi.string().min(5).max(64).required(),
        });

        const { error } = registerSchema.validate(userCredentials, { abortEarly: true });

        if (error) {
            return res.status(400).json({
                message: error.details[0].message
            });
        } else {
            next();
        }
    } catch (err) {
        next(err);
    }
}