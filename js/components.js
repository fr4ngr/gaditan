// DESTINOS DATABASE Y COMPONENTES
const dbDestinos = {
    aeropuertos: [
        { id: "jerez", name: "Aeropuerto de Jerez", price: "55€", icon: "plane", time: "35 min" },
        { id: "sevilla", name: "Aeropuerto de Sevilla", price: "145€", icon: "plane", time: "1h 15 min" }
    ],
    favoritos: [
        { id: "tarifa", name: "Tarifa (Puerto)", price: "78€", icon: "map-pin", time: "1h 20 min" },
        { id: "bahia", name: "Bahía Sur (San Fernando)", price: "19€", icon: "map-pin", time: "15 min" },
        { id: "chiclana", name: "Chiclana (Centro)", price: "42€", icon: "map-pin", time: "25 min" },
        { id: "puerto", name: "El Puerto de Santa María", price: "19€", icon: "map-pin", time: "20 min" },
        { id: "areasur", name: "C.C. Área Sur (Jerez)", price: "29€", icon: "map-pin", time: "25 min" },
        { id: "rota", name: "Rota (Costa Ballena)", price: "35€", icon: "map-pin", time: "40 min" },
        { id: "sanlucar", name: "Sanlúcar de Barrameda", price: "39€", icon: "map-pin", time: "40 min" },
        { id: "vejer", name: "Vejer de la Frontera", price: "43€", icon: "map-pin", time: "45 min" }
    ]
};

