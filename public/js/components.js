// DESTINOS DATABASE Y COMPONENTES
const dbDestinos = {
    aeropuertos: [
        { id: "jerez", name: "Aeropuerto de Jerez", price: "55€", icon: "plane", time: "35 min", lat: 36.7446, lon: -6.0601 },
        { id: "sevilla", name: "Aeropuerto de Sevilla", price: "145€", icon: "plane", time: "1h 15 min", lat: 37.4180, lon: -5.8931 },
        { id: "malaga", name: "Aeropuerto de Málaga", price: "245€", icon: "plane", time: "2h 30 min", lat: 36.6749, lon: -4.4991 }
    ],
    favoritos: [
        { id: "tarifa", name: "Tarifa (Puerto)", price: "78€", icon: "map-pin", time: "1h 20 min", lat: 36.0127, lon: -5.6033 },
        { id: "bahia", name: "Bahía Sur (San Fernando)", price: "19€", icon: "map-pin", time: "15 min", lat: 36.4674, lon: -6.2081 },
        { id: "chiclana", name: "Chiclana (Centro)", price: "42€", icon: "map-pin", time: "25 min", lat: 36.4182, lon: -6.1461 },
        { id: "puerto", name: "El Puerto de Santa María", price: "19€", icon: "map-pin", time: "20 min", lat: 36.5938, lon: -6.2263 },
        { id: "areasur", name: "C.C. Área Sur (Jerez)", price: "29€", icon: "map-pin", time: "25 min", lat: 36.6912, lon: -6.1554 },
        { id: "rota", name: "Rota (Costa Ballena)", price: "35€", icon: "map-pin", time: "40 min", lat: 36.6853, lon: -6.4132 },
        { id: "sanlucar", name: "Sanlúcar de Barrameda", price: "39€", icon: "map-pin", time: "40 min", lat: 36.7761, lon: -6.3533 },
        { id: "vejer", name: "Vejer de la Frontera", price: "43€", icon: "map-pin", time: "45 min", lat: 36.2526, lon: -5.9642 }
    ]
};

