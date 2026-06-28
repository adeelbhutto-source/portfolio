import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'PeaceCoParent — Co-parenting without the conflict';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          display: 'flex',
          background: '#14301F',
          fontFamily: 'Georgia, serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: -100, right: -100,
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(199,106,63,0.2) 0%, transparent 65%)',
          display: 'flex',
        }}/>

        {/* Left: dark content */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: '64px 72px',
          position: 'relative',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 13,
              background: '#F1ECDF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, color: '#14301F',
            }}>P</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#F1ECDF', fontFamily: 'system-ui, sans-serif' }}>PeaceCoParent</div>
          </div>

          {/* Headline */}
          <div>
            <div style={{ fontSize: 13, color: '#E89968', fontFamily: 'system-ui, sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 20 }}>
              The moment before send
            </div>
            <div style={{ fontSize: 58, color: '#F1ECDF', lineHeight: 1.0, marginBottom: 24 }}>
              Catch the message<br/>
              <span style={{ color: '#E89968', fontStyle: 'italic' }}>before you regret it.</span>
            </div>
            <div style={{ fontSize: 18, color: 'rgba(241,236,223,0.6)', fontFamily: 'system-ui, sans-serif', lineHeight: 1.5 }}>
              coaches your drafts, logs everything court-ready,<br/>shared calendar — $14/mo, both parents.
            </div>
          </div>

          {/* Pills */}
          <div style={{ display: 'flex', gap: 12 }}>
            {['Coach', 'Court-ready logs', '$14 · both parents'].map(label => (
              <div key={label} style={{
                background: 'rgba(241,236,223,0.08)',
                border: '1px solid rgba(241,236,223,0.15)',
                borderRadius: 999, padding: '8px 18px',
                fontSize: 14, color: '#F1ECDF',
                fontFamily: 'system-ui, sans-serif', fontWeight: 600,
              }}>{label}</div>
            ))}
          </div>
        </div>

        {/* Right: message cards */}
        <div style={{
          width: 420, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '64px 56px 64px 0', gap: 16,
        }}>
          {/* Not sent */}
          <div style={{
            background: 'rgba(255,255,250,0.06)', border: '1px solid rgba(241,236,223,0.12)',
            borderRadius: 18, padding: '20px 22px', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ fontSize: 10, color: '#B84B2C', fontFamily: 'system-ui, sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>NOT SENT</div>
            <div style={{ fontSize: 15, color: 'rgba(241,236,223,0.5)', fontStyle: 'italic', lineHeight: 1.5 }}>
              &ldquo;You ALWAYS show up late. The kids noticed AGAIN.&rdquo;
            </div>
          </div>

          {/* Arrow */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#C76A3F', color: '#F1ECDF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>→</div>
          </div>

          {/* Sent */}
          <div style={{
            background: 'rgba(30,63,44,0.6)', border: '1px solid rgba(140,200,150,0.25)',
            borderRadius: 18, padding: '20px 22px', display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ fontSize: 10, color: '#6BA878', fontFamily: 'system-ui, sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>SENT</div>
            <div style={{ fontSize: 15, color: '#D5E8D8', lineHeight: 1.5 }}>
              &ldquo;Pickup was 20 min late today. Could we agree on a 10-min buffer?&rdquo;
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