function renderDestino(dest) {
    const timeHtml = dest.time ? `<div class="mini-dest-time" style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.25rem;"><i data-lucide="clock" style="width: 12px; height: 12px;"></i> ${dest.time}</div>` : '';
    
    return `
    <details class="mini-dest-card native-accordion" style="margin-bottom: 2rem;">
        <summary class="mini-dest-header" style="align-items: center; position: relative; width: 100%;">
            <div class="mini-dest-name">
                <i data-lucide="${dest.icon}" size="16" style="color: var(--brand-cyan);"></i> ${dest.name}
            </div>
            <div class="mini-dest-info-right" style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.1rem;">
                <div class="mini-dest-price" style="line-height: 1;">${dest.price} aprox.</div>
                ${timeHtml}
            </div>
            <button class="mini-dest-close-btn" aria-label="Cerrar" style="pointer-events: none;" onclick="event.preventDefault(); this.closest('details').removeAttribute('open');">
                <i data-lucide="x" style="width: 18px; height: 18px; pointer-events: none;"></i>
            </button>
        </summary>
        
        <div class="native-content" style="display: flex; flex-direction: column; gap: 0.8rem; width: 100%;">
                <!-- Opción Radio Taxi -->
                <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.2rem;">
                        <div>
                            <div style="font-size: 0.75rem; color: #eab308; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.2rem;">FAVORITO</div>
                            <div style="font-size: 1.2rem; font-weight: 700; color: white; display: flex; align-items: center; gap: 0.4rem;">
                                <div style="background: #eab308; color: #111827; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.7rem;">RT</div>
                                Radio Taxi
                            </div>
                        </div>
                        <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
                            <div style="font-size: 1.5rem; font-weight: 800; color: white; line-height: 1;">${dest.price}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.3rem;">aprox. ${dest.time ? '• ' + dest.time : ''}</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; width: 100%;">
                        <a href="tel:+34956212121" class="md3-btn md3-primary" style="flex: 1; padding: 0.6rem 0;"><i data-lucide="phone" style="width:16px; height:16px;"></i> Llamar</a>
                    </div>
                </div>
                
                <!-- Separador de Alternativas -->
                <div style="display: flex; align-items: center; margin: 0.2rem 0; opacity: 0.8;">
                    <div style="flex: 1; height: 1px; background: linear-gradient(to right, transparent, rgba(255,255,255,0.15));"></div>
                    <span style="padding: 0 0.8rem; font-size: 0.65rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Otras Alternativas</span>
                    <div style="flex: 1; height: 1px; background: linear-gradient(to left, transparent, rgba(255,255,255,0.15));"></div>
                </div>
                
                <!-- Opción VTC Alternativa -->
                <div style="background: rgba(123, 72, 250, 0.08); border: 1px solid rgba(123, 72, 250, 0.3); border-radius: 12px; padding: 0.8rem 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
                        <div style="display: flex; align-items: center; gap: 0.6rem;">
                            <div style="background: #7b48fa; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><i data-lucide="car" style="width:14px; height:14px; color: white;"></i></div>
                            <div>
                                <div style="font-size: 0.95rem; font-weight: 600; color: white;">cadiz.cab</div>
                                <div style="font-size: 0.75rem; color: #a78bfa;">Alternativa Premium</div>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="background: #eab308; color: #111827; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 0.25rem 0.5rem; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">PREMIUM</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; width: 100%;">
                        <a href="#" class="md3-btn" style="flex: 1; padding: 0.6rem 0; background: rgba(123, 72, 250, 0.15); color: #e9d5ff; border: 1px solid rgba(123, 72, 250, 0.4);"><i data-lucide="info" style="width:16px; height:16px;"></i> Más info</a>
                    </div>
                </div>
                
                <!-- Opción Cercanías (Rojo) - Formato Compacto -->
                <a href="#" style="display: flex; justify-content: space-between; align-items: center; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 0.6rem 0.8rem; text-decoration: none;">
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                        <div style="background: #ef4444; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><i data-lucide="train" style="width:14px; height:14px; color: white;"></i></div>
                        <div style="display: flex; flex-direction: column; justify-content: center;">
                            <span style="font-size: 0.85rem; font-weight: 600; color: white; line-height: 1;">Cercanías</span>
                            <span style="font-size: 0.65rem; color: #fca5a5; margin-top: 0.15rem;">${dest.trainTime ? dest.trainTime : '-- min'}</span>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                        <span style="font-size: 0.95rem; font-weight: 700; color: #fecaca;">${dest.trainPrice || '0€'}</span>
                        <i data-lucide="chevron-right" style="width: 16px; height: 16px; color: #fca5a5;"></i>
                    </div>
                </a>

                <!-- Opción Autobús (Amarillo) - Formato Compacto -->
                <a href="#" style="display: flex; justify-content: space-between; align-items: center; background: rgba(234, 179, 8, 0.08); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 12px; padding: 0.6rem 0.8rem; text-decoration: none;">
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                        <div style="background: #eab308; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><i data-lucide="bus" style="width:14px; height:14px; color: #111827;"></i></div>
                        <div style="display: flex; flex-direction: column; justify-content: center;">
                            <span style="font-size: 0.85rem; font-weight: 600; color: white; line-height: 1;">Autobús</span>
                            <span style="font-size: 0.65rem; color: #fde047; margin-top: 0.15rem;">${dest.busTime ? dest.busTime : '-- min'}</span>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                        <span style="font-size: 0.95rem; font-weight: 700; color: #fef08a;">${dest.busPrice || '0€'}</span>
                        <i data-lucide="chevron-right" style="width: 16px; height: 16px; color: #fde047;"></i>
                    </div>
                </a>

                <!-- Opción Tranvía (Verde) - Formato Compacto -->
                <a href="#" style="display: flex; justify-content: space-between; align-items: center; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 0.6rem 0.8rem; text-decoration: none;">
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                        <div style="background: #10b981; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><i data-lucide="tram-front" style="width:14px; height:14px; color: white;"></i></div>
                        <div style="display: flex; flex-direction: column; justify-content: center;">
                            <span style="font-size: 0.85rem; font-weight: 600; color: white; line-height: 1;">Tranvía</span>
                            <span style="font-size: 0.65rem; color: #6ee7b7; margin-top: 0.15rem;">${dest.tramTime ? dest.tramTime : '-- min'}</span>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                        <span style="font-size: 0.95rem; font-weight: 700; color: #a7f3d0;">${dest.tramPrice || '0€'}</span>
                        <i data-lucide="chevron-right" style="width: 16px; height: 16px; color: #6ee7b7;"></i>
                    </div>
                </a>
        </div>
    </details>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
    const aeroGrid = document.getElementById("aeropuertos-grid-dinamico");
    if (aeroGrid) { aeroGrid.innerHTML = dbDestinos.aeropuertos.map(renderDestino).join(''); }
    
    const favGrid = document.getElementById("favoritos-grid-dinamico");
    if (favGrid) { favGrid.innerHTML = dbDestinos.favoritos.map(renderDestino).join(''); }
    
    // Lógica secuencial del acordeón
    document.querySelectorAll('details.native-accordion').forEach(details => {
        const summary = details.querySelector('summary');
        if (!summary) return;

        summary.addEventListener('click', (e) => {
            e.preventDefault(); // Anulamos el comportamiento nativo brusco

            if (details.hasAttribute('open')) {
                // Si ya está abierta, la cerramos suavemente
                closeDetailsSmoothly(details);
            } else {
                // Si está cerrada, buscamos si hay alguna otra abierta
                const currentlyOpen = document.querySelector('details.native-accordion[open]:not(.closing)');
                
                if (currentlyOpen && currentlyOpen !== details) {
                    // 1. Cerramos la que está abierta
                    closeDetailsSmoothly(currentlyOpen);
                    // 2. Esperamos a que termine de cerrarse para abrir la nueva (efecto secuencial limpio)
                    setTimeout(() => {
                        openDetailsSmoothly(details);
                    }, 300); // 300ms de la transición CSS
                } else {
                    // No hay ninguna abierta, abrimos esta directamente
                    openDetailsSmoothly(details);
                }
            }
        });
    });

    function closeDetailsSmoothly(details) {
        details.classList.add('closing');
        setTimeout(() => {
            details.removeAttribute('open');
            details.classList.remove('closing');
        }, 300);
    }

    function openDetailsSmoothly(details) {
        details.setAttribute('open', '');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
});
