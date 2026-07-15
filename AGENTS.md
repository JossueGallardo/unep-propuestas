# Guía para agentes

## Alcance

Este repositorio contiene una sola aplicación Next.js desplegada como `unep-propuestas`. Usa únicamente el repositorio `JossueGallardo/unep-propuestas` y el proyecto Supabase `jtfndpxyhycveqywgbmj`.

## Reglas de implementación

- Mantén TypeScript estricto y Server Components por defecto.
- No añadas Redux, adjuntos, almacenamiento Supabase, seguimiento público ni respuestas individuales.
- No uses `service_role`; el servidor invoca `public.submit_proposal` con una clave publicable y `PROPOSAL_RPC_SECRET`.
- Toda tabla nueva debe tener RLS, revocaciones y grants explícitos en una migración.
- Las funciones `SECURITY DEFINER` deben vivir en `private`, fijar `search_path = ''` y usar nombres totalmente cualificados.
- Nunca registres IP, secretos, contenido de propuestas ni contraseñas.
- Preserva `Logo.jpeg` sin modificar. Los derivados van en `public/brand` o en rutas de iconos de Next.js.
- Usa `npm.cmd`/`npx.cmd` en PowerShell cuando la política bloquee `.ps1`.

## Antes de entregar

Ejecuta formato, lint, tipos, Vitest, Playwright y build. Revisa asesores de seguridad y rendimiento de Supabase y logs del deployment. No publiques si alguna comprobación requerida falla.
