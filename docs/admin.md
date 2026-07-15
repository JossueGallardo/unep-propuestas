# Administración

## Primer administrador

1. En Supabase Dashboard abre Authentication → Users y crea el usuario con correo y contraseña privada.
2. Copia el UUID generado; nunca insertes filas manualmente en `auth.users`.
3. Inserta el perfil con `insert into public.profiles (id, role) values ('UUID', 'admin');` desde SQL Editor.
4. Accede una vez a `/admin/login` y valida panel, filtros, detalle, estados, CSV y cierre de sesión.

No compartas la contraseña. SMTP, recuperación y enlaces mágicos quedan fuera de v1.

## Operación

- `nueva` puede marcarse `revisada` o archivarse.
- `revisada` puede archivarse.
- `archivada` no admite más cambios.
- El contenido original no puede editarse ni eliminarse desde la interfaz.
- La exportación aplica los filtros activos y se limita a 10.000 filas; acota la consulta si se supera.

Los datos de contacto, redes y Turnstile permanecen ocultos hasta configurar valores institucionales reales.
