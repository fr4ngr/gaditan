import { h } from 'preact';
import type { CardData } from './types';
import { CardWrapper, CardButton } from './CardShared';

export const ArticleCard = ({ data }: { data: CardData }) => {
    return (
        <CardWrapper data={data} style={{ borderLeft: '4px solid var(--primary-color)' }}>
            <div className="card-body" style={{ padding: '16px' }}>
                {data.badge && (
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--primary-color)', letterSpacing: '0.5px', marginBottom: '4px' }}>
                        {data.badge}
                    </div>
                )}
                <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-color)', fontSize: '1.15rem', fontWeight: '700' }}>
                    {data.title}
                </h4>
                <p className="text-muted" style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                    {data.subtitle}
                </p>
                <CardButton data={data} />
            </div>
        </CardWrapper>
    );
};
