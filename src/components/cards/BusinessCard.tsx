import { h } from 'preact';
import type { CardData } from './types';
import { CardWrapper, CardButton } from './CardShared';

export const BusinessCard = ({ data }: { data: CardData }) => {
    return (
        <CardWrapper data={data}>
            <div className="card-body" style={{ padding: '16px' }}>
                {data.badge && (
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--primary-color)', letterSpacing: '0.5px', marginBottom: '4px' }}>
                        {data.badge}
                    </div>
                )}
                <h3 style={{ margin: '0 0 4px 0', color: 'var(--text-color)', fontSize: '1.25rem', fontWeight: '700' }}>
                    {data.contactName || data.title}
                </h3>
                {data.subtitle && (
                    <p className="text-muted" style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {data.subtitle}
                    </p>
                )}
                
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                    {data.phoneNumber && (
                        <a href={`tel:${data.phoneNumber.replace(/\s+/g, '')}`} className="btn btn-success" style={{ flex: 1, minWidth: '100px', padding: '10px 8px', textAlign: 'center', textDecoration: 'none', background: '#16a34a', color: 'white', borderRadius: '12px', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                            Llamar
                        </a>
                    )}
                    {data.whatsappNumber && (
                        <a href={`https://wa.me/${data.whatsappNumber.replace(/\s+/g, '').replace('+', '')}`} className="btn" style={{ flex: 1, minWidth: '100px', background: '#20873c', color: 'white', padding: '10px 8px', textAlign: 'center', textDecoration: 'none', borderRadius: '12px', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                            WhatsApp
                        </a>
                    )}
                    {data.website && (
                        <a href={data.website} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ flex: 1, minWidth: '100px', padding: '10px 8px', textAlign: 'center', textDecoration: 'none', background: 'var(--primary-color)', color: 'white', borderRadius: '12px', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                            Web
                        </a>
                    )}
                </div>
                
                <CardButton data={data} />
            </div>
        </CardWrapper>
    );
};
