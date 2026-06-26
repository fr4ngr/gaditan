export interface ChatOption {
    label: string;
    nextNodeId: string;
}

export interface ChatNode {
    id: string;
    text: string;
    htmlContent?: string;
    options?: ChatOption[];
}

export const chatNodes: Record<string, ChatNode> = {
    HOME: {
        id: 'HOME',
        text: '¡Hola! 👋 Soy tu asistente oficial de movilidad en Cádiz. ¿Qué necesitas hacer hoy?',
        options: [
            { label: '🧮 Calcular Precio de Viaje', nextNodeId: 'CALCULADORA_START' },
            { label: '🎒 Normas de Equipaje', nextNodeId: 'INFO_EQUIPAJE' },
            { label: '♿ Sillas de Ruedas y Movilidad', nextNodeId: 'INFO_MOVILIDAD' },
            { label: '🐶 Mascotas y Perros Guía', nextNodeId: 'INFO_MASCOTAS' },
            { label: '💰 Tarifas y Horarios', nextNodeId: 'INFO_TARIFAS' },
            { label: '⚖️ Mis Derechos (Peajes, Aire...)', nextNodeId: 'INFO_DERECHOS' },
            { label: '📞 Contacto y Objetos Perdidos', nextNodeId: 'INFO_CONTACTO' }
        ]
    },
    
    // --- RAMA: TARIFAS ---
    INFO_TARIFAS: {
        id: 'INFO_TARIFAS',
        text: 'Existen dos tipos de tarifas: Urbanas (dentro de Cádiz capital) e Interurbanas (hacia otros municipios). ¿Cuál quieres consultar?',
        options: [
            { label: '🏙️ Tarifas Urbanas (Cádiz)', nextNodeId: 'TARIFAS_URBANAS' },
            { label: '🛣️ Tarifas Interurbanas', nextNodeId: 'TARIFAS_INTERURBANAS' },
            { label: '⬅️ Volver al Inicio', nextNodeId: 'HOME' }
        ]
    },
    TARIFAS_URBANAS: {
        id: 'TARIFAS_URBANAS',
        text: 'Las tarifas dentro de Cádiz capital (IVA Excluido) son:',
        htmlContent: `
            <div class="bubble">
                ☀️ <b>Tarifa 1 (L a V de 7h a 21h):</b><br>
                Bajada: 1,39€ | Km: 0,70€ | Mínima: 3,56€<br><br>
                🌙 <b>Tarifa 2 (Noches, Fines de semana y Festivos):</b><br>
                Bajada: 1,73€ | Km: 0,90€ | Mínima: 4,43€<br><br>
                🎉 <b>Tarifa 3 (+20%):</b><br>
                Se aplica en Semana Santa, Carnavales, Navidad y madrugadas de fin de semana.
            </div>
        `,
        options: [
            { label: '🧮 Calcular Precio de Viaje', nextNodeId: 'CALCULADORA_START' },
            { label: '⬅️ Volver al Inicio', nextNodeId: 'HOME' }
        ]
    },
    TARIFAS_INTERURBANAS: {
        id: 'TARIFAS_INTERURBANAS',
        text: 'Para salir de Cádiz, el taxímetro corre desde el KM 0:',
        htmlContent: `
            <div class="bubble">
                🛣️ <b>Tarifa 7 (L a V de 6h a 22h):</b><br>
                Bajada (<12km): 3,66€ | Km: 0,71€<br><br>
                🌙 <b>Tarifa 8 (Noches, Fines de semana y Festivos):</b><br>
                Bajada (<12km): 3,60€ | Km: 0,82€<br><br>
                <i>Nota: Para viajes de más de 12km, la bajada de bandera es gratuita (0,00€).</i>
            </div>
        `,
        options: [
            { label: '⬅️ Volver al Inicio', nextNodeId: 'HOME' }
        ]
    },

    // --- RAMA: EQUIPAJE Y MASCOTAS ---
    INFO_EQUIPAJE: {
        id: 'INFO_EQUIPAJE',
        text: 'Sobre el equipaje en el taxi:',
        htmlContent: `
            <div class="bubble">
                🎒 <b>Suplemento Oficial:</b> 0,51€ por cada maleta o bulto.<br><br>
                ⚠️ Los carros de la compra, sillas de bebé y patinetes (VMP) plegados viajan GRATIS.
            </div>
        `,
        options: [
            { label: '🐶 ¿Y las mascotas?', nextNodeId: 'INFO_MASCOTAS' },
            { label: '⬅️ Volver al Inicio', nextNodeId: 'HOME' }
        ]
    },
    INFO_MASCOTAS: {
        id: 'INFO_MASCOTAS',
        text: 'Normativa sobre mascotas y asistencia:',
        htmlContent: `
            <div class="bubble">
                🐶 <b>Mascotas Generales:</b> No existe suplemento económico por transporte de mascotas, pero queda a discreción del conductor si el animal no va en transportín.<br><br>
                🦮 <b>Perros de Asistencia:</b> Tienen acceso 100% GRATUITO y obligatorio (perros guía, y perros de apoyo para diabéticos o epilépticos).
            </div>
        `,
        options: [
            { label: '⬅️ Volver al Inicio', nextNodeId: 'HOME' }
        ]
    },

    // --- RAMA: MOVILIDAD Y EUROTAXI ---
    INFO_MOVILIDAD: {
        id: 'INFO_MOVILIDAD',
        text: 'Normas de accesibilidad y sillas de ruedas:',
        htmlContent: `
            <div class="bubble">
                ♿ <b>Sillas de ruedas y andadores:</b> Están 100% EXENTOS de cobro (viajan gratis).<br><br>
                🚐 <b>Eurotaxi (Plazas Extra):</b> Normalmente, usar la 6ª o 7ª plaza cuesta 0,91€ extra por persona. PERO si el servicio lo pide una persona con discapacidad, <b>nadie</b> en el vehículo paga ese suplemento extra.
            </div>
        `,
        options: [
            { label: '⬅️ Volver al Inicio', nextNodeId: 'HOME' }
        ]
    },

    // --- RAMA: DERECHOS ---
    INFO_DERECHOS: {
        id: 'INFO_DERECHOS',
        text: 'Tus derechos clave como pasajero en Cádiz son:',
        htmlContent: `
            <div class="bubble">
                1️⃣ <b>Precio Cerrado:</b> Si pides por app/web, el precio se bloquea. Si hay atasco, no pagas más de lo pactado. (Ojo: Se anula si cambias el destino).<br><br>
                2️⃣ <b>Peajes:</b> El taxista debe avisarte antes. Tú pagas el peaje.<br><br>
                3️⃣ <b>Cambio:</b> El taxista debe tener cambio hasta 20€. Si debe bajarse a cambiar, el taxímetro se para.<br><br>
                4️⃣ <b>Aire Acondicionado:</b> Si está roto en verano y no te avisó al subir, puedes bajarte gratis (en el tramo urbano inicial).
            </div>
        `,
        options: [
            { label: '⬅️ Volver al Inicio', nextNodeId: 'HOME' }
        ]
    },

    // --- RAMA: CONTACTO ---
    INFO_CONTACTO: {
        id: 'INFO_CONTACTO',
        text: 'Contacto oficial y normativas:',
        htmlContent: `
            <div class="bubble">
                📞 <b>RadioTaxi Cádiz:</b> 956 21 21 21<br>
                (Prestan servicio 24h)<br><br>
                🎒 <b>Objetos Perdidos:</b> Si olvidaste algo, el taxista tiene obligación legal de llevarlo a las oficinas de la <b>Policía Local de Cádiz</b> en 24h.
            </div>
        `,
        options: [
            { label: '⬅️ Volver al Inicio', nextNodeId: 'HOME' }
        ]
    },

    // --- RAMA: CALCULADORA MOCK ---
    CALCULADORA_START: {
        id: 'CALCULADORA_START',
        text: '¡Claro! Vamos a calcular el precio estimado. Por favor, escribe en el chat desde qué calle sales (Ej: Plaza España).',
        // No options -> forces user to type
    }
};
