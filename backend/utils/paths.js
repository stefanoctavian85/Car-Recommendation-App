import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const filesRootPath = path.join(__dirname, "..");

export default {
    filesRootPath
}