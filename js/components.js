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
    // Variable eliminada, el HTML de tiempo se genera directamente abajo
    
    return `
    <details class="mini-dest-card native-accordion" style="margin-bottom: 2rem;">
        <summary class="mini-dest-header" style="align-items: center; position: relative; width: 100%; list-style: none;">
            <div class="mini-dest-name" style="display: flex; flex-direction: column; align-items: flex-start; gap: 0.2rem;">
                <div style="font-size: 0.65rem; color: var(--brand-cyan); font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">DESDE CÁDIZ A</div>
                <div style="display: flex; align-items: center; gap: 0.4rem;">
                    <i data-lucide="${dest.icon}" size="16" style="color: var(--brand-cyan);"></i> ${dest.name}
                </div>
            </div>
            <div class="mini-dest-info-right" style="text-align: right;">
                <div style="display: flex; align-items: baseline; justify-content: flex-end; gap: 0.3rem;">
                    <span class="mini-dest-price" style="line-height: 1;">${dest.price}</span>
                    <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 500;">aprox.</span>
                </div>
                ${dest.time ? `<div style="font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; justify-content: flex-end; gap: 0.25rem; margin-top: 0.3rem;"><i data-lucide="clock" style="width: 12px; height: 12px;"></i> ${dest.time}</div>` : ''}
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
                            <div style="font-size: 0.75rem; color: #06b6d4; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.2rem;">POPULAR</div>
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
                    <div style="display: flex; justify-content: center; gap: 3rem; width: 100%; padding-top: 0.5rem;">
                        <a href="tel:+34956212121" style="display: flex; flex-direction: column; align-items: center; gap: 0.4rem; text-decoration: none;">
                            <div class="circle-btn" style="background: #0284c7; box-shadow: none;"><i data-lucide="phone" style="width:26px; height:26px;"></i></div>
                            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">Llamar</span>
                        </a>
                        <a href="https://wa.me/34956212121" style="display: flex; flex-direction: column; align-items: center; gap: 0.4rem; text-decoration: none;">
                            <div class="circle-btn" style="background: #25D366; box-shadow: none;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="white">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                                </svg>
                            </div>
                            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">WhatsApp</span>
                        </a>
                    </div>
                </div>
                
                <!-- Separador de Alternativas -->
                <div style="display: flex; align-items: center; margin: 0.2rem 0; opacity: 0.8;">
                    <div style="flex: 1; height: 1px; background: linear-gradient(to right, transparent, rgba(255,255,255,0.15));"></div>
                    <span style="padding: 0 0.8rem; font-size: 0.65rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Otras Alternativas</span>
                    <div style="flex: 1; height: 1px; background: linear-gradient(to left, transparent, rgba(255,255,255,0.15));"></div>
                </div>
                
                <!-- Opción VTC Alternativa -->
                <div style="background: rgba(123, 72, 250, 0.08); border: 1px solid rgba(123, 72, 250, 0.3); border-radius: 12px; padding: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.2rem;">
                        <div>
                            <div style="font-size: 0.75rem; color: #a78bfa; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.2rem;">VEHÍCULOS VTC</div>
                            <div style="font-size: 1.2rem; font-weight: 700; color: white; display: flex; align-items: center; gap: 0.4rem;">
                                <div style="background: #7b48fa; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><i data-lucide="car" style="width:14px; height:14px; color: white;"></i></div>
                                cadiz.cab
                            </div>
                        </div>
                        <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
                            <div style="background: #eab308; color: #111827; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 0.25rem 0.5rem; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">PREMIUM</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; width: 100%;">
                        <a href="#" class="md3-btn" style="flex: 1; padding: 0.6rem 0; background: rgba(123, 72, 250, 0.15); color: #e9d5ff; border: 1px solid rgba(123, 72, 250, 0.4);"><i data-lucide="calendar-check" style="width:16px; height:16px;"></i> Reservas</a>
                    </div>
                </div>
                
                <!-- Opción Cercanías (Rojo) - Formato Compacto -->
                <a href="#" style="display: flex; justify-content: space-between; align-items: center; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 9999px; padding: 0.6rem 1rem; text-decoration: none; margin-bottom: 0.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                        <div style="background: #ef4444; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><i data-lucide="train" style="width:14px; height:14px; color: white;"></i></div>
                        <span style="font-size: 0.85rem; font-weight: 600; color: white;">Cercanías</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="background: #10b981; color: #022c22; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 0.25rem 0.5rem; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">ECO</span>
                        <i data-lucide="chevron-right" style="width: 16px; height: 16px; color: #fca5a5;"></i>
                    </div>
                </a>

                <!-- Opción Autobús (Amarillo) - Formato Compacto -->
                <a href="#" style="display: flex; justify-content: space-between; align-items: center; background: rgba(234, 179, 8, 0.08); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 9999px; padding: 0.6rem 1rem; text-decoration: none; margin-bottom: 0.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                        <div style="background: #eab308; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><i data-lucide="bus" style="width:14px; height:14px; color: #111827;"></i></div>
                        <span style="font-size: 0.85rem; font-weight: 600; color: white;">Autobús</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="background: #10b981; color: #022c22; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 0.25rem 0.5rem; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">ECO</span>
                        <i data-lucide="chevron-right" style="width: 16px; height: 16px; color: #fde047;"></i>
                    </div>
                </a>

                <!-- Opción Tranvía (Verde) - Formato Compacto -->
                <a href="#" style="display: flex; justify-content: space-between; align-items: center; background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 9999px; padding: 0.6rem 1rem; text-decoration: none; margin-bottom: 0.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                        <div style="background: #10b981; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><i data-lucide="tram-front" style="width:14px; height:14px; color: white;"></i></div>
                        <span style="font-size: 0.85rem; font-weight: 600; color: white;">Tranvía</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="background: #10b981; color: #022c22; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 0.25rem 0.5rem; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">ECO</span>
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
