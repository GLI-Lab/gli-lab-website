import { ImageResponse } from 'next/og'
import { getAlumniProfiles } from '@/data/loaders/profileLoader'
import { META } from '@/lib/GetMetadata'

export const runtime = 'nodejs'

function toAbsoluteUrl(url: string | undefined): string | undefined {
  if (!url) return undefined
  if (/^https?:\/\//i.test(url)) return url
  const base = META.url.replace(/\/$/, '')
  const path = url.startsWith('/') ? url : `/${url}`
  return `${base}${path}`
}

function createCard({ photoUrl, nameEn, nameKo }: { photoUrl: string; nameEn?: string; nameKo?: string }) {
  return (
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
      }}
    >
      <div
        style={{
          width: 1130,
          height: 580,
          display: 'flex',
          borderRadius: 24,
          background: '#fff',
          boxShadow: '0 30px 100px rgba(0,0,0,0.35)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: 520,
            height: '100%',
            backgroundColor: '#f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={photoUrl}
            width={520}
            height={580}
            style={{ objectFit: 'contain' }}
          />
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: 36,
            justifyContent: 'center',
            color: '#0f172a',
          }}
        >
          <div style={{ fontSize: 58, fontWeight: 700, lineHeight: 1.1 }}>{nameEn || 'GLI Lab Alumni'}</div>
          {nameKo && (
            <div style={{ fontSize: 46, marginTop: 12, color: '#334155' }}>{nameKo}</div>
          )}
          <div style={{ marginTop: 28, fontSize: 30, color: '#475569' }}>
            Graph & Language Intelligence Lab
          </div>
        </div>
      </div>
    </div>
  )
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const profiles = await getAlumniProfiles()
    const resolvedParams = await params
    const rawId = resolvedParams.id || ''
    const id = decodeURIComponent(rawId.replace(/\+/g, ' '))
    console.log('[OG][alumni] params.id:', rawId, 'decoded:', id)
    
    const profile = profiles.find((p: any) => p.id === id)
    const photoUrl = toAbsoluteUrl(profile?.photo?.[0])
    
    console.log('[OG][alumni] resolved:', { id, name_en: profile?.name_en, photoUrl })

    if (photoUrl && profile) {
      return new ImageResponse(
        createCard({ photoUrl, nameEn: profile.name_en, nameKo: profile.name_ko }),
        { width: 1200, height: 630 }
      )
    }
  } catch (e) {
    console.log('[OG][alumni] error:', e)
  }

  // Fallback
  console.log('[OG][alumni] fallback image used')
  return new ImageResponse(
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        color: '#fff',
        fontSize: 48,
        fontWeight: 700,
      }}
    >
      GLI Lab
    </div>,
    { width: 1200, height: 630 }
  )
}
