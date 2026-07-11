import { h, render } from 'preact';
import type { CardData } from './types';
import { HeroCard } from './HeroCard';
import { ListCard } from './ListCard';
import { BusinessCard } from './BusinessCard';
import { ArticleCard } from './ArticleCard';
import { AlertCard } from './AlertCard';
import { ProductCard } from './ProductCard';
import { ProfileCard } from './ProfileCard';
import { MapCard, NavigationCard } from './MapAndNavCards';

const GalleryCard = ({ data }: { data: CardData }) => {
    return (
        <div style={{ width: '100%', maxWidth: '100%', alignSelf: 'flex-start', marginBottom: '0.5rem' }}>
            {data.content && <span className="bubble" dangerouslySetInnerHTML={{ __html: data.content }} />}
            <div className="card-wrapper" style={{ animation: 'slideIn 0.3s ease-out', marginTop: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'row', overflowX: 'auto', scrollSnapType: 'x mandatory', gap: '8px', paddingBottom: '4px' }}>
                    {data.imageUrls && data.imageUrls.length > 0 ? (
                        data.imageUrls.map((url, i) => (
                            <div key={i} style={{ flex: '0 0 85%', scrollSnapAlign: 'center', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                                <img src={url} alt="Galería" style={{ width: '100%', height: '200px', objectFit: 'cover', display: 'block' }} loading="lazy" />
                            </div>
                        ))
                    ) : (
                        [1, 2].map((i) => (
                            <div key={i} style={{ flex: '0 0 85%', scrollSnapAlign: 'center', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'linear-gradient(45deg, #f1f5f9, #e2e8f0)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                                <span style={{ fontSize: '2rem', opacity: 0.5 }}>📸</span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export const renderCardDOM = (data: CardData, msgId: string): HTMLElement => {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'contents'; // So the wrapper doesn't break flex layouts if used

    let Component;
    switch (data.cardType) {
        case 'HeroCard': Component = HeroCard; break;
        case 'ListCard': Component = ListCard; break;
        case 'BusinessCard': Component = BusinessCard; break;
        case 'ArticleCard': Component = ArticleCard; break;
        case 'AlertCard': Component = AlertCard; break;
        case 'ProductCard': Component = ProductCard; break;
        case 'ProfileCard': Component = ProfileCard; break;
        case 'MapCard': Component = MapCard; break;
        case 'NavigationCard': Component = NavigationCard; break;
        case 'GalleryCard': Component = GalleryCard; break;
        default:
            // Fallback for unknown card types or plain text bubble
            const formatContent = (text: string) => {
                let html = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
                html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
                html = html.replace(/\*(.*?)\*/g, '<i>$1</i>');
                html = html.replace(/\n/g, '<br>');
                return { __html: html };
            };
            Component = ({ data }: { data: CardData }) => (
                <div style={{ width: '100%', maxWidth: '100%', alignSelf: 'flex-start' }}>
                    {data.content && <span className="bubble" dangerouslySetInnerHTML={formatContent(data.content)} />}
                </div>
            );
            break;
    }

    render(<Component data={data} msgId={msgId} />, wrapper);
    
    // Add suggested blocks natively as DOM elements if they exist
    if (data.suggestedBlocks && data.suggestedBlocks.length > 0) {
        const blocksContainer = document.createElement('div');
        blocksContainer.className = 'suggested-blocks-container';
        
        data.suggestedBlocks.forEach(block => {
            const btn = document.createElement('button');
            btn.className = 'suggested-btn';
            btn.textContent = block;
            btn.onclick = () => {
                if ((window as any).sendToAI) {
                    (window as any).sendToAI(block, false, 'click');
                }
            };
            blocksContainer.appendChild(btn);
        });
        
        wrapper.appendChild(blocksContainer);
    }

    return wrapper;
};
