import { h } from 'preact';
import type { CardData } from './types';
import { CardWrapper, CardButton } from './CardShared';
import { IconInfo } from '../Icons';

export const AlertCard = ({ data }: { data: CardData }) => {
    return (
        <CardWrapper data={data} style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeeba' }}>
            <div className="card-body" style={{ padding: '16px' }}>
                <div style={{ color: '#856404', fontWeight: 'bold', marginBottom: '4px', fontSize: '0.85rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IconInfo size={16} color="#856404" /> {data.badge || 'Aviso'}
                </div>
                <h3 style={{ margin: '0 0 8px 0', color: '#856404', fontSize: '1.25rem', fontWeight: '700' }}>
                    {data.title}
                </h3>
                <p style={{ margin: 0, color: '#856404', fontSize: '0.95rem', lineHeight: 1.4 }}>
                    {data.subtitle}
                </p>
                <CardButton data={data} />
            </div>
        </CardWrapper>
    );
};
