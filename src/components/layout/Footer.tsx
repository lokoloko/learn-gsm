import Link from 'next/link';

const footerLinks = {
  resources: [
    { name: 'Videos', href: '/videos' },
    { name: 'News', href: '/news' },
    { name: 'Topics', href: '/topics' },
    { name: 'Creators', href: '/creators' },
  ],
  tools: [
    { name: 'Listing Analyzer', href: 'https://listings.gostudiom.com', external: true },
    { name: 'Calendar', href: 'https://calendar.gostudiom.com', external: true },
    { name: 'Market Research', href: 'https://research.gostudiom.com', external: true },
  ],
  company: [
    { name: 'About GoStudioM', href: 'https://gostudiom.com/about', external: true },
    { name: 'Contact', href: 'https://gostudiom.com/contact', external: true },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                L
              </div>
              <span className="font-semibold">Learn STR</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              The knowledge hub for short-term rental hosts. Learn from top creators, stay updated with industry news.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Free Tools</h3>
            <ul className="space-y-3">
              {footerLinks.tools.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} GoStudioM. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Part of the{' '}
            <a
              href="https://gostudiom.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              GoStudioM Platform
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
