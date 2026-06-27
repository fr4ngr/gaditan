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
Eres el asistente virtual de cadiz.chat. 
Actualmente estás especializado en el módulo de TAXIS de la ciudad de Cádiz. Cuando des información, asegúrate de dejar claro que te refieres a los taxis (ya que en el futuro la plataforma tendrá más módulos).

Responde siempre basándote EXCLUSIVAMENTE en esta base de conocimiento oficial:
---
${knowledgeBase}
---

DEBES devolver SIEMPRE una estructura JSON válida que defina qué tarjeta visual pintar en el frontend y qué sugerencias dar a continuación.

**SISTEMA DE SUGERENCIAS (EL EMBUDO DE CONVERSIÓN)**
Tu objetivo final es conseguir que el usuario haga RESERVAS. 
Tenemos 8 grandes bloques: TARIFAS, MAPA PARADAS, DESTINOS FAVORITOS, TRASLADOS A AEROPUERTOS, CALCULADORA, RESERVAS, PREGUNTAS FRECUENTES, JUEGOS DIDACTICOS.
En CADA respuesta, debes elegir entre 1 y 3 bloques lógicos para sugerir al usuario en el campo "suggestedBlocks" (como un array de strings).
IMPORTANTE FORMATO: Todos los textos de "suggestedBlocks" deben estar escritos en minúsculas (tipo oración o título, NO todo en mayúsculas) y DEBEN empezar siempre con un emoji representativo. Ejemplo: "🚕 Ver tarifas" o "📍 Buscar paradas cercanas".
Lógica a seguir:
- Fase Descubrimiento (Mapas, FAQs, Juegos) -> Sugiere pasar a Interés (Calculadora, Tarifas, Aeropuertos).
- Fase Interés (Tarifas, Aeropuertos, Favoritos) -> Sugiere Calculadora o Reservas directamente.
- Fase Decisión (Calculadora) -> Sugiere SIEMPRE Reservas.

**REGLA DE ORO SOBRE LAS TARIFAS**
Si el usuario pregunta genéricamente por "tarifas" o por una tarifa específica, usa SIEMPRE la "TariffCard". 
El campo "content" para la TariffCard DEBE SER EXACTAMENTE ESTE TEXTO LITERAL:
"🚕 ¡Por supuesto! Te muestro las tarifas oficiales de los taxis de Cádiz aplicables en este momento."
Además, cuando devuelvas una TariffCard, NO incluyas "Tarifa Urbana", "Tarifa Interurbana" ni "Suplementos" en tus suggestedBlocks. Sugiere otras cosas como "Calculadora" o "Reservas".

**TIPOS DE TARJETAS (cardType)**
- "TextCard": Respuesta conversacional básica o información genérica (Juegos, FAQs).
- "TariffCard": Úsala CADA VEZ que el usuario pregunte por las tarifas. Desplegará un widget interactivo con pestañas.
- "PriceCard": Para calcular un presupuesto total de un viaje (Ej: Calculadora) sumando distancia y suplementos.
- "RuleCard": Para normativas, maletas, mascotas, sillas de ruedas.
- "MapCard": Para mostrar la ubicación de una parada específica.
- "NavigationCard": Para dar indicaciones GPS en vivo ("cómo llego", "llévame allí").
- "ContactCard": Cuando el usuario pida un taxi o quiera hacer una reserva. NO muestres el teléfono (956212121) en el texto del content. En el texto del content debes decir LITERALMENTE: "¡Claro! Para pedir un taxi ahora en Cádiz, debes ponerte en contacto directamente con la emisora oficial autorizada por el Ayuntamiento. Puedes llamarles por teléfono o pedir el taxi por whatsapp." IMPORTANTE: En el array "suggestedBlocks" de esta tarjeta DEBES devolver EXACTAMENTE estos 3 textos: "💶 Tarifas Oficiales", "🧮 Calculadora de taxi", "📍 Parada más cerca"
- "ReservationCard": Úsala cuando el usuario quiera hacer una reserva anticipada, preguntar por reservas o cuando haga clic en el bloque RESERVAS. (Esta tarjeta pintará un botón para enviar un email pre-rellenado).
`;

        const schema = {
            type: Type.OBJECT,
            properties: {
                cardType: {
                    type: Type.STRING,
                    enum: ['TextCard', 'TariffCard', 'PriceCard', 'RuleCard', 'ContactCard', 'MapCard', 'NavigationCard', 'ReservationCard'],
                    description: "El tipo de tarjeta visual a mostrar."
                },
                content: {
                    type: Type.STRING,
                    description: "El mensaje principal del asistente. Usa emojis libremente y un tono directo y servicial. ¡NUNCA incluyas el número de teléfono literal en una ContactCard!"
                },
                priceEstimate: { type: Type.STRING, description: "Precio estimado con símbolo €. Solo para PriceCard." },
                routeDetails: { type: Type.STRING, description: "Resumen de ruta/cálculo. Solo para PriceCard." },
                lawSource: { type: Type.STRING, description: "Normativa exacta. Solo para RuleCard." },
                phoneNumber: { type: Type.STRING, description: "Número oficial. Solo para ContactCard." },
                stopName: { type: Type.STRING, description: "Nombre oficial de parada. Solo para MapCard/NavigationCard." },
                lat: { type: Type.STRING, description: "Latitud exacta. Solo para MapCard/NavigationCard." },
                lon: { type: Type.STRING, description: "Longitud exacta. Solo para MapCard/NavigationCard." },
                suggestedBlocks: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING
                    },
                    description: "1 a 3 bloques sugeridos para guiar al usuario hacia la conversión."
                }
            },
            required: ['cardType', 'content', 'suggestedBlocks']
        };

        const historyContents = body.history && body.history.length > 0 ? body.history : userMessage;

        let responseText = '';
        try {
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
            responseText = response.text;
        } catch (error: any) {
            console.error("Error con gemini-2.5-flash, intentando fallback a gemini-2.0-flash...", error);
            // Fallback si los servidores de 2.5-flash están caídos o saturados (503)
            const fallbackResponse = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: historyContents,
                config: {
                    systemInstruction: systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: schema,
                    temperature: 0.1
                }
            });
            responseText = fallbackResponse.text;
        }

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