function renderDestino(dest, gridType) {
    return `
    <div class="mini-dest-card pildora-hover" onclick="showDestinoDetails('${dest.id}', '${gridType}')" style="margin-bottom: 1rem; cursor: pointer;">
        <div class="mini-dest-header" style="align-items: center; position: relative; width: 100%; display: flex; justify-content: space-between;">
            <div class="mini-dest-name" style="display: flex; flex-direction: column; align-items: flex-start; gap: 0.2rem;">
                <div style="font-size: 0.65rem; color: white; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">DESDE CÁDIZ A</div>
                <div style="display: flex; align-items: center; gap: 0.4rem;">
                    <i data-lucide="${dest.icon}" size="16" style="color: var(--brand-cyan);"></i> ${dest.name}
                </div>
            </div>
            <div style="display: flex; align-items: center;">
                <div class="mini-dest-info-right" style="text-align: right;">
                    <div style="display: flex; align-items: baseline; justify-content: flex-end; gap: 0.1rem;">
                        <span class="mini-dest-price" style="line-height: 1;">${dest.price}</span>
                        <span style="font-size: 1.2rem; color: var(--brand-cyan); font-weight: 800; transform: translateY(2px);">*</span>
                    </div>
                    ${dest.time ? `<div style="font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; justify-content: flex-end; gap: 0.25rem; margin-top: 0.3rem; white-space: nowrap;"><i data-lucide="clock" style="width: 12px; height: 12px;"></i> ${dest.time}</div>` : ''}
                </div>
                <!-- Right arrow to indicate clickability -->
                <div style="display: flex; align-items: center; margin-left: 0.8rem;">
                    <div style="background: rgba(6,182,212,0.12); border: 1px solid rgba(6,182,212,0.35); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i data-lucide="chevron-right" style="color: var(--brand-cyan); width: 16px; height: 16px;"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

window.showDestinoDetails = function(destId, gridType) {
    const dest = dbDestinos[gridType].find(d => d.id === destId);
    if (!dest) return;
    
    const gridId = gridType === 'aeropuertos' ? 'aeropuertos-grid-dinamico' : 'favoritos-grid-dinamico';
    const activeViewId = gridType === 'aeropuertos' ? 'aeropuertos-active-view' : 'favoritos-active-view';
    const optionsContainerId = gridType === 'aeropuertos' ? 'aeropuertos-opciones-container' : 'favoritos-opciones-container';
    
    const gridEl = document.getElementById(gridId);
    const activeViewEl = document.getElementById(activeViewId);
    const optionsContainerEl = document.getElementById(optionsContainerId);
    
    if (!gridEl || !activeViewEl || !optionsContainerEl) return;
    
    // Ocultar grid y mostrar active view
    gridEl.style.display = 'none';
    activeViewEl.style.display = 'block';
    
    // Inyectar opciones
    optionsContainerEl.innerHTML = buildSelectedDestinoWidget(dest, gridType);
    
    // Animar scroll hacia arriba
    const sectionTitle = gridEl.previousElementSibling?.previousElementSibling;
    if (sectionTitle) {
        const originalScrollBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = 'auto';
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const offsetPosition = sectionTitle.getBoundingClientRect().top + window.scrollY - headerHeight - 10;
        window.scrollTo({ top: offsetPosition, behavior: 'auto' });
        requestAnimationFrame(() => {
            document.documentElement.style.scrollBehavior = originalScrollBehavior;
        });
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Trigger map update
    if (window.renderDestinoMap) {
        window.renderDestinoMap(dest, gridType);
    }
};

window.hideDestinoDetails = function(gridType) {
    const gridId = gridType === 'aeropuertos' ? 'aeropuertos-grid-dinamico' : 'favoritos-grid-dinamico';
    const activeViewId = gridType === 'aeropuertos' ? 'aeropuertos-active-view' : 'favoritos-active-view';
    
    const gridEl = document.getElementById(gridId);
    const activeViewEl = document.getElementById(activeViewId);
    
    if (activeViewEl) activeViewEl.style.display = 'none';
    if (gridEl) gridEl.style.display = ''; 

    // Scroll back
    const sectionTitle = gridEl?.previousElementSibling?.previousElementSibling;
    if (sectionTitle) {
        const originalScrollBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = 'auto';
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const offsetPosition = sectionTitle.getBoundingClientRect().top + window.scrollY - headerHeight - 10;
        window.scrollTo({ top: offsetPosition, behavior: 'auto' });
        requestAnimationFrame(() => {
            document.documentElement.style.scrollBehavior = originalScrollBehavior;
        });
    }
};

function buildSelectedDestinoWidget(dest, gridType) {
    const content = `
        <div style="display: flex; flex-direction: column; width: 100%;">
            <!-- Opción Taxis Oficiales -->
            <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 30px; padding: 0.75rem 1rem; display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
                    <div style="display: flex; align-items: center; gap: 0.6rem;">
                        <div style="background: #eab308; color: #111827; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.65rem;">RT</div>
                        <div style="display: flex; flex-direction: column;">
                            <div style="color: #fff; font-weight: 600; font-size: 1.1rem;">Taxi Oficial</div>
                            <div style="display: flex; align-items: baseline; gap: 0.15rem;">
                                <span style="font-size: 1.1rem; font-weight: 800; color: white;">${dest.price}</span>
                                <span style="font-size: 1.1rem; color: var(--brand-cyan); font-weight: 800; transform: translateY(2px);">*</span>
                                ${dest.time ? `<span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 0.5rem; display: flex; align-items: center; gap: 0.2rem;"><i data-lucide="clock" style="width: 12px; height: 12px;"></i> ${dest.time}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.4rem;">
                        <a href="https://wa.me/34956212121" target="_blank" aria-label="WhatsApp" style="width: 44px; height: 44px; border-radius: 50%; background: #25D366; display: flex; align-items: center; justify-content: center; text-decoration: none; transition: all 0.3s ease;">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 20px; height: 20px; color: white;">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                            </svg>
                        </a>
                        <a href="tel:+34956212121" aria-label="Llamar" style="width: 44px; height: 44px; border-radius: 50%; background: #06b6d4; display: flex; align-items: center; justify-content: center; text-decoration: none; transition: all 0.3s ease;">
                            <i data-lucide="phone" style="width: 20px; height: 20px; color: white;"></i>
                        </a>
                    </div>
                </div>
                <!-- Alert Text -->
                <div style="display: flex; align-items: flex-start; gap: 0.5rem; background: rgba(255, 255, 255, 0.05); padding: 0.6rem; border-radius: 8px; font-size: 0.7rem; color: var(--text-muted); line-height: 1.3; border-left: 2px solid var(--brand-cyan); margin-top: 0.2rem;">
                    <span style="color: var(--brand-cyan); font-weight: 800; font-size: 1rem; line-height: 1; transform: translateY(1px);">*</span>
                    <span style="flex: 1;">Precio estimado según calculadora de cadiz.taxi. Sólo el taxímetro oficial determina el precio final.</span>
                </div>
            </div>
            
            <!-- Separador OTRAS OPCIONES -->
            <div style="display: flex; align-items: center; gap: 0.75rem; margin: 1rem 0;">
                <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3));"></div>
                <span style="font-size: 0.65rem; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #ffffff; white-space: nowrap;">OTRAS OPCIONES</span>
                <div style="flex: 1; height: 1px; background: linear-gradient(90deg, rgba(255,255,255,0.3), transparent);"></div>
            </div>

            <!-- Opción VTC Alternativa (From Paradas) -->
            <div class="cadizcab-card-hover" style="background: linear-gradient(145deg, rgba(123, 72, 250, 0.15), rgba(99, 102, 241, 0.05)); border: 1px solid rgba(123, 72, 250, 0.4); box-shadow: 0 8px 32px rgba(123, 72, 250, 0.15); border-radius: 30px; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; position: relative; overflow: hidden; margin-bottom: 0.85rem;">
                <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, transparent, #7b48fa, transparent);"></div>
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                        <i data-lucide="star" style="color: #eab308; width: 14px; height: 14px; fill: #eab308;"></i>
                        <span style="color: #eab308; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">FAVORITO</span>
                    </div>
                    <div style="background: #eab308; color: #111827; font-size: 0.6rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 0.25rem 0.5rem; border-radius: 6px; box-shadow: 0 2px 8px rgba(234, 179, 8, 0.3);">PREMIUM</div>
                </div>
                <div style="display: flex; flex-direction: column; align-items: flex-start;">
                    <div style="font-size: 1.3rem; font-weight: 800; color: white; display: flex; align-items: center; gap: 0.5rem; letter-spacing: -0.02em;">
                        <div style="background: #7b48fa; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><i data-lucide="car" style="width:14px; height:14px; color: white;"></i></div>
                        cadiz.cab
                    </div>
                    <div style="font-size: 0.85rem; color: #a78bfa; font-weight: 500; margin-top: 0.2rem; margin-left: 2.2rem;">Vehículos VTC</div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.4rem; padding: 0.75rem 0; border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); margin-top: 0.25rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <i data-lucide="check-circle-2" style="width: 14px; height: 14px; color: #10b981;"></i>
                        <span style="font-size: 0.85rem; color: rgba(255,255,255,0.8);">Precio cerrado anticipado</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <i data-lucide="check-circle-2" style="width: 14px; height: 14px; color: #10b981;"></i>
                        <span style="font-size: 0.85rem; color: rgba(255,255,255,0.8);">Sin esperas en la parada</span>
                    </div>
                </div>
                <a href="https://cadiz.cab" target="_blank" style="width: 100%; display: flex; justify-content: center; align-items: center; gap: 0.5rem; background: linear-gradient(135deg, #7b48fa, #6366f1); color: white; padding: 1rem; border-radius: 9999px; margin-top: 0.5rem; text-decoration: none; font-weight: 800; font-size: 1.1rem; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(123, 72, 250, 0.4); border: none; transition: all 0.3s ease;">
                    <i data-lucide="calendar-check" style="width: 20px; height: 20px;"></i> Reservar
                </a>
            </div>

            <!-- Separador TRANSPORTE PÚBLICO -->
            <div style="display: flex; align-items: center; gap: 0.75rem; margin: 1rem 0;">
                <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3));"></div>
                <span style="font-size: 0.65rem; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #ffffff; white-space: nowrap;">Transporte público</span>
                <div style="flex: 1; height: 1px; background: linear-gradient(90deg, rgba(255,255,255,0.3), transparent);"></div>
            </div>

            <!-- Opción Autobús Urbano -->
            <a href="#" style="display: flex; justify-content: space-between; align-items: center; background: rgba(234, 179, 8, 0.08); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 9999px; padding: 0.6rem 1rem; text-decoration: none; margin-bottom: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <div style="background: linear-gradient(to bottom, #fdf6e3 0%, #fdf6e3 47%, #ea580c 47%, #ea580c 53%, #059669 53%, #059669 100%); width: 26px; height: 26px; border-radius: 50%; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);"></div>
                    <div style="display: flex; align-items: center; gap: 0.3rem;">
                        <span style="font-size: 0.85rem; font-weight: 600; color: white;">Autobús Urbano</span>
                        <div style="background: white; color: #111827; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.55rem; font-weight: 800; margin-left: 0.2rem;">1</div>
                        <div style="background: white; color: #111827; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.55rem; font-weight: 800;">3</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="background: #10b981; color: #022c22; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 0.25rem 0.5rem; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">ECO</span>
                    <i data-lucide="chevron-right" style="width: 16px; height: 16px; color: #fde047;"></i>
                </div>
            </a>

            <!-- Opción Tren -->
            <a href="#" style="display: flex; justify-content: space-between; align-items: center; background: rgba(142, 68, 173, 0.15); border: 1px solid rgba(142, 68, 173, 0.4); border-radius: 9999px; padding: 0.6rem 1rem; text-decoration: none; margin-bottom: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <div style="background: #8e44ad; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.1rem; font-family: sans-serif; color: white; padding-bottom: 2px;">r</div>
                    <div style="display: flex; align-items: center; gap: 0.3rem;">
                        <span style="font-size: 0.85rem; font-weight: 600; color: white;">Tren</span>
                        <div style="background: #ef4444; color: white; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.55rem; font-weight: 800; margin-left: 0.2rem;">C</div>
                        <div style="background: #f97316; color: white; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.55rem; font-weight: 800;">MD</div>
                        <div style="background: #3b82f6; color: white; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.55rem; font-weight: 800;">LG</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="background: #10b981; color: #022c22; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 0.25rem 0.5rem; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">ECO</span>
                    <i data-lucide="chevron-right" style="width: 16px; height: 16px; color: #a855f7;"></i>
                </div>
            </a>

            <!-- Opción Tranvía -->
            <a href="#" style="display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 9999px; padding: 0.6rem 1rem; text-decoration: none; margin-bottom: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <div style="background: #10b981; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; color: white;">T</div>
                    <div style="display: flex; align-items: center; gap: 0.3rem;">
                        <span style="font-size: 0.85rem; font-weight: 600; color: white;">Tranvía</span>
                        <div style="background: white; color: #065f46; padding: 0.1rem 0.5rem; border-radius: 999px; display: flex; align-items: center; justify-content: center; font-size: 0.55rem; font-weight: 800; margin-left: 0.2rem; text-transform: uppercase;">A Chiclana</div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="background: #10b981; color: #022c22; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 0.25rem 0.5rem; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">ECO</span>
                    <i data-lucide="chevron-right" style="width: 16px; height: 16px; color: #d1d5db;"></i>
                </div>
            </a>

            <!-- Opción Autobús Interurbano -->
            <a href="#" style="display: flex; justify-content: space-between; align-items: center; background: rgba(0, 102, 77, 0.15); border: 1px solid rgba(0, 102, 77, 0.4); border-radius: 9999px; padding: 0.6rem 1rem; text-decoration: none; margin-bottom: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <div style="background: #00664d; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.75rem; color: white; letter-spacing: -0.5px;">C</div>
                    <div style="display: flex; align-items: center; gap: 0.3rem;">
                        <span style="font-size: 0.85rem; font-weight: 600; color: white;">Autobús Interurbano</span>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="background: #10b981; color: #022c22; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 0.25rem 0.5rem; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">ECO</span>
                    <i data-lucide="chevron-right" style="width: 16px; height: 16px; color: #34d399;"></i>
                </div>
            </a>
        </div>
    `;

    return header + content;
}
document.addEventListener("DOMContentLoaded", () => {
    const aeroGrid = document.getElementById("aeropuertos-grid-dinamico");
    if (aeroGrid) { aeroGrid.innerHTML = dbDestinos.aeropuertos.map(d => renderDestino(d, 'aeropuertos')).join(''); }
    
    const favGrid = document.getElementById("favoritos-grid-dinamico");
    if (favGrid) { favGrid.innerHTML = dbDestinos.favoritos.map(d => renderDestino(d, 'favoritos')).join(''); }
});
