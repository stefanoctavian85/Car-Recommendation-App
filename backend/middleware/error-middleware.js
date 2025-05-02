export default async (err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        message: err.message || 'Something went wrong!',
    });
}