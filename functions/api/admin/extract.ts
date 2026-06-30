import { GoogleGenAI } from '@google/genai';

export async function onRequestPost(context) {
    const { request, env } = context;

    // Autenticación
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return new Response('Unauthorized', { status: 401 });
    }
    const pwd = authHeader.split(' ')[1];
    if (pwd !== env.ADMIN_PASSWORD) {
        return new Response('Forbidden', { status: 403 });
    }

    try {
        const body = await request.json();
        const { base64Data, mimeType } = body;

        if (!base64Data || !mimeType) {
            return new Response(JSON.stringify({ error: "No file data provided." }), { status: 400 });
        }

        if (!env.GEMINI_API_KEY) {
            return new Response(JSON.stringify({ error: "GEMINI_API_KEY is missing." }), { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

        const prompt = "Eres un transcriptor experto. Convierte este documento a texto limpio en formato Markdown. Si ves tablas, tarifas o precios, organízalos matemáticamente utilizando la sintaxis de tablas de Markdown (filas y columnas). No inventes información, transcribe exactamente lo que ves, pero estructurado para que una IA lo pueda leer fácilmente. Devuelve ÚNICAMENTE el código Markdown, sin introducciones.";

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Data
                            }
                        },
                        {
                            text: prompt
                        }
                    ]
                }
            ]
        });

        const extractedText = response.text || "";

        return new Response(JSON.stringify({ success: true, text: extractedText }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (e) {
        console.error("Error extracting file with Gemini:", e);
        return new Response(JSON.stringify({ error: "Failed to extract file: " + e.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
