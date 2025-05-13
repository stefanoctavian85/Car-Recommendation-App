import register from './register-middleware.js';
import auth from './auth-middleware.js';
import { uploadProfileDocuments, uploadChatDocuments } from './upload-files-middleware.js';
import error from './error-middleware.js';

export default {
    register,
    auth,
    uploadProfileDocuments,
    uploadChatDocuments,
    error
}