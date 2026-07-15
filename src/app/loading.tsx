export default function Loading() {
  return (
    <main className="container-site py-24" aria-busy="true">
      <div className="bg-muted h-8 w-48 animate-pulse" />
      <div className="bg-muted mt-5 h-28 max-w-3xl animate-pulse" />
      <span className="sr-only">Cargando…</span>
    </main>
  );
}
