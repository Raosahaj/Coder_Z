const express = require('express');
const axios = require('axios');
const router = express.Router();
const base64 = require('base-64');

const executeCode = async (language, code) => {
    const languageMappings = {
        'python': 71,
        'java': 62,
        'c_cpp': 54
    };

    const MAX_RETRIES = 10;
    const RETRY_DELAY = 1500;

    const source_code = base64.encode(code);
    const language_id = languageMappings[language];

    try {
        // Create submission
        const submissionResponse = await axios.post(
            'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=false',
            {
                source_code,
                language_id,
                stdin: base64.encode('')  // Add empty stdin if needed
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                    'X-RapidAPI-Key': '090edcf3damsha8b670058409d70p157097jsn8107d76181f0'
                },
                timeout: 10000
            }
        );

        const token = submissionResponse.data.token;
        let result = {};
        let retries = 0;

        // Poll for result
        while (retries < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            
            const resultResponse = await axios.get(
                `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true`,
                {
                    headers: {
                        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
                        'X-RapidAPI-Key': '090edcf3damsha8b670058409d70p157097jsn8107d76181f0'
                    },
                    timeout: 10000
                }
            );

            result = resultResponse.data;
            
            // Exit loop if submission is processed
            if (result.status.id > 2) break;
            
            retries++;
        }

        // Handle response
        let output = '';
        if (result.stdout) {
            output = base64.decode(result.stdout);
        } else if (result.stderr) {
            output = base64.decode(result.stderr);
        } else if (result.compile_output) {
            output = base64.decode(result.compile_output);
        } else if (result.message) {
            output = base64.decode(result.message);
        } else {
            output = 'No output available';
        }

        return {
            output,
            status: result.status.description,
            time: result.time,
            memory: result.memory
        };

    } catch (error) {
        console.error('Error executing code:', error);
        return {
            output: error.response?.data?.message || 'Error executing code',
            status: 'Error'
        };
    }
};

router.post('/execute', async (req, res) => {
    try {
        const { language, code } = req.body;

        if (!['python', 'java', 'c_cpp'].includes(language)) {
            return res.status(400).send({ output: 'Unsupported language' });
        }

        if (!code || code.trim().length === 0) {
            return res.status(400).send({ output: 'Empty code submission' });
        }

        const result = await executeCode(language, code);
        res.send(result);

    } catch (error) {
        console.error('Route error:', error);
        res.status(500).send({ output: 'Internal server error' });
    }
});

module.exports = router;
