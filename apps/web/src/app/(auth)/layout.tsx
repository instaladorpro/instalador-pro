import Image from 'next/image';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="mb-8 text-center">
          <Image src="/logo.png" alt="Instalador Pro" width={64} height={64} className="mx-auto mb-3" />
          <h1 className="text-xl font-bold text-foreground">Instalador Pro</h1>
          <p className="mt-0.5 text-sm text-muted">Plataforma para instaladores de energia solar</p>
        </div>
        {children}
      </div>
    </div>
  );
}
