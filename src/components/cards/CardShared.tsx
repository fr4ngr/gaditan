import { h } from 'preact';
import type { CardData } from './types';

// Helper to escape and format markdown (bold, italics, newlines) safely
const formatContent = (text: string) => {
    // Very basic markdown to HTML for bold/italics. 
    // In a real app we'd use marked + DOMPurify, but for now we'll do simple replacement safely.
    let html = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    html = html.replace(/\*(.*?)\*/g, '<i>$1</i>');
    html = html.replace(/\n/g, '<br>');
    return { __html: html };
};

export const CardWrapper = ({ data, children, style }: { data: CardData; children: any; style?: any }) => {
    return (
        <div 
            style={{ 
                width: '100%', 
                maxWidth: '100%', 
                alignSelf: 'flex-start', 
                marginBottom: '0.5rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px',
                animation: 'slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                opacity: 0,
                transform: 'translateY(10px)'
            }}
        >
            {data.content && (
                <span className="bubble" style={{ borderBottomLeftRadius: '4px' }} dangerouslySetInnerHTML={formatContent(data.content)} />
            )}
            <div className="card" style={{ ...style, marginTop: '8px', overflow: 'hidden', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                {children}
            </div>
            <style dangerouslySetInnerHTML={{__html: `@keyframes slideUpFade { to { opacity: 1; transform: translateY(0); } }`}} />
        </div>
    );
};

export const CardButton = ({ data }: { data: CardData }) => {
    if (!data.buttonText) return null;

    const buttonStyle = {
        width: '100%',
        marginTop: '12px',
        background: 'var(--primary-color)',
        color: '#ffffff',
        border: 'none',
        padding: '10px 16px',
        borderRadius: '12px', // Google likes rounded corners
        fontWeight: '600',
        fontSize: '14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        textDecoration: 'none',
        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.25)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
    };

    if (data.buttonUrl) {
        // Prevent XSS by validating the URL scheme
        const isValidUrl = /^(https?:\/\/|mailto:|tel:|\/)/i.test(data.buttonUrl);
        if (isValidUrl) {
            return (
                <a href={data.buttonUrl} target="_blank" rel="noopener noreferrer" style={buttonStyle} onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')} onMouseOut={(e) => (e.currentTarget.style.transform = 'none')} onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')} onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}>
                    {data.buttonText}
                </a>
            );
        }
    }

    // Since window.sendToAI is defined globally, we can call it directly
    const onClick = () => {
        if (data.buttonAction && (window as any).sendToAI) {
            (window as any).sendToAI(data.buttonAction);
        }
    };

    return (
        <button onClick={onClick} style={buttonStyle} onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')} onMouseOut={(e) => (e.currentTarget.style.transform = 'none')} onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')} onMouseUp={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}>
            {data.buttonText}
        </button>
    );
};
