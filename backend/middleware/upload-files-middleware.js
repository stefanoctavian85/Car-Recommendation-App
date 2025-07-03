import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadPath = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true})
}

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

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only jpeg or png are allowed!"));
    }
}

const uploadProfileDocuments = multer({ storage: storage, fileFilter: fileFilter }).fields([{
    name: 'id-card', maxCount: 1, 
}, {
    name: 'driver-license', maxCount: 1,
}]);

const uploadChatDocuments = multer({ storage: storage, fileFilter: fileFilter }).array('documents', 10);

export {
    uploadProfileDocuments,
    uploadChatDocuments
};