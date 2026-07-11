const fs = require('fs');

const targetFile = 'C:\\Users\\frn\\Documents\\cadiz.taxi\\src\\components\\Tarifas.astro';
let content = fs.readFileSync(targetFile, 'utf8');

// We find the part starting with '<div class="tarifas-grid">' and replace it up to '</section>' at the end.
const startTag = '<div class="tarifas-grid">';
const endTag = '</section>';

const startIndex = content.indexOf(startTag);
const endIndex = content.lastIndexOf(endTag);

if (startIndex === -1 || endIndex === -1) {
    console.error('Could not find start or end tags!');
    process.exit(1);
}

const replacement = `                <div class="tarifas-grid single-card-mode">
                    <!-- Tarjeta Día -->
                    <div class="glass card tarifas-card-hover fare-card-day" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; gap: 0; text-align: left; background: var(--bg-base); border: 1px solid rgba(6, 182, 212, 0.25);">
                        <div style="background: var(--brand-cyan); padding: 1.5rem 2rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; border-bottom: 1px solid rgba(15, 23, 42, 0.15);">
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <div style="background: rgba(15, 23, 42, 0.12); padding: 0.8rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(15, 23, 42, 0.15);">
                                    <i data-lucide="sun" style="color: var(--bg-base); width: 28px; height: 28px;"></i>
                                </div>
                                <div>
                                    <h4 style="margin: 0; font-size: 1.25rem; font-weight: 800; color: var(--bg-base);" data-translate="day-fare">Tarifa Diurna</h4>
                                    <p style="margin: 0.2rem 0 0 0; font-size: 0.85rem; color: rgba(15, 23, 42, 0.75); font-weight: 500;" data-translate="day-fare-sub">Lunes a Viernes (7h - 21h)</p>
                                </div>
                            </div>
                            <!-- Botón Toggle -->
                            <button class="fare-toggle-btn" data-target="night" style="background: rgba(15, 23, 42, 0.08); border: 1px solid rgba(15, 23, 42, 0.15); padding: 0.4rem 0.8rem; border-radius: 9999px; display: flex; align-items: center; gap: 0.4rem; color: var(--bg-base); font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(15, 23, 42, 0.15)'" onmouseout="this.style.background='rgba(15, 23, 42, 0.08)'">
                                <span data-translate="toggle-to-night">Ver Noche/Festivos</span>
                                <i data-lucide="eye" style="width: 15px; height: 15px;"></i>
                            </button>
                        </div>
                        
                        <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem; background: var(--bg-base);">
                            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
                                <span style="color: var(--text-muted); font-weight: 500;" data-translate="min-fare">Carrera mínima</span>
                                <strong style="color: var(--text-main); font-size: 1.1rem;">3,56 €</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
                                <span style="color: var(--text-muted); font-weight: 500;" data-translate="flag-drop">Bajada bandera</span>
                                <strong style="color: var(--text-main); font-size: 1.1rem;">1,39 €</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
                                <span style="color: var(--text-muted); font-weight: 500;" data-translate="price-km">Precio kilómetro</span>
                                <strong style="color: var(--text-main); font-size: 1.1rem;">0,70 €</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.2rem;">
                                <span style="color: var(--text-muted); font-weight: 500;" data-translate="waiting-hour">Hora de espera</span>
                                <strong style="color: var(--text-main); font-size: 1.1rem;">18,97 €</strong>
                            </div>
                        </div>
                    </div>

                    <!-- Tarjeta Noche -->
                    <div class="glass card tarifas-card-hover fare-card-night" style="padding: 0; overflow: hidden; display: none; flex-direction: column; gap: 0; text-align: left; background: var(--bg-base); border: 1px solid rgba(6, 182, 212, 0.25);">
                        <div style="background: var(--brand-cyan); padding: 1.5rem 2rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; border-bottom: 1px solid rgba(15, 23, 42, 0.15);">
                            <div style="display: flex; align-items: center; gap: 1rem;">
                                <div style="background: rgba(15, 23, 42, 0.12); padding: 0.8rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(15, 23, 42, 0.15);">
                                    <i data-lucide="moon" style="color: var(--bg-base); width: 28px; height: 28px;"></i>
                                </div>
                                <div>
                                    <h4 style="margin: 0; font-size: 1.25rem; font-weight: 800; color: var(--bg-base);" data-translate="night-fare">Tarifa Nocturna / Festivos</h4>
                                    <p style="margin: 0.2rem 0 0 0; font-size: 0.85rem; color: rgba(15, 23, 42, 0.75); font-weight: 500;" data-translate="night-fare-sub">Noches, Sábados, Domingos y Festivos</p>
                                </div>
                            </div>
                            <!-- Botón Toggle -->
                            <button class="fare-toggle-btn" data-target="day" style="background: rgba(15, 23, 42, 0.08); border: 1px solid rgba(15, 23, 42, 0.15); padding: 0.4rem 0.8rem; border-radius: 9999px; display: flex; align-items: center; gap: 0.4rem; color: var(--bg-base); font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(15, 23, 42, 0.15)'" onmouseout="this.style.background='rgba(15, 23, 42, 0.08)'">
                                <span data-translate="toggle-to-day">Ver Tarifa Diurna</span>
                                <i data-lucide="eye" style="width: 15px; height: 15px;"></i>
                            </button>
                        </div>
                        
                        <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem; background: var(--bg-base);">
                            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
                                <span style="color: var(--text-muted); font-weight: 500;" data-translate="min-fare">Carrera mínima</span>
                                <strong style="color: var(--text-main); font-size: 1.1rem;">4,43 €</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
                                <span style="color: var(--text-muted); font-weight: 500;" data-translate="flag-drop">Bajada bandera</span>
                                <strong style="color: var(--text-main); font-size: 1.1rem;">1,73 €</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
                                <span style="color: var(--text-muted); font-weight: 500;" data-translate="price-km">Precio kilómetro</span>
                                <strong style="color: var(--text-main); font-size: 1.1rem;">0,90 €</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.2rem;">
                                <span style="color: var(--text-muted); font-weight: 500;" data-translate="waiting-hour">Hora de espera</span>
                                <strong style="color: var(--text-main); font-size: 1.1rem;">23,66 €</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tarjeta Unificada de Suplementos -->
                <div class="glass card tarifas-card-hover" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; text-align: left; background: var(--bg-base); border: 1px solid rgba(6, 182, 212, 0.25); margin-bottom: 1.5rem;">
                    <div style="background: var(--brand-cyan); padding: 1.5rem 2rem; display: flex; align-items: center; gap: 0.6rem; border-bottom: 1px solid rgba(15, 23, 42, 0.15);">
                        <div style="background: rgba(15, 23, 42, 0.12); padding: 0.5rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(15, 23, 42, 0.15);">
                            <i data-lucide="plus-circle" style="color: var(--bg-base); width: 22px; height: 22px;"></i>
                        </div>
                        <h4 style="margin: 0; font-size: 1.1rem; color: var(--bg-base); font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;" data-translate="supplements-title">Suplementos Municipales</h4>
                    </div>
                    <div style="padding: 1.5rem 2rem; background: var(--bg-base);">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
                                <span style="color: var(--text-muted); font-size: 0.95rem;" data-translate="supp-train">Estación de Tren<sup>1</sup></span>
                                <strong style="color: var(--text-main); font-size: 1.05rem;">0,82 €</strong>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
                                <span style="color: var(--text-muted); font-size: 0.95rem;" data-translate="supp-luggage">Equipaje grande<sup>2</sup></span>
                                <strong style="color: var(--text-main); font-size: 1.05rem;">0,51 €</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="source-info" style="font-size: 0.85rem; color: var(--brand-cyan-light); opacity: 0.7; text-align: right; padding: 0 0.5rem; margin-top: -0.5rem; margin-bottom: 1rem; font-style: italic;">
                    FUENTE: Boletín Oficial de la Junta de Andalucía. Boletín número 10 de 16/01/2026
                </div>
                <div class="supplements-info" style="font-size: 0.95rem; color: var(--text-muted); opacity: 0.85; line-height: 1.5; margin-bottom: 3rem; padding: 0 0.5rem;" data-translate="supp-info-text">
                    <p style="margin-bottom: 0.5rem;"><strong><sup>1</sup> Estación de Tren:</strong> Se aplica exclusivamente a viajes con origen en la parada de la estación. No se cobra si tu destino es la estación.</p>
                    <p><strong><sup>2</sup> Equipaje grande:</strong> Aplicable a bultos que superen los 60 cm. Totalmente exentos: sillas de ruedas, andadores y carritos de bebé/compra.</p>
                </div>

                <div class="fare-group" style="text-align: center;">
                    <h3 class="subsection-title fare-toggle" style="margin-bottom: 1.5rem; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; user-select: none; color: var(--brand-cyan); font-size: 1.1rem; border: 1px solid rgba(6, 182, 212, 0.3); padding: 0.6rem 1.2rem; border-radius: 9999px; transition: background 0.3s, border-color 0.3s;" onmouseover="this.style.background='rgba(6, 182, 212, 0.1)'; this.style.borderColor='rgba(6, 182, 212, 0.6)';" onmouseout="this.style.background='transparent'; this.style.borderColor='rgba(6, 182, 212, 0.3)';">
                        <span data-translate="interurban-fares-title">Ver Tarifas Interurbanas</span>
                        <i data-lucide="chevron-down" class="fare-icon" style="transition: transform 0.3s; transform: rotate(0deg); width: 20px; height: 20px;"></i>
                    </h3>
                    <div class="fare-content" style="overflow: hidden; transition: max-height 0.4s ease; max-height: 0px;">
                        <div class="tarifas-grid single-card-mode" style="margin-top: 1rem;">
                            <!-- Tarjeta Interurbana Día -->
                            <div class="glass card tarifas-card-hover fare-card-day" style="padding: 0; overflow: hidden; display: flex; flex-direction: column; gap: 0; text-align: left; background: var(--bg-base); border: 1px solid rgba(6, 182, 212, 0.25);">
                                <div style="background: var(--brand-cyan); padding: 1.5rem 2rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; border-bottom: 1px solid rgba(15, 23, 42, 0.15);">
                                    <div style="display: flex; align-items: center; gap: 1rem;">
                                        <div style="background: rgba(15, 23, 42, 0.12); padding: 0.8rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(15, 23, 42, 0.15);">
                                            <i data-lucide="sun" style="color: var(--bg-base); width: 28px; height: 28px;"></i>
                                        </div>
                                        <div>
                                            <h4 style="margin: 0; font-size: 1.25rem; font-weight: 800; color: var(--bg-base);" data-translate="day-fare">Tarifa Diurna</h4>
                                            <p style="margin: 0.2rem 0 0 0; font-size: 0.85rem; color: rgba(15, 23, 42, 0.75); font-weight: 500;" data-translate="inter-day-fare-sub">Lunes a Viernes (6h - 22h)</p>
                                        </div>
                                    </div>
                                    <!-- Botón Toggle -->
                                    <button class="fare-toggle-btn" data-target="night" style="background: rgba(15, 23, 42, 0.08); border: 1px solid rgba(15, 23, 42, 0.15); padding: 0.4rem 0.8rem; border-radius: 9999px; display: flex; align-items: center; gap: 0.4rem; color: var(--bg-base); font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(15, 23, 42, 0.15)'" onmouseout="this.style.background='rgba(15, 23, 42, 0.08)'">
                                        <span data-translate="toggle-to-night">Ver Noche/Festivos</span>
                                        <i data-lucide="eye" style="width: 15px; height: 15px;"></i>
                                    </button>
                                </div>
                                
                                <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem; background: var(--bg-base);">
                                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
                                        <span style="color: var(--text-muted); font-weight: 500;" data-translate="min-fare">Carrera mínima</span>
                                        <strong style="color: var(--text-main); font-size: 1.1rem;">3,83 €</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
                                        <span style="color: var(--text-muted); font-weight: 500;" data-translate="flag-drop">Bajada bandera</span>
                                        <strong style="color: var(--text-main); font-size: 1.1rem;">3,66 €</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
                                        <span style="color: var(--text-muted); font-weight: 500;" data-translate="price-km">Precio kilómetro</span>
                                        <strong style="color: var(--text-main); font-size: 1.1rem;">0,71 €</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.2rem;">
                                        <span style="color: var(--text-muted); font-weight: 500;" data-translate="waiting-hour">Hora de espera</span>
                                        <strong style="color: var(--text-main); font-size: 1.1rem;">17,57 €</strong>
                                    </div>
                                </div>
                            </div>

                            <!-- Tarjeta Interurbana Noche -->
                            <div class="glass card tarifas-card-hover fare-card-night" style="padding: 0; overflow: hidden; display: none; flex-direction: column; gap: 0; text-align: left; background: var(--bg-base); border: 1px solid rgba(6, 182, 212, 0.25);">
                                <div style="background: var(--brand-cyan); padding: 1.5rem 2rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; border-bottom: 1px solid rgba(15, 23, 42, 0.15);">
                                    <div style="display: flex; align-items: center; gap: 1rem;">
                                        <div style="background: rgba(15, 23, 42, 0.12); padding: 0.8rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(15, 23, 42, 0.15);">
                                            <i data-lucide="moon" style="color: var(--bg-base); width: 28px; height: 28px;"></i>
                                        </div>
                                        <div>
                                            <h4 style="margin: 0; font-size: 1.25rem; font-weight: 800; color: var(--bg-base);" data-translate="night-fare">Tarifa Nocturna / Festivos</h4>
                                            <p style="margin: 0.2rem 0 0 0; font-size: 0.85rem; color: rgba(15, 23, 42, 0.75); font-weight: 500;" data-translate="inter-night-fare-sub">Noches y Festivos</p>
                                        </div>
                                    </div>
                                    <!-- Botón Toggle -->
                                    <button class="fare-toggle-btn" data-target="day" style="background: rgba(15, 23, 42, 0.08); border: 1px solid rgba(15, 23, 42, 0.15); padding: 0.4rem 0.8rem; border-radius: 9999px; display: flex; align-items: center; gap: 0.4rem; color: var(--bg-base); font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='rgba(15, 23, 42, 0.15)'" onmouseout="this.style.background='rgba(15, 23, 42, 0.08)'">
                                        <span data-translate="toggle-to-day">Ver Tarifa Diurna</span>
                                        <i data-lucide="eye" style="width: 15px; height: 15px;"></i>
                                    </button>
                                </div>
                                
                                <div style="padding: 2rem; display: flex; flex-direction: column; gap: 1rem; background: var(--bg-base);">
                                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
                                        <span style="color: var(--text-muted); font-weight: 500;" data-translate="min-fare">Carrera mínima</span>
                                        <strong style="color: var(--text-main); font-size: 1.1rem;">4,51 €</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
                                        <span style="color: var(--text-muted); font-weight: 500;" data-translate="flag-drop">Bajada bandera</span>
                                        <strong style="color: var(--text-main); font-size: 1.1rem;">3,60 €</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
                                        <span style="color: var(--text-muted); font-weight: 500;" data-translate="price-km">Precio kilómetro</span>
                                        <strong style="color: var(--text-main); font-size: 1.1rem;">0,82 €</strong>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.2rem;">
                                        <span style="color: var(--text-muted); font-weight: 500;" data-translate="waiting-hour">Hora de espera</span>
                                        <strong style="color: var(--text-main); font-size: 1.1rem;">20,71 €</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="source-info" style="font-size: 0.85rem; color: var(--brand-cyan-light); opacity: 0.7; text-align: right; padding: 0 0.5rem; margin-top: 1rem; margin-bottom: 2rem; font-style: italic;">
                            FUENTE: Boletín Oficial de la Junta de Andalucía. Boletín número 49 de 12/03/2026
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Dynamic style and script for single card toggle mode -->
        <style>
            .tarifas-grid.single-card-mode {
                display: flex;
                justify-content: center;
                max-width: 580px;
                margin-left: auto;
                margin-right: auto;
                width: 100%;
            }
            .tarifas-grid.single-card-mode > .glass.card {
                width: 100%;
                animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        </style>

        <script>
            const initFareToggles = () => {
                const toggleButtons = document.querySelectorAll('.fare-toggle-btn');
                toggleButtons.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const grid = btn.closest('.tarifas-grid');
                        if (!grid) return;
                        
                        const dayCard = grid.querySelector('.fare-card-day');
                        const nightCard = grid.querySelector('.fare-card-night');
                        const target = btn.getAttribute('data-target');
                        
                        if (target === 'night') {
                            if (dayCard) dayCard.style.setProperty('display', 'none', 'important');
                            if (nightCard) {
                                nightCard.style.setProperty('display', 'flex', 'important');
                                nightCard.style.animation = 'none';
                                nightCard.offsetHeight; // trigger reflow
                                nightCard.style.animation = '';
                            }
                        } else if (target === 'day') {
                            if (nightCard) nightCard.style.setProperty('display', 'none', 'important');
                            if (dayCard) {
                                dayCard.style.setProperty('display', 'flex', 'important');
                                dayCard.style.animation = 'none';
                                dayCard.offsetHeight; // trigger reflow
                                dayCard.style.animation = '';
                            }
                        }
                    });
                });
            };

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initFareToggles);
            } else {
                initFareToggles();
            }
        </script>`;

const newContent = content.substring(0, startIndex) + replacement;
fs.writeFileSync(targetFile, newContent, 'utf8');
console.log('Successfully updated Tarifas.astro!');
