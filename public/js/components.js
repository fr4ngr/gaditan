// DESTINOS DATABASE Y COMPONENTES
const dbDestinos = {
    aeropuertos: [
        { id: "jerez", name: "Aeropuerto de Jerez", price: "55€", icon: "plane", time: "35 min" },
        { id: "sevilla", name: "Aeropuerto de Sevilla", price: "145€", icon: "plane", time: "1h 15 min" },
        { id: "malaga", name: "Aeropuerto de Málaga", price: "245€", icon: "plane", time: "2h 30 min" }
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

function renderDestino(dest, gridType) {
    return `
    <div id="card-wrapper-${gridType}-${dest.id}" style="width: 100%;">
        <div class="mini-dest-card pildora-hover" id="card-header-${gridType}-${dest.id}" onclick="showDestinoDetails('${dest.id}', '${gridType}')" style="position: relative; margin-bottom: 0.5rem; cursor: pointer; display: flex; flex-direction: column;">
            <div class="mini-dest-header" style="align-items: center; position: relative; width: 100%; display: flex; justify-content: space-between; flex-wrap: wrap;">
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
                    ${dest.time ? `<div style="font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; justify-content: flex-end; gap: 0.25rem; margin-top: 0.3rem; white-space: nowrap;"><i data-lucide="clock" style="width: 12px; height: 12px;"></i> ${dest.time}</div>` : ''}
                </div>
                <!-- Icono de cerrar (X) oculto por defecto -->
                <div class="mini-dest-close-icon" style="display: none; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.05); transition: background 0.3s ease;">
                    <i data-lucide="x" style="color: white; width: 20px; height: 20px;"></i>
                </div>
            </div>
            <!-- Indicador interactivo inferior animado (latido) posicionado absolutamente para no empujar -->
            <div class="bottom-expand-indicator" style="position: absolute; bottom: 2px; left: 0; width: 100%; height: 0; display: flex; justify-content: center; align-items: flex-end; opacity: 0; overflow: hidden; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">
                <div class="chevron-wrapper" style="transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1); display: flex; justify-content: center;">
                    <i data-lucide="chevron-down" style="color: var(--brand-cyan); width: 20px; height: 20px;"></i>
                </div>
            </div>
        </div>
        <div id="detail-${gridType}-${dest.id}" class="dest-detail-container" style="width: 100%;">
            <div class="dest-detail-inner" id="inner-detail-${gridType}-${dest.id}">
                <!-- El contenido dinámico se inyecta aquí -->
            </div>
        </div>
    </div>
    `;
}

window.showDestinoDetails = function(destId, gridType) {
    const dest = dbDestinos[gridType].find(d => d.id === destId);
    if (!dest) return;
    
    const gridId = gridType === 'aeropuertos' ? 'aeropuertos-grid-dinamico' : 'favoritos-grid-dinamico';
    const gridEl = document.getElementById(gridId);
    if (!gridEl) return;
    
    const detailContainerId = `detail-${gridType}-${destId}`;
    const detailEl = document.getElementById(detailContainerId);
    const isCurrentlyOpen = detailEl.classList.contains('is-open');

    const thisCard = document.getElementById(`card-header-${gridType}-${destId}`);
    const thisChevron = thisCard.querySelector('.chevron-wrapper');

    // Si ya está abierta, simplemente la cerramos
    if (isCurrentlyOpen) {
        detailEl.classList.remove('is-open');
        thisCard.classList.remove('card-open');
        if (thisChevron) thisChevron.style.transform = 'rotate(0deg)';
        setTimeout(() => {
            if (!detailEl.classList.contains('is-open')) {
                const inner = detailEl.querySelector('.dest-detail-inner');
                if (inner) inner.style.display = 'none'; // ocultar sin romper layout
            }
        }, 450);
        return;
    }

    // Buscamos si hay alguna OTRA tarjeta abierta
    const openDetails = Array.from(gridEl.querySelectorAll('.dest-detail-container.is-open'));
    
    function openNewCard() {
        // Inyectamos contenido
        const inner = detailEl.querySelector('.dest-detail-inner');
        inner.style.display = ''; // Resetear display por si estaba oculto
        inner.innerHTML = buildSelectedDestinoWidget(dest, gridType);
        if (typeof lucide !== 'undefined') lucide.createIcons();
        
        // Rotar chevron
        if (thisChevron) thisChevron.style.transform = 'rotate(180deg)';

        // Forzar reflow y añadir clase para abrir
        void detailEl.offsetWidth;
        detailEl.classList.add('is-open');
        thisCard.classList.add('card-open');

        // Hacer scroll suave hacia la tarjeta tras un pequeñísimo delay para que el layout se calcule
        setTimeout(() => {
            const originalScrollBehavior = document.documentElement.style.scrollBehavior;
            document.documentElement.style.scrollBehavior = 'smooth';
            const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
            
            // Usamos un scroll position ajustado
            const offsetPosition = thisCard.getBoundingClientRect().top + window.scrollY - headerHeight - 75;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            
            setTimeout(() => {
                document.documentElement.style.scrollBehavior = originalScrollBehavior;
            }, 400);
        }, 50);
    }

    if (openDetails.length > 0) {
        // 1. Cerramos las que estén abiertas
        openDetails.forEach(el => {
            el.classList.remove('is-open');
            // Buscamos su chevron para resetearlo (el wrapper hermano previo)
            const parentCard = el.previousElementSibling;
            if (parentCard) {
                parentCard.classList.remove('card-open');
                const chevron = parentCard.querySelector('.chevron-wrapper');
                if (chevron) chevron.style.transform = 'rotate(0deg)';
            }
            // Limpiamos contenido tras animación
            setTimeout(() => {
                if (!el.classList.contains('is-open')) {
                    const inner = el.querySelector('.dest-detail-inner');
                    if (inner) inner.style.display = 'none'; // ocultar sin romper layout
                }
            }, 450);
        });

        // 2. Esperamos a que termine la animación de cierre (aprox 350ms) antes de abrir la nueva
        setTimeout(() => {
            openNewCard();
        }, 350); 
    } else {
        // No había ninguna abierta, abrimos directamente
        openNewCard();
    }
};

function buildSelectedDestinoWidget(dest, gridType) {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 0.5rem; margin-bottom: 0.5rem;">
            <!-- Opción Taxis Oficiales -->
            <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 30px; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; margin-bottom: 0.85rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
                    <div style="width: 100%;">
                        <div style="font-size: 0.65rem; color: #06b6d4; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.4rem; font-weight: 600; display: flex; align-items: center; gap: 0.3rem;">Servicio prestado por</div>
                        <div style="font-size: 1.2rem; font-weight: 700; color: white; display: flex; align-items: center; gap: 0.4rem; width: 100%;">
                            <div style="background: #eab308; color: #111827; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.65rem;">TO</div>
                            Taxi Oficial
                        </div>
                    </div>
                    
                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.3rem;">
                        <div style="display: flex; align-items: baseline; gap: 0.15rem;">
                            <span style="font-size: 1.5rem; font-weight: 800; color: white;">${dest.price}</span>
                            <span style="font-size: 1.5rem; color: var(--brand-cyan); font-weight: 800; transform: translateY(2px);">*</span>
                        </div>
                        ${dest.time ? `<div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500; display: flex; align-items: center; gap: 0.3rem; white-space: nowrap;">
                            <i data-lucide="clock" style="width: 14px; height: 14px;"></i> ${dest.time}
                        </div>` : ''}
                    </div>
                </div>
                
                <!-- Alert Text -->
                <div style="display: flex; align-items: flex-start; gap: 0.5rem; background: rgba(255, 255, 255, 0.05); padding: 0.8rem; border-radius: 8px; font-size: 0.75rem; color: var(--text-muted); line-height: 1.4; border-left: 3px solid var(--brand-cyan);">
                    <span style="color: var(--brand-cyan); font-weight: 800; font-size: 1.1rem; line-height: 1; transform: translateY(2px);">*</span>
                    <span style="flex: 1;">Precio estimado con la CALCULADORA DE TAXI de cadiz.taxi con la ruta más corta y las condiciones de tráfico más favorables. Sólo el taxímetro oficial determinará el precio final de tu viaje.</span>
                </div>

                <!-- Botones de acción -->
                <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem; width: 100%;">
                    <a href="tel:+34956212121" style="flex: 1; display: flex; justify-content: center; align-items: center; gap: 0.4rem; background: #06b6d4; color: white; padding: 0.8rem; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 0.95rem; border: none; box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3); transition: all 0.3s ease;">
                        <i data-lucide="phone" style="width: 18px; height: 18px;"></i> Llamar
                    </a>
                    <a href="https://wa.me/34956212121" target="_blank" style="flex: 1; display: flex; justify-content: center; align-items: center; gap: 0.4rem; background: #25D366; color: white; padding: 0.8rem; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 0.95rem; border: none; box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3); transition: all 0.3s ease;">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 20px; height: 20px;">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                        </svg>
                        WhatsApp
                    </a>
                </div>
            </div>
            
            <!-- Separador ¿PRECIO CERRADO? -->
            <div style="display: flex; align-items: center; gap: 0.75rem; margin: 0.25rem 0;">
                <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(123,72,250,0.4));"></div>
                <span style="font-size: 0.65rem; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #a78bfa; white-space: nowrap;">¿Precio cerrado?</span>
                <div style="flex: 1; height: 1px; background: linear-gradient(90deg, rgba(123,72,250,0.4), transparent);"></div>
            </div>

            <!-- Tarjeta Cadiz.cab -->
            <div class="cadizcab-card-hover" style="background: linear-gradient(145deg, rgba(123, 72, 250, 0.15), rgba(99, 102, 241, 0.05)); border: 1px solid rgba(123, 72, 250, 0.4); box-shadow: 0 8px 32px rgba(123, 72, 250, 0.15); border-radius: 30px; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; position: relative; overflow: hidden;">
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

            <!-- Separador TRANSPORTE PÚBLICO -->
            <div style="display: flex; align-items: center; gap: 0.75rem; margin: 0.25rem 0;">
                <div style="flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(234,179,8,0.4));"></div>
                <span style="font-size: 0.65rem; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; color: #fbbf24; white-space: nowrap;">Transporte público</span>
                <div style="flex: 1; height: 1px; background: linear-gradient(90deg, rgba(234,179,8,0.4), transparent);"></div>
            </div>

            <!-- Opción Autobús Interurbano (Amarillo) - Formato Compacto -->
            <a href="#" style="display: flex; justify-content: space-between; align-items: center; background: rgba(234, 179, 8, 0.08); border: 1px solid rgba(234, 179, 8, 0.3); border-radius: 9999px; padding: 0.6rem 1rem; text-decoration: none; margin-bottom: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                    <div style="background: #eab308; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><i data-lucide="bus" style="width:14px; height:14px; color: #111827;"></i></div>
                    <span style="font-size: 0.85rem; font-weight: 600; color: white;">Autobús Urbano</span>
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
    `;
    return content;
}

document.addEventListener("DOMContentLoaded", () => {
    const aeroGrid = document.getElementById("aeropuertos-grid-dinamico");
    if (aeroGrid) { aeroGrid.innerHTML = dbDestinos.aeropuertos.map(d => renderDestino(d, 'aeropuertos')).join(''); }
    
    const favGrid = document.getElementById("favoritos-grid-dinamico");
    if (favGrid) { favGrid.innerHTML = dbDestinos.favoritos.map(d => renderDestino(d, 'favoritos')).join(''); }
});
