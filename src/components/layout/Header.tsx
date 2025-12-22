'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, PlayCircle, Newspaper, Grid3X3, Users, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Videos', href: '/videos', icon: PlayCircle },
  { name: 'News', href: '/news', icon: Newspaper },
  { name: 'Topics', href: '/topics', icon: Grid3X3 },
  { name: 'Creators', href: '/creators', icon: Users },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            L
          </div>
          <span className="font-semibold text-lg hidden sm:block">Learn STR</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </div>

        {/* Chat CTA + Mobile Menu Button */}
        <div className="flex items-center gap-2">
          <Link href="/chat">
            <Button size="sm" className="hidden sm:flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Ask AI
            </Button>
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Toggle menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="container py-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
            <Link
              href="/chat"
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-primary hover:bg-muted rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <MessageCircle className="h-5 w-5" />
              Ask AI
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
