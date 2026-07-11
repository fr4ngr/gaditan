import { h } from 'preact';
import type { CardData } from './types';
import { CardWrapper, CardButton } from './CardShared';

export const ProductCard = ({ data }: { data: CardData }) => {
    return (
        <CardWrapper data={data}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                {data.imageUrl ? (
                    <img src={data.imageUrl} alt={data.title || 'Producto'} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                ) : (
                    <div style={{ width: '100px', height: '100px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '1.5rem', borderRight: '1px solid var(--border-color)' }}>
                        📦
                    </div>
                )}
                <div className="card-body" style={{ flex: 1, padding: '16px' }}>
                    {data.badge && (
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--primary-color)', letterSpacing: '0.5px', marginBottom: '4px' }}>
                            {data.badge}
                        </div>
                    )}
                    <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-color)', fontSize: '1.1rem', fontWeight: '700' }}>{data.title}</h4>
                    {/* Assuming data has price/oldPrice via some generic fields or extended CardData, but let's ignore for now or add them */}
                    <CardButton data={data} />
                </div>
            </div>
        </CardWrapper>
    );
};
