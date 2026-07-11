import os

file_path = r"c:\Users\frn\Documents\cadiz.taxi\src\components\Reserva.astro"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

target = """                <h2 class="section-title" data-translate="booking-title" itemprop="name">Reserva tu Taxi</h2>
                
                <p class="section-subtitle">Asegura tu viaje con antelación rellenando este breve formulario</p>"""

replacement = """                <div style="display: flex; justify-content: center; margin-bottom: 2.5rem; width: 100%;">
                    <div class="glass card" style="padding: 0; overflow: hidden; gap: 0; display: flex; flex-direction: row; align-items: stretch; max-width: 550px; width: 100%; border-radius: 24px;">
                        <div style="background: var(--brand-cyan); display: flex; align-items: center; justify-content: center; width: 130px; flex-shrink: 0; padding: 1rem;">
                            <lottie-player src="/reserva-lottie.json" background="transparent" speed="1" style="width: 85px; height: 85px;" loop autoplay></lottie-player>
                        </div>
                        <div style="background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%); padding: 1.5rem 2rem; display: flex; flex-direction: column; justify-content: center; flex: 1; text-align: left;">
                            <h2 class="section-title" itemprop="name" style="margin: 0; font-size: 1.7rem; line-height: 1.2; padding-bottom: 0.3rem; color: var(--bg-base);">
                                <span data-translate="booking-title">Reserva tu Taxi</span>
                            </h2>
                            <p class="section-subtitle" style="color: var(--text-muted); margin: 0; font-size: 1.05rem; line-height: 1.4;">Asegura tu viaje con antelación rellenando este breve formulario</p>
                        </div>
                    </div>
                </div>"""

if target in content:
    content = content.replace(target, replacement)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Replaced successfully")
else:
    print("Target not found")
