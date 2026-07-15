# Despliegue

## Orden requerido

1. Aplica la migración a Supabase y genera tipos.
2. Guarda hashes de secretos RPC `preview` y `production` en Supabase.
3. Desactiva registros públicos y configura Site URL/redirects en Supabase Auth.
4. Crea y enlaza `unep-propuestas` en Vercel sin integración Git.
5. Configura variables por entorno. Nunca uses el mismo `PROPOSAL_RPC_SECRET` en preview y producción.
6. Despliega preview, ejecuta E2E conectado y revisa logs.
7. Tras formato, lint, tipos, pruebas y build verdes, publica el commit exacto en `main`.
8. Espera GitHub Actions, conecta GitHub y promueve exactamente ese commit a producción.
9. Configura `https://unep-propuestas.vercel.app` como URL pública de Auth y vuelve a ejecutar asesores/logs.

## Variables por entorno

Preview y producción comparten URL y clave publicable de Supabase, pero tienen secretos HMAC y RPC propios. `NEXT_PUBLIC_SITE_URL` es la URL de preview durante la prueba y `https://unep-propuestas.vercel.app` en producción. Turnstile se omite hasta disponer de sus dos claves reales.

## Recuperación

Vercel permite volver a promover un deployment anterior. Los cambios de base son migraciones hacia delante: prepara una migración correctiva en vez de editar o eliminar la aplicada.
