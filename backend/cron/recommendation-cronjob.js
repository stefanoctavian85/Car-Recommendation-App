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
        } catch {
            hasStarted = false;
            console.log(`Failed to ping Ollama3.2:3b`);
        }

        try {
            const response2 = await fetch(`${SERVER_OLLAMA}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama3.1:8b',
                    prompt: 'ping',
                    keep_alive: "-1m",
                })
            });
        } catch {
            hasStarted = false;
            console.log(`Failed to ping Ollama3.1:8b`);
        }

        if (hasStarted) {
            console.log("Ollama server started!");
        } else {
            console.log("Ollama server can't be started!");
        }
    } catch (error) {
        console.log("Starting ollama server error: ", error)
    }
}

export default {
    pingOllamaToStart
}