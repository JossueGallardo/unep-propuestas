# UNEP Propuestas

Aplicación institucional para recibir propuestas privadas de la comunidad novembrina y gestionarlas desde un panel administrativo. La interfaz pública permite envíos anónimos o identificados; el panel ofrece búsqueda, filtros, estados y exportación CSV.

## Stack

- Next.js 16.2.10, React 19.2.7 y TypeScript estricto
- Tailwind CSS 4 y componentes shadcn/ui
- Supabase Postgres, Auth, RLS y SSR
- Zod, React Hook Form y Lucide
- Vitest, Playwright y axe
- Vercel y GitHub Actions con Node 24.x

## Desarrollo local

1. Instala Node.js 24.x.
2. Copia `.env.example` como `.env.local` y completa las variables.
3. Ejecuta `npm ci` y `npm run dev`.
4. Abre `http://127.0.0.1:3000`.

En PowerShell con ejecución de scripts restringida, usa `npm.cmd` y `npx.cmd`.

## Variables

| Variable                               | Uso                                              |
| -------------------------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`             | URL pública del proyecto Supabase                |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clave publicable; nunca `service_role`           |
| `NEXT_PUBLIC_SITE_URL`                 | URL canónica, sin barra final                    |
| `RATE_LIMIT_HMAC_SECRET`               | HMAC de IP y firma del comprobante de formulario |
| `PROPOSAL_RPC_SECRET`                  | Autentica exclusivamente el salto API → RPC      |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`       | Opcional; clave pública de Turnstile             |
| `TURNSTILE_SECRET_KEY`                 | Opcional; clave privada de Turnstile             |

Turnstile solo se activa cuando existen ambas claves. Los secretos de rate limit y RPC deben ser distintos; el secreto RPC también debe diferir entre preview y producción.

## Comandos

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

Las pruebas de base requieren Docker y Supabase CLI: inicia el entorno con
`supabase start` y ejecuta `supabase test db`. El CI valida estas pruebas SQL en
un job independiente.

Los E2E conectados usan `E2E_LIVE=true`. Las pruebas administrativas requieren temporalmente `E2E_ADMIN_EMAIL` y `E2E_ADMIN_PASSWORD`; no se guardan ni se comparten.

## Documentación

- [Arquitectura](docs/architecture.md)
- [Base de datos](docs/database.md)
- [Seguridad](docs/security.md)
- [Despliegue](docs/deployment.md)
- [Administración](docs/admin.md)

La migración versionada está en `supabase/migrations` y sus pruebas transaccionales en `supabase/tests/database`.
