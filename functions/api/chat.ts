import { GoogleGenAI, Type } from '@google/genai';
import { knowledgeBase } from '../../src/data/taxi-knowledge';

export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();
        const userMessage = body.message;
        
        if (!env.GEMINI_API_KEY) {
            return new Response(JSON.stringify({ error: "Missing key. Available env keys: " + Object.keys(env).join(", ") }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Inicializar Gemini usando la clave secreta del entorno (Cloudflare)
        const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

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
- Si el usuario pregunta dónde está una parada específica, o dónde puede coger un taxi cerca de X sitio, usa "MapCard" aportando la latitud y longitud exacta de la parada según la tabla.
- Si el usuario pregunta "cómo llego", "llévame allí" o pide indicaciones para una parada, usa "NavigationCard" aportando la latitud y longitud exacta de la parada destino. Es CRÍTICO que uses esta tarjeta para activar la navegación GPS en vivo.
`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                cardType: {
                    type: Type.STRING,
                    enum: ['TextCard', 'PriceCard', 'RuleCard', 'ContactCard', 'MapCard', 'NavigationCard'],
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
                },
                stopName: { 
                    type: Type.STRING, 
                    description: "El nombre de la parada oficial. Solo si es MapCard o NavigationCard." 
                },
                lat: { 
                    type: Type.STRING, 
                    description: "La latitud GPS exacta de la parada extraída de la tabla. Solo si es MapCard o NavigationCard." 
                },
                lon: { 
                    type: Type.STRING, 
                    description: "La longitud GPS exacta de la parada extraída de la tabla. Solo si es MapCard o NavigationCard." 
                }
            },
            required: ['cardType', 'content']
        };

        const historyContents = body.history && body.history.length > 0 ? body.history : userMessage;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: historyContents,
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

    } catch (error) {
        let errorMessage = "Ha ocurrido un error inesperado.";
        if (error.message && error.message.includes('429')) {
            errorMessage = "¡Uf! Estoy hablando con demasiada gente a la vez y me he quedado sin aliento (Límite de la capa gratuita). Espera 1 minuto e inténtalo de nuevo.";
        } else {
            errorMessage = error.message;
        }

        return new Response(JSON.stringify({ error: errorMessage }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
