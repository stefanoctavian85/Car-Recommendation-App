import fetch from 'node-fetch';
import { SERVER_OLLAMA } from '../utils/global.js';

const pingOllamaToStart = async (modelName) => {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => {
            controller.abort();
        }, 60000);
        console.log(`Trying to start model ${modelName}...`);

        const response = await fetch(`${SERVER_OLLAMA}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: modelName,
                prompt: 'ping',
                keep_alive: "-1m",
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (response.ok) {
            console.log(`Model ${modelName} is ready!`);
            return true;
        } else {
            console.log(`Model ${modelName} is not available right now!`);
            return false;
        }

    } catch (error) {
        if (error.name === 'AbortError') {
            console.log("Ollama server timed out!");
        } else {
            console.error(`Failed to ping ${modelName}`, error.message);
        }
        return false;
    }
}

export default pingOllamaToStart;