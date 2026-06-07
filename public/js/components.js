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
    <details class="mini-dest-card native-accordion pildora-hover" style="margin-bottom: 1rem;">
        <summary class="mini-dest-header" style="align-items: center; position: relative; width: 100%; list-style: none;">
            <div class="mini-dest-name" style="display: flex; flex-direction: column; align-items: flex-start; gap: 0.2rem;">
                <div style="font-size: 0.65rem; color: white; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">DESDE CÁDIZ A</div>
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
            <button class="mini-dest-close-btn" aria-label="Cerrar" style="pointer-events: none;" onclick="event.preventDefault(); this.closest('details').removeAttribute('open');">
                <i data-lucide="x" style="width: 18px; height: 18px; pointer-events: none;"></i>
            </button>
        </summary>
        <div class="native-content" style="display: flex; flex-direction: column; gap: 1rem;">
                <!-- Opción Taxis Oficiales -->
                <div style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 30px; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;">
                    
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
                        <div style="width: 100%;">
                            <div style="font-size: 0.65rem; color: #06b6d4; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.4rem; font-weight: 600; display: flex; align-items: center; gap: 0.3rem;">Servicio prestado por</div>
                            <div style="font-size: 1.2rem; font-weight: 700; color: white; display: flex; align-items: center; gap: 0.4rem; width: 100%;">
                                <div style="background: #eab308; color: #111827; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.65rem;">TO</div>
                                Taxis Oficiales
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
                // Guardamos la posición original en la pantalla del elemento pulsado
                const rectBefore = details.getBoundingClientRect().top;
                
                // 1. Cerramos las demás tarjetas del mismo grupo de forma INSTANTÁNEA
                const gridName = details.closest('.mini-dest-grid')?.id;
                if (gridName) {
                    const others = document.querySelectorAll(`#${gridName} details.native-accordion[open]`);
                    others.forEach(other => {
                        if (other !== details) {
                            // Cierre instantáneo, sin animación, para poder calcular el salto exacto
                            other.removeAttribute('open');
                            other.classList.remove('closing');
                        }
                    });
                }
                
                // 2. Calculamos cuánto ha saltado la pantalla tras el cierre instantáneo
                const rectAfter = details.getBoundingClientRect().top;
                const diff = rectAfter - rectBefore;
                
                // 3. Compensamos el scroll de forma síncrona en el mismo frame
                // IMPORTANTE: Desactivar scroll-behavior smooth de CSS para que el salto sea invisible
                if (Math.abs(diff) > 0) {
                    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
                    document.documentElement.style.scrollBehavior = 'auto';
                    
                    window.scrollBy(0, diff);
                    
                    // Restauramos en el siguiente frame
                    requestAnimationFrame(() => {
                        document.documentElement.style.scrollBehavior = originalScrollBehavior;
                    });
                }
                
                // 4. Abrimos esta tarjeta suavemente
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
        const content = details.querySelector('.native-content');
        if (content) {
            // 1. Congelamos el contenido a tamaño cero mediante estilos en línea
            content.style.maxHeight = '0px';
            content.style.opacity = '0';
            content.style.paddingTop = '0px';
            content.style.paddingBottom = '0px';
            
            // 2. El navegador cambia el display a block, pero invisible gracias al paso 1
            details.setAttribute('open', '');
            
            // 3. Forzamos un repintado/reflow para que el navegador registre el tamaño cero
            void content.offsetWidth;
            
            // 4. Eliminamos los bloqueos. El CSS nativo dice que debe medir 1200px, así que el navegador hace la transición animada desde el 0 que registramos en el paso 3.
            content.style.maxHeight = '';
            content.style.opacity = '';
            content.style.paddingTop = '';
            content.style.paddingBottom = '';
        } else {
            details.setAttribute('open', '');
        }
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
});

