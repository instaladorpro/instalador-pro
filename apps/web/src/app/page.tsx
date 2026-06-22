import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold text-primary">Instalador Pro</h1>
      <p className="text-gray-600">Plataforma para instaladores de energia solar</p>
      <Link
        href="/login"
        className="rounded-lg bg-primary px-6 py-3 text-white font-medium hover:bg-primary-600 transition-colors"
      >
        Acessar plataforma
      </Link>
    </main>
  );
}
