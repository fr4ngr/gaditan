
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
    const timeHtml = dest.time ? <div class="mini-dest-time" style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.25rem;"><i data-lucide="clock" style="width: 12px; height: 12px;"></i> </div> : '';
    
    return 
    <details class="mini-dest-card native-accordion" style="margin-bottom: 2rem;">
        <summary class="mini-dest-header" style="align-items: center; position: relative; width: 100%;">
            <div class="mini-dest-name">
                <i data-lucide="" size="16" style="color: var(--brand-cyan);"></i> 
            </div>
            <div class="mini-dest-info-right" style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.1rem;">
                <div class="mini-dest-price" style="line-height: 1;"> aprox.</div>
                
            </div>
            <button class="mini-dest-close-btn" aria-label="Cerrar" style="pointer-events: none;" onclick="event.preventDefault(); this.closest('details').removeAttribute('open');">
                <i data-lucide="x" style="width: 18px; height: 18px; pointer-events: none;"></i>
            </button>
        </summary>
        
        <div class="native-content" style="padding-top: 1.5rem; padding-bottom: 0.5rem; display: flex; flex-direction: column; gap: 0.8rem; width: 100%;">
                <!-- Opción Radio Taxi -->
                <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.2rem;">
                        <div>
                            <div style="font-size: 0.75rem; color: var(--brand-cyan); font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.2rem;">Servicio Oficial</div>
                            <div style="font-size: 1.2rem; font-weight: 700; color: white; display: flex; align-items: center; gap: 0.4rem;">
                                <div style="background: #eab308; color: #111827; width: 22px; height: 22px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.65rem;">RT</div>
                                Radio Taxi
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.5rem; font-weight: 800; color: white; line-height: 1;"></div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; width: 100%;">
                        <a href="tel:+34956212121" class="md3-btn md3-primary" style="flex: 1; padding: 0.6rem 0;"><i data-lucide="phone" style="width:16px; height:16px;"></i> Llamar</a>
                    </div>
                </div>
                
                <!-- Opción VTC Alternativa -->
                <div style="background: rgba(0,0,0,0.25); border: 1px dashed rgba(255,255,255,0.15); border-radius: 12px; padding: 0.8rem 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;">
                        <div style="display: flex; align-items: center; gap: 0.6rem;">
                            <div style="background: rgba(255,255,255,0.1); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><i data-lucide="car" style="width:14px; height:14px; color: #9ca3af;"></i></div>
                            <div>
                                <div style="font-size: 0.95rem; font-weight: 600; color: white;">cadiz.cab</div>
                                <div style="font-size: 0.75rem; color: var(--text-muted);">Alternativa Premium</div>
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 1.1rem; font-weight: 700; color: #9ca3af; line-height: 1;">0€</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; width: 100%;">
                        <a href="#" class="md3-btn" style="flex: 1; padding: 0.6rem 0; background: rgba(255,255,255,0.05); color: #9ca3af; border: 1px solid rgba(255,255,255,0.1);"><i data-lucide="info" style="width:16px; height:16px;"></i> Más info</a>
                    </div>
                </div>
        </div>
    </details>
    ;
}

document.addEventListener("DOMContentLoaded", () => {
    const aeroGrid = document.getElementById("aeropuertos-grid-dinamico");
    if (aeroGrid) { aeroGrid.innerHTML = dbDestinos.aeropuertos.map(renderDestino).join(''); }
    
    const favGrid = document.getElementById("favoritos-grid-dinamico");
    if (favGrid) { favGrid.innerHTML = dbDestinos.favoritos.map(renderDestino).join(''); }
    
    // Configurar comportamiento exclusivo para TODOS los details
    document.querySelectorAll('details.native-accordion').forEach(details => {
        details.addEventListener('toggle', (e) => {
            if (details.open) {
                document.querySelectorAll('details.native-accordion').forEach(other => {
                    if (other !== details) other.removeAttribute('open');
                });
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        });
    });
});
