import register from './register-middleware.js';
import auth from './auth-middleware.js';
import uploadFiles from './upload-files-middleware.js';
import error from './error-middleware.js';

export default {
    register,
    auth,
    uploadFiles,
    error
}