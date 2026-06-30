# PeaceCoParent – Backend & Infrastruktur-arkitektur

**Live:** [peacecoparent.com](https://peacecoparent.com)

## Oversikt

PeaceCoParent er en SaaS-plattform designet for å forenkle kommunikasjon og organisering for foreldre som samarbeider om barn. Som ansvarlig arkitekt og utvikler har jeg designet systemet med fokus på ytelse, sikre API-integrasjoner og skalerbar infrastruktur.

## Utviklingsfilosofi: AI-støttet arkitektur

Jeg opererer som teknisk arkitekt, der jeg benytter AI-agenter for selve implementeringen og kodeproduksjonen. Ved å ha full kontroll på systemarkitektur, API-design og infrastruktur, sikrer jeg en utviklingstakt som er betydelig raskere enn tradisjonell manuell koding, samtidig som jeg opprettholder en robust og produksjonsklar kvalitet.

## Teknisk stack & infrastruktur

- **Backend & API:** Designet for høy tilgjengelighet og effektiv ressursstyring.
- **Database:** Strukturert for dataintegritet og rask respons.
- **Deployment:** Infrastruktur administrert gjennom automatiserte pipelines for sømløs CI/CD.
- **Infrastruktur:** Selvstyrt hosting og deployment, uavhengig av komplekse, låste plattformtjenester.

## Nøkkelkompetanse & implementasjon

- **API-arkitektur:** Modulært designet for rask utrulling av nye funksjonaliteter.
- **Sikkerhet & pålitelighet:** Implementert gjennom solide arkitektoniske mønstre og robust autentisering.
- **Autonom skalering:** Optimalisert for sky-native deployment.

## Nåværende fokus

Jeg jobber for tiden med å videreutvikle backend-tjenestene og optimalisere infrastrukturen for å legge til rette for fremtidige integrasjoner av AI-drevne funksjoner.

## Struktur

- `frontend-next/` — Next.js (hovedfrontend)
- `backend/` — Node.js + Express + PostgreSQL
- `mobile/` — Expo-app

## Kjøre lokalt

```bash
cd backend && npm install && cp .env.example .env
cd ../frontend-next && npm install && cp .env.example .env.local
```

Start backend (`npm run dev`) og frontend (`npm run dev`). Fyll inn egne verdier i `.env`-filene.