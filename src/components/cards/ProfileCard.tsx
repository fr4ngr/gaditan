import { h } from 'preact';
import type { CardData } from './types';
import { CardWrapper, CardButton } from './CardShared';

export const ProfileCard = ({ data }: { data: CardData }) => {
    return (
        <CardWrapper data={data}>
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}>
                {data.imageUrl ? (
                    <img src={data.imageUrl} alt={data.contactName || data.title || 'Perfil'} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-color)' }} />
                ) : (
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                        👤
                    </div>
                )}
                <div style={{ flex: 1 }}>
                    {data.badge && (
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--primary-color)', letterSpacing: '0.5px', marginBottom: '4px' }}>
                            {data.badge}
                        </div>
                    )}
                    <h3 style={{ margin: '0 0 4px 0', color: 'var(--text-color)', fontSize: '1.15rem', fontWeight: '700' }}>
                        {data.contactName || data.title}
                    </h3>
                    {data.subtitle && (
                        <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            {data.subtitle}
                        </p>
                    )}
                </div>
            </div>
            {data.buttonText && (
                <div style={{ padding: '0 16px 16px 16px' }}>
                    <CardButton data={data} />
                </div>
            )}
        </CardWrapper>
    );
};
