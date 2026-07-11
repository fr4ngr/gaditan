import { h } from 'preact';
import type { CardData } from './types';
import { CardWrapper, CardButton } from './CardShared';
import { IconPin } from '../Icons';

export const ListCard = ({ data }: { data: CardData }) => {
    return (
        <CardWrapper data={data}>
            <div className="card-body" style={{ padding: '16px' }}>
                {data.badge && (
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--primary-color)', letterSpacing: '0.5px', marginBottom: '4px' }}>
                        {data.badge}
                    </div>
                )}
                <h3 style={{ margin: '0 0 12px 0', color: 'var(--text-color)', fontSize: '1.25rem', fontWeight: '700' }}>{data.title}</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {data.listItems && data.listItems.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < data.listItems!.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                            <div style={{ width: '40px', display: 'flex', justifyContent: 'center', flexShrink: 0, color: 'var(--primary-color)' }}>
                                <IconPin size={24} color="currentColor" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '600', color: 'var(--text-color)', fontSize: '0.95rem' }}>{item.title}</div>
                                {item.subtitle && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{item.subtitle}</div>}
                            </div>
                        </div>
                    ))}
                </div>
                
                <CardButton data={data} />
            </div>
        </CardWrapper>
    );
};
