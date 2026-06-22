'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Inicio' },
  { href: '/dashboard/instalacoes', label: 'Instalacoes' },
  { href: '/dashboard/clientes', label: 'Clientes' },
  { href: '/dashboard/equipes', label: 'Equipes' },
  { href: '/dashboard/financeiro', label: 'Financeiro' },
  { href: '/dashboard/estoque', label: 'Estoque' },
  { href: '/dashboard/documentos', label: 'Documentos' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col border-r border-border bg-white">
        <div className="border-b border-border px-6 py-5">
          <h2 className="text-lg font-bold text-primary">Instalador Pro</h2>
          <p className="mt-0.5 text-xs text-gray-500">Minha Empresa Solar</p>
        </div>
        <nav className="flex-1 px-3 py-4">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary'
                        : 'text-gray-600 hover:bg-surface hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 bg-surface p-8">{children}</main>
    </div>
  );
}
