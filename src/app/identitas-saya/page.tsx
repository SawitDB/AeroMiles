async function getIdentitas() {
  const res = await fetch(
    'https://aeromiles-production.up.railway.app/api/identitas',
    {
      cache: 'no-store',
      credentials: 'include',
    }
  )

  if (!res.ok) {
    return []
  }

  return res.json()
}

export default async function Page() {
  const data = await getIdentitas()

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 text-white">
      <h1 className="text-2xl font-semibold">
        Identitas Saya
      </h1>

      <div className="mt-6 space-y-4">
        {data.length === 0 ? (
          <p>Tidak ada identitas.</p>
        ) : (
          data.map((item: any) => (
            <div
              key={item.nomor}
              className="rounded-xl border border-white/20 p-4"
            >
              <p>
                <strong>Nomor:</strong> {item.nomor}
              </p>

              <p>
                <strong>Jenis:</strong> {item.jenis}
              </p>

              <p>
                <strong>Negara Penerbit:</strong>{' '}
                {item.negara_penerbit}
              </p>

              <p>
                <strong>Tanggal Terbit:</strong>{' '}
                {item.tanggal_terbit}
              </p>

              <p>
                <strong>Tanggal Habis:</strong>{' '}
                {item.tanggal_habis}
              </p>
            </div>
          ))
        )}
      </div>
    </main>
  )
}