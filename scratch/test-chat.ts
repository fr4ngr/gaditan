import { onRequestPost } from '../functions/api/chat.ts';

async function run() {
    const context = {
        env: {
            GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'fake',
            AEMET_API_KEY: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmcjRuLmdyQGdtYWlsLmNvbSIsImp0aSI6ImY3MzIwZGM2LWJjMDMtNDk3Yi1iYzY1LTliZDllYWI1MWJhMCIsImlzcyI6IkFFTUVUIiwiaWF0IjoxNzgyNzE0OTEzLCJ1c2VySWQiOiJmNzMyMGRjNi1iYzAzLTQ5N2ItYmM2NS05YmQ5ZWFiNTFiYTAiLCJyb2xlIjoiIn0.4lAA6VyhjjowdynFEh_wY5KZXCTJLAOB2nl5XBXnIL0'
        },
        request: {
            json: async () => ({
                message: "¿Cómo está la playa de la caleta para bañarse hoy?"
            })
        }
    };

    const response = await onRequestPost(context);
    console.log(await response.json());
}
run();
