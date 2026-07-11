import { initMapManager } from './mapManager';
import 'leaflet/dist/leaflet.css';
import './taxi-map.css';

export class TaxiMap extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <div class="taxi-map-wrapper">
        <div class="map-container" style="position: relative; width: 100%; height: 100%;">
            <div id="map"></div>
            <div class="taxi-toggle-overlay">
                <div class="taxi-toggle-wrapper">
                    <button class="taxi-scope-pill active" data-filter="all">Todas</button>
                    <button class="taxi-scope-pill" data-filter="nearest">Más cerca</button>
                </div>
            </div>
            
            <!-- Bottom Sheet Card -->
            <div id="bottom-sheet-card" class="minimized">
                <div class="bottom-sheet-handle"></div>
                <div class="bottom-sheet-content">
                    <!-- Info de parada se inyectará aquí -->
                </div>
            </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      initMapManager(this);
    }, 0);
  }
}

customElements.define('taxi-map', TaxiMap);
