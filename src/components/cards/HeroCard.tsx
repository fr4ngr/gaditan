import { h } from 'preact';
import type { CardData } from './types';
import { CardWrapper, CardButton } from './CardShared';

export const HeroCard = ({ data }: { data: CardData }) => {
    const defaultImg = 'linear-gradient(45deg, #f1f5f9, #e2e8f0)';
    
    return (
        <CardWrapper data={data}>
            {data.imageUrl ? (
                <img src={data.imageUrl} alt={data.title || 'Imagen'} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
            ) : (
                <div style={{ width: '100%', height: '180px', background: defaultImg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '2.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    🖼️
                </div>
            )}
            
            <div className="card-body" style={{ padding: '16px' }}>
                {data.badge && (
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--primary-color)', letterSpacing: '0.5px', marginBottom: '4px' }}>
                        {data.badge}
                    </div>
                )}
                <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-color)', fontSize: '1.25rem', fontWeight: '700' }}>{data.title}</h3>
                {data.subtitle && <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{data.subtitle}</p>}
                <CardButton data={data} />
            </div>
        </CardWrapper>
    );
};
