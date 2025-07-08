import fetch from 'node-fetch';
import { SERVER_OLLAMA } from '../utils/global.js';

const pingOllamaToStart = async () => {
    try {
        console.log("Trying to wake up Ollama...");
        let hasStarted = true;

        try {
            const response = await fetch(`${SERVER_OLLAMA}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama3.2:3b',
                    prompt: 'ping',
                    keep_alive: "-1m",
                })
            });

            if (response.ok) {
                console.log('Model llama3.2:3b is ready!');
                return true;
            } else {
                console.log('Model llama3.2:3b is not available right now!');
                return false;
            }
        } catch {
            hasStarted = false;
            console.log(`Failed to ping Ollama3.2:3b`);
        }
    } catch (error) {
        console.log("Error at starting ollama server: ", error)
    }
}

export default {
    pingOllamaToStart
}