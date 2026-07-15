# Base de datos

## Modelo

`profiles` enlaza uno a uno con `auth.users` y solo admite el rol `admin`. El alta de Auth siempre se realiza desde el Dashboard soportado; después se inserta su UUID en `profiles`.

`proposals` conserva el contenido original, referencia `UNEP-` más 12 hexadecimales aleatorios, anonimato, clasificación, estado y marcas temporales. Un `tsvector` español indexado con GIN cubre referencia, título, descripción y campos de contexto.

Estados válidos:

```text
nueva ─────► revisada ─────► archivada
  └────────────────────────► archivada
```

`archivada` es terminal. El trigger fija `reviewed_at`/`archived_at` e impide modificar el contenido.

El esquema `private` contiene hashes SHA-256 de los secretos RPC y ventanas de rate limiting de 15 minutos. El cuarto envío por HMAC de identificador se rechaza de forma atómica. Las ventanas con más de 24 horas se depuran durante inserciones.

## Migraciones y tipos

Las migraciones se crean con `supabase migration new`, se aplican de forma versionada y luego se regeneran los tipos en `src/lib/supabase/types.ts`. Las pruebas SQL son transaccionales y terminan con `rollback`.
