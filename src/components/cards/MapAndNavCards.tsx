import { h, Fragment } from 'preact';
import type { CardData } from './types';
import { CardWrapper } from './CardShared';

const formatContent = (text: string) => {
    let html = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    html = html.replace(/\*(.*?)\*/g, '<i>$1</i>');
    html = html.replace(/\n/g, '<br>');
    return { __html: html };
};

export const MapCard = ({ data, msgId }: { data: CardData; msgId: string }) => {
    if (data.lat && data.lon) {
        return (
            <div style={{ width: '100%', maxWidth: '100%', alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.content && <span className="bubble" dangerouslySetInnerHTML={formatContent(data.content)} />}
                <button 
                    className="btn btn-primary" 
                    onClick={() => { (window as any).openFullscreenMap(String(data.lat), String(data.lon), msgId); }}
                    style={{ background: 'var(--primary-color)', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
                >
                    <div style={{ background: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>📍</div> 
                    Ver {data.locationTitle || data.title || 'ubicación'} en mapa
                </button>
            </div>
        );
    }
    return data.content ? <span className="bubble" dangerouslySetInnerHTML={formatContent(data.content)} /> : null;
};

export const NavigationCard = ({ data }: { data: CardData }) => {
    return (
        <div style={{ width: '100%', maxWidth: '85%', alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {data.content && <span className="bubble" dangerouslySetInnerHTML={formatContent(data.content)} />}
            {data.lat && data.lon && (
                <div className="card mt-sm" style={{ border: '2px solid var(--primary-color)', borderRadius: '12px', overflow: 'hidden' }}>
                    <div className="card-body" style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0f2fe', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                🧭
                            </div>
                            <div>
                                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: 'var(--text-color)' }}>Navegación Activa</h3>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Hacia {data.stopName || 'Destino'}</p>
                            </div>
                        </div>
                        <button 
                            className="btn btn-primary" 
                            style={{ width: '100%', background: 'var(--primary-color)', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: '600', cursor: 'pointer' }}
                            onClick={() => { (window as any).startLiveNavigation(data.lat, data.lon, data.stopName || 'Destino'); }}
                        >
                            Ver en Mapa Completo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
