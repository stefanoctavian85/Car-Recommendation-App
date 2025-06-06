import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        const fieldname = file.fieldname;
        const fileExtension = path.extname(file.originalname);
        const userId = req.user._id;
        const filename = userId + Date.now() + '-' + fieldname + fileExtension;
        cb(null, filename);
    }
});

const uploadProfileDocuments = multer({ storage: storage }).fields([{
    name: 'id-card', maxCount: 1, 
}, {
    name: 'driver-license', maxCount: 1,
}]);

const uploadChatDocuments = multer({ storage: storage }).array('documents', 10);

export {
    uploadProfileDocuments,
    uploadChatDocuments
};