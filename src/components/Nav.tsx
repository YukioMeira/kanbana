'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Nav() {
  const path = usePathname()

  return (
    <header className="border-b border-white/10 bg-gray-950">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-6 py-4">
        <span className="text-lg font-bold tracking-tight text-white">Kanbana</span>
        <nav className="flex gap-1">
          {[
            { href: '/', label: 'Kanban' },
            { href: '/log', label: 'Log' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                path === href
                  ? 'bg-white/10 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
