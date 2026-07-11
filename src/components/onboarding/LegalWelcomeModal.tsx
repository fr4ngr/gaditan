import { h, Component } from 'preact';
import { useState, useEffect } from 'preact/hooks';

interface OnboardingProps {
    onComplete: (profile: string) => void;
}

export const LegalWelcomeModal = ({ onComplete }: OnboardingProps) => {
    const [profile, setProfile] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const accepted = localStorage.getItem('gaditan_legal_accepted');
        if (!accepted) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        if (!profile) return;
        localStorage.setItem('gaditan_profile', profile);
        localStorage.setItem('gaditan_legal_accepted', 'true');
        onComplete && onComplete(profile);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: 'var(--bg-color, #ffffff)',
                borderRadius: '24px',
                padding: '32px 24px',
                maxWidth: '400px',
                width: '100%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                animation: 'slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ margin: '0 0 8px 0', fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary-color)' }}>Gaditan</h1>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem' }}>Tu plataforma para vivir Cádiz.</p>
                </div>

                <div>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: 'var(--text-color)' }}>¿Cómo vas a usar la app?</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {[
                            { id: 'turista', icon: '🏖️', title: 'Turista', desc: 'Quiero descubrir la provincia' },
                            { id: 'gaditano', icon: '🎭', title: 'Gaditano', desc: 'Vivo aquí y quiero planes locales' },
                            { id: 'negocio', icon: '🏪', title: 'Negocio Local', desc: 'Quiero promocionar mi negocio' }
                        ].map(p => (
                            <button 
                                key={p.id}
                                onClick={() => setProfile(p.id)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '16px',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    border: `2px solid ${profile === p.id ? 'var(--primary-color)' : 'var(--border-color)'}`,
                                    background: profile === p.id ? '#eff6ff' : 'transparent',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ fontSize: '1.8rem' }}>{p.icon}</div>
                                <div>
                                    <div style={{ fontWeight: '700', color: 'var(--text-color)', fontSize: '1.05rem' }}>{p.title}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.desc}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <strong>Privacidad y Datos:</strong> Para ofrecerte la mejor experiencia, Gaditan utiliza tu <strong>ubicación GPS</strong> (exclusivamente para rutas y distancias) y guarda tu sesión localmente de forma anónima (sin cookies de rastreo de terceros). Al continuar, aceptas nuestros términos de servicio.
                </div>

                <button 
                    onClick={handleAccept}
                    disabled={!profile}
                    style={{
                        padding: '16px',
                        background: profile ? 'var(--primary-color)' : '#94a3b8',
                        color: 'white',
                        border: 'none',
                        borderRadius: '16px',
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        cursor: profile ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s'
                    }}
                >
                    Aceptar y Comenzar
                </button>
            </div>
        </div>
    );
};
