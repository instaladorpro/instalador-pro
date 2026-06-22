'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';

const NAV_ICONS: Record<string, string> = {
  '/inicio': '📊',
  '/instalacoes': '⚡',
  '/clientes': '👥',
  '/equipes': '👷',
  '/financeiro': '💰',
  '/estoque': '📦',
  '/documentos': '📄',
  '/relatorios': '📈',
  '/configuracoes': '⚙️',
};

const navItems = [
  { href: '/inicio', label: 'Início' },
  { href: '/instalacoes', label: 'Instalações' },
  { href: '/clientes', label: 'Clientes' },
  { href: '/equipes', label: 'Equipes' },
  { href: '/financeiro', label: 'Financeiro' },
  { href: '/estoque', label: 'Estoque' },
  { href: '/documentos', label: 'Documentos' },
  { href: '/relatorios', label: 'Relatórios' },
  { href: '/configuracoes', label: 'Configurações' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const orgName = useAuthStore((s) => s.currentOrg?.nome);

  function isActive(href: string) {
    if (href === '/inicio') return pathname === '/inicio';
    return pathname.startsWith(href);
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-white">
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-bold text-primary">Instalador Pro</h2>
          <p className="mt-0.5 text-xs text-secondary truncate">{orgName || 'Minha Empresa'}</p>
        </div>
        <nav className="flex-1 px-3 py-4">
          <ul className="flex flex-col gap-0.5">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-secondary hover:bg-surface hover:text-foreground'
                    }`}
                  >
                    <span className="text-base">{NAV_ICONS[item.href]}</span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-border px-4 py-3">
          <Link href="/perfil" className="text-xs text-secondary hover:text-foreground transition-colors">Meu Perfil</Link>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-30 px-2 py-1 flex justify-around">
        {navItems.slice(0, 5).map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center py-1.5 px-2 text-[10px] ${active ? 'text-primary' : 'text-muted'}`}>
              <span className="text-lg">{NAV_ICONS[item.href]}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <main className="flex-1 bg-surface p-4 md:p-8 pb-20 md:pb-8">{children}</main>
    </div>
  );
}
