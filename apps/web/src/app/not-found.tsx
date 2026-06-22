import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold text-[#534AB7] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Página não encontrada</h2>
        <p className="text-gray-600 mb-6">A página que você procura não existe ou foi movida.</p>
        <Link href="/" className="px-6 py-2 bg-[#534AB7] text-white rounded-lg hover:bg-[#4339a0] transition-colors inline-block">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
