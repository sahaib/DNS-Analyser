export function TrustedBy() {
  return (
    <section className="mt-24 text-center text-white">
      <h2 className="text-2xl font-semibold mb-8">Trusted by Security Teams Worldwide</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center opacity-80">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white/10 p-4 rounded-lg">
            <div className="h-12 bg-white/20 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  )
}

