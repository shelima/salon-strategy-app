'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Users, TrendingUp, Calculator, Star } from 'lucide-react';

const navItems = [
  { href: '/area', icon: MapPin, label: 'エリア' },
  { href: '/competitor', icon: Users, label: '競合' },
  { href: '/simulation', icon: TrendingUp, label: '売上' },
  { href: '/profit-loss', icon: Calculator, label: '損益' },
  { href: '/diagnosis', icon: Star, label: '診断' },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-50">
      <div className="max-w-md mx-auto flex">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2 px-1 transition-colors ${
                active
                  ? 'text-amber-800'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                className={active ? 'text-amber-800' : ''}
              />
              <span className="text-[10px] mt-0.5 font-semibold tracking-wide">
                {label}
              </span>
              {active && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-amber-800 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
