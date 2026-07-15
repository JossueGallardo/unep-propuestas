export default function AdminLoading() {
  return (
    <main className="container-site py-12" aria-live="polite">
      <div className="h-12 w-64 animate-pulse bg-black/8" />
      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-24 animate-pulse border bg-white" />
        ))}
      </div>
      <div className="mt-6 h-96 animate-pulse border bg-white" />
      <span className="sr-only">Cargando panel…</span>
    </main>
  );
}
