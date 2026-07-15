# Seguridad

## Envío público

- Solo `POST` JSON del mismo origen y con tamaño limitado.
- Zod en cliente/servidor y revalidación independiente dentro de Postgres.
- Honeypot, comprobante HMAC de 3 segundos a 2 horas y Turnstile opcional.
- La IP de `x-forwarded-for` se transforma inmediatamente mediante HMAC-SHA256. La IP original no se persiste ni se registra.
- La respuesta exitosa contiene únicamente `{ referenceCode }`; los fallos no exponen detalles internos.

## Base y autenticación

- RLS en todas las tablas, incluidas las privadas.
- `anon` no tiene `SELECT`, `INSERT`, `UPDATE` ni `DELETE` sobre propuestas.
- Autenticarse no basta: `private.is_admin()` exige un perfil administrador.
- Los administradores solo reciben `UPDATE` sobre `status`, `reviewed_at` y `archived_at`.
- La clave publicable es la única clave Supabase de la aplicación. No se usa `service_role`.
- El secreto RPC se verifica contra su hash; hay valores distintos para preview y producción.

## Navegador

CSP, bloqueo de framing, `nosniff`, política estricta de referer y restricciones de permisos se configuran en `next.config.ts`. `/admin`, `/auth` y `/api` incluyen `noindex` y los datos administrativos usan `no-store`.

## Rotación

Para rotar `PROPOSAL_RPC_SECRET`, añade primero el nuevo hash activo a `private.rpc_secret_verifiers`, actualiza Vercel, valida el entorno y desactiva/elimina el verificador anterior. Rota `RATE_LIMIT_HMAC_SECRET` directamente en Vercel; el cambio reinicia de hecho la identidad de rate limit.
