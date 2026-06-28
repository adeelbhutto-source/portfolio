'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import AppLayout from '@/components/AppLayout';
import { PageHero, Card, Btn, Avatar, SectionHeader } from '@/components/V3';
import { useToast } from '@/components/ui';

const COLORS = [
  '#5C5CD8','#9D58D8','#D85C82','#D8504A','#E08D2E','#E5B341',
  '#3D9C5B','#3DA89C','#46A4D8','#3D7BD8','#6F7B85','#1A2128',
];

export default function Profile() {
  const { user, familyMember, refreshMe } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user?.name ?? '');
  const [savingName, setSavingName] = useState(false);
  const [selectedColor, setSelectedColor] = useState(familyMember?.color ?? '#D85C82');
  const [savingColor, setSavingColor] = useState(false);

  const hasColorChanged = selectedColor !== familyMember?.color;
  const initials = (name || user?.name || '?').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || name.trim() === user?.name) return;
    setSavingName(true);
    try {
      await apiFetch('/account/profile', { method: 'PATCH', body: JSON.stringify({ name: name.trim() }) });
      await refreshMe();
      toast.success('Name updated!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update name');
    } finally { setSavingName(false); }
  }

  async function handleSaveColor() {
    if (!hasColorChanged) return;
    setSavingColor(true);
    try {
      await apiFetch('/account/color', { method: 'PATCH', body: JSON.stringify({ color: selectedColor }) });
      await refreshMe();
      toast.success('Color updated!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update color');
    } finally { setSavingColor(false); }
  }

  return (
    <AppLayout>
      <style>{`
        @media (max-width: 640px) {
          .prof-layout { grid-template-columns: 1fr !important; }
          .prof-color-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>
      <PageHero
        eyebrow="Your profile · how your co-parent sees you"
        title={<>How you <em>appear.</em></>}
        subtitle="Display name, photo, accent color. Used on messages, calendar events, and expense submissions so you're always easy to tell apart."
        size="sm"
      />

      <div className="prof-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 18 }}>

        {/* LEFT — preview */}
        <Card style={{ textAlign: 'center', padding: 36 }}>
          <div style={{ margin: '0 auto', width: 100, height: 100, borderRadius: 999, background: selectedColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontFamily: 'var(--serif)', color: '#F1ECDF', fontWeight: 500 }}>
            {initials}
          </div>
          <div className="pcp-display" style={{ fontSize: 28, letterSpacing: '-0.02em', marginTop: 18 }}>{name || user?.name}</div>
          <div style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginTop: 4 }}>{user?.email}</div>

          <div style={{ marginTop: 18, padding: '8px 14px', background: selectedColor + '22', borderRadius: 999, display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, letterSpacing: '.06em', color: selectedColor }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: selectedColor }}/>
            YOUR COLOR IN MESSAGES + CALENDAR
          </div>

          {/* Preview */}
          <div style={{ marginTop: 28, padding: 16, background: 'var(--bg-soft)', borderRadius: 12, textAlign: 'left' }}>
            <div className="pcp-eyebrow" style={{ color: 'var(--ink-mute)', marginBottom: 10 }}>Preview</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
              <Avatar name={name || user?.name || '?'} size={28} tone="pink"/>
              <div style={{ padding: '8px 12px', background: selectedColor + '22', color: selectedColor, borderRadius: '14px 14px 14px 4px', fontSize: 13 }}>
                &ldquo;Can we shift Saturday&apos;s handover by 30 min?&rdquo;
              </div>
            </div>
            <div style={{ marginTop: 8, padding: '8px 10px', background: '#FFFEFA', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 22, background: selectedColor, borderRadius: 3 }}/>
                <span>Handover · 5pm</span>
              </div>
              <span className="pcp-mono" style={{ color: 'var(--ink-mute)', fontSize: 11 }}>SAT</span>
            </div>
          </div>
        </Card>

        {/* RIGHT — controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Name */}
          <Card>
            <SectionHeader eyebrow="Display name" title="What your co-parent sees"/>
            <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginBottom: 12 }}>
              Visible to the other parent and any caregivers you&apos;ve granted access.
            </p>
            <form onSubmit={handleSaveName} style={{ display: 'flex', gap: 10 }}>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Your name" minLength={2} maxLength={50}
                style={{ flex: 1, padding: '13px 16px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--sans)', outline: 'none' }}
              />
              <Btn type="submit" kind="primary" big disabled={savingName || !name.trim() || name.trim() === user?.name}>
                {savingName ? '…' : 'Save'}
              </Btn>
            </form>
          </Card>

          {/* Color */}
          <Card>
            <SectionHeader eyebrow="Your color" title="Pick something distinct"/>
            <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginBottom: 14 }}>
              Appears on your messages, calendar events and expenses so both parents can tell you apart at a glance.
            </p>
            <div className="prof-color-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginBottom: 16 }}>
              {COLORS.map(c => (
                <button key={c} onClick={() => setSelectedColor(c)} type="button"
                  style={{ width: '100%', aspectRatio: '1', borderRadius: 12, background: c, border: selectedColor === c ? `3px solid var(--ink)` : '3px solid transparent', cursor: 'pointer', transition: 'transform .1s', transform: selectedColor === c ? 'scale(1.12)' : 'none' }}
                />
              ))}
            </div>
            <Btn kind="primary" big onClick={handleSaveColor} disabled={savingColor || !hasColorChanged}>
              {savingColor ? 'Saving…' : hasColorChanged ? 'Save color' : 'Color saved ✓'}
            </Btn>
          </Card>

          {/* Photo placeholder */}
          <Card>
            <SectionHeader eyebrow="Profile photo" title="Upload a photo"/>
            <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginBottom: 14 }}>
              Optional. Used as your avatar across the app.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <Btn kind="outline">Upload photo</Btn>
              <Btn kind="ghost">Remove</Btn>
            </div>
          </Card>

        </div>
      </div>
    </AppLayout>
  );
}
