import type { APIRoute } from 'astro';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import knowledgeBase from '../../data/taxi-knowledge.md?raw';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const userMessage = body.message;
        
        // Inicializar Gemini usando la clave secreta de .env
        const ai = new GoogleGenAI({ apiKey: import.meta.env.GEMINI_API_KEY });

        const systemInstruction = `
Eres Cádiz Plus, el asistente oficial de movilidad en Cádiz. 
Responde siempre basándote EXCLUSIVAMENTE en esta base de conocimiento oficial:
---
${knowledgeBase}
---
DEBES devolver SIEMPRE una estructura JSON válida que defina qué tarjeta visual pintar en el frontend.
- Si el usuario hace una pregunta conversacional básica, usa "TextCard".
- Si el usuario pide calcular o estimar un precio de taxi, usa "PriceCard" calculando tú mismo la suma basándote en la base de datos (aplica la tarifa correcta según la hora y suma suplementos).
- Si el usuario pregunta por una norma, maletas, sillas de ruedas o derechos, usa "RuleCard".
- Si el usuario pide llamar un taxi, usa "ContactCard" con el teléfono oficial de RadioTaxi Cádiz.
`;

        const schema: Schema = {
            type: Type.OBJECT,
            properties: {
                cardType: {
                    type: Type.STRING,
                    enum: ['TextCard', 'PriceCard', 'RuleCard', 'ContactCard'],
                    description: "El tipo de tarjeta visual a mostrar."
                },
                content: {
                    type: Type.STRING,
                    description: "El mensaje principal del asistente. Usa emojis libremente y un tono directo y servicial."
                },
                priceEstimate: { 
                    type: Type.STRING, 
                    description: "Precio estimado calculado con el símbolo €. Solo si es PriceCard." 
                },
                routeDetails: { 
                    type: Type.STRING, 
                    description: "Resumen de la ruta (origen a destino) o cálculos desglosados. Solo si es PriceCard." 
                },
                lawSource: { 
                    type: Type.STRING, 
                    description: "La ley o normativa exacta en la que te basas. Solo si es RuleCard." 
                },
                phoneNumber: { 
                    type: Type.STRING, 
                    description: "El número de teléfono oficial. Solo si es ContactCard." 
                }
            },
            required: ['cardType', 'content']
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userMessage,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.1
            }
        });

        const responseText = response.text;
        const data = JSON.parse(responseText);

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
