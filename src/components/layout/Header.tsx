'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Videos', href: '/videos' },
  { name: 'News', href: '/news' },
  { name: 'Rules', href: '/regulations' },
  { name: 'Topics', href: '/topics' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container relative flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <div className="relative h-16 w-64">
            <Image
              src="/gostudiom-logo.png"
              alt="GoStudioM"
              fill
              className="object-contain object-left"
              priority
              sizes="(max-width: 768px) 192px, 256px"
            />
          </div>
        </Link>

        {/* Desktop Navigation - Centered */}
        <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
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
                className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
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
