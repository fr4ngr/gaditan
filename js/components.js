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
    <details class="mini-dest-card native-accordion" style="margin-bottom: 1rem;">
        <summary class="mini-dest-header" style="align-items: center; position: relative; width: 100%; list-style: none;">
            <div class="mini-dest-name" style="display: flex; flex-direction: column; align-items: flex-start; gap: 0.2rem;">
                <div style="font-size: 0.65rem; color: var(--brand-cyan); font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">DESDE CÁDIZ A</div>
                <div style="display: flex; align-items: center; gap: 0.4rem;">
                    <i data-lucide="${dest.icon}" size="16" style="color: var(--brand-cyan);"></i> ${dest.name}
                </div>
            </div>
            <div class="mini-dest-info-right" style="text-align: right;">
                <div style="display: flex; align-items: baseline; justify-content: flex-end; gap: 0.1rem;">
                    <span class="mini-dest-price" style="line-height: 1;">${dest.price}</span>
                    <span style="font-size: 1.2rem; color: var(--brand-cyan); font-weight: 800; transform: translateY(2px);">*</span>
                </div>
                ${dest.time ? `<div style="font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; justify-content: flex-end; gap: 0.25rem; margin-top: 0.3rem;"><i data-lucide="clock" style="width: 12px; height: 12px;"></i> ${dest.time}</div>` : ''}
            </div>
            <button class="mini-dest-close-btn" aria-label="Cerrar" style="pointer-events: none;" onclick="event.preventDefault(); this.closest('details').removeAttribute('open');">
                <i data-lucide="x" style="width: 18px; height: 18px; pointer-events: none;"></i>
            </button>
        </summary>
        <div class="native-content" style="display: flex; flex-direction: column; gap: 1rem;">
                <!-- Opción Radio Taxi -->
                <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;">
                    <!-- Badge Servicio -->
                    <div style="display: flex; align-items: center; gap: 0.4rem; margin-bottom: -0.5rem;">
                        <span style="color: var(--brand-cyan); font-size: 0.7rem; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">Servicio prestado por</span>
                    </div>
                    
                    <!-- Header Tarjeta -->
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <div style="background: #eab308; color: #111827; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem;">RT</div>
                                <span style="font-size: 1.2rem; font-weight: 800; color: white;">Radio Taxi</span>
                            </div>
                            <div style="font-size: 0.95rem; color: var(--text-muted); font-weight: 500; padding-left: calc(28px + 0.5rem); letter-spacing: 0.5px;">
                                956 21 21 21
                            </div>
                        </div>
                        
                        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.3rem;">
                            <div style="display: flex; align-items: baseline; gap: 0.15rem;">
                                <span style="font-size: 1.5rem; font-weight: 800; color: white;">${dest.price}</span>
                                <span style="font-size: 1.5rem; color: var(--brand-cyan); font-weight: 800; transform: translateY(2px);">*</span>
                            </div>
                            ${dest.time ? `<div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500; display: flex; align-items: center; gap: 0.3rem;">
                                <i data-lucide="clock" style="width: 14px; height: 14px;"></i> ${dest.time}
                            </div>` : ''}
                        </div>
                    </div>
                    
                    <!-- Alert Text -->
                    <div style="font-size: 0.85rem; color: rgba(255,255,255,0.9); line-height: 1.4; text-align: left; font-weight: 400; background: rgba(0,0,0,0.3); padding: 0.75rem 1rem; border-radius: 12px; border-left: 3px solid var(--brand-cyan); display: flex; align-items: flex-start; gap: 0.5rem; margin-top: 0.5rem;">
                        <span style="color: var(--brand-cyan); font-weight: 800; font-size: 1.1rem; line-height: 1; transform: translateY(2px);">*</span>
                        <span style="flex: 1;">Estimación con tráfico favorable. El precio final lo determina el taxímetro oficial. Consúltales sin compromiso.</span>
                    </div>
                    
                    <!-- Botones -->
                    <div style="display: flex; justify-content: center; gap: 3rem; width: 100%; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1.25rem; margin-top: 0.5rem;">
                        <a href="tel:+34956212121" style="display: flex; flex-direction: column; align-items: center; gap: 0.6rem; text-decoration: none;">
                            <div class="circle-btn" style="background: #0284c7; box-shadow: none; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">
                                <i data-lucide="phone" style="width:26px; height:26px; color: white;"></i>
                            </div>
                            <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">Llamar</span>
                        </a>
                        <a href="https://wa.me/34956212121" style="display: flex; flex-direction: column; align-items: center; gap: 0.6rem; text-decoration: none;">
                            <div class="circle-btn" style="background: #22c55e; box-shadow: none; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">
                                <i data-lucide="message-circle" style="width:26px; height:26px; color: white;"></i>
                            </div>
                            <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">WhatsApp</span>
                        </a>
                    </div>
                </div>
                
                <!-- Separador de Alternativas -->
                <div style="display: flex; align-items: center; gap: 1rem; margin: 2rem 0;">
                    <div style="flex: 1; height: 1px; background: rgba(255,255,255,0.1);"></div>
                    <span style="color: var(--text-muted); font-size: 0.7rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">Otras Alternativas</span>
                    <div style="flex: 1; height: 1px; background: rgba(255,255,255,0.1);"></div>
                </div>
                
                <!-- Opción VTC Alternativa -->
                <div style="background: linear-gradient(145deg, rgba(123, 72, 250, 0.15), rgba(99, 102, 241, 0.05)); border: 1px solid rgba(123, 72, 250, 0.4); box-shadow: 0 8px 32px rgba(123, 72, 250, 0.15); border-radius: 16px; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; position: relative; overflow: hidden;">
                    <!-- Efecto brillo superior -->
                    <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #7b48fa, transparent);"></div>
                    <!-- Badge -->
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                        <i data-lucide="star" style="color: #eab308; width: 14px; height: 14px; fill: #eab308;"></i>
                        <span style="color: #eab308; font-size: 0.7rem; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">Servicio prestado por</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-top: 0.25rem;">
                        <div style="display: flex; flex-direction: column; gap: 0.2rem;">
                            <div style="display: flex; align-items: center; gap: 0.6rem;">
                                <div style="background: #6366f1; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                    <i data-lucide="car-front" style="width: 18px; height: 18px;"></i>
                                </div>
                                <span style="font-size: 1.4rem; font-weight: 900; color: white;">cadiz.cab</span>
                            </div>
                            <div style="font-size: 0.95rem; color: #a5b4fc; font-weight: 500; padding-left: calc(32px + 0.6rem);">
                                Vehículos VTC
                            </div>
                        </div>
                        
                        <div style="background: #eab308; color: #111827; font-size: 0.65rem; font-weight: 800; padding: 0.3rem 0.6rem; border-radius: 6px; letter-spacing: 1px; text-transform: uppercase; margin-top: 0.25rem;">
                            Premium
                        </div>
                    </div>
                    
                    <a href="https://cadiz.cab" target="_blank" style="width: 100%; display: flex; justify-content: center; align-items: center; gap: 0.5rem; background: linear-gradient(135deg, #7b48fa, #6366f1); color: white; padding: 1rem; border-radius: 9999px; margin-top: 0.5rem; text-decoration: none; font-weight: 800; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(123, 72, 250, 0.4); border: none; transition: all 0.3s ease;">
                        <i data-lucide="calendar-check" style="width: 20px; height: 20px;"></i> Reservar
                    </a>
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
                // Abrimos esta tarjeta sin cerrar las demás para evitar el salto de layout
                openDetailsSmoothly(details);
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
