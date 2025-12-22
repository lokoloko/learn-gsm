import Image from 'next/image'
import { FOOTER_PRODUCT_COLUMNS, FOOTER_LINKS, TRUST_SIGNALS } from '@/lib/shared-content'

/**
 * Shared Footer Component - Product-Centric Structure
 *
 * Layout: Logo | Listing Analyzer | Cleaning Calendar | Financial Analytics | Learn | Compare | Legal
 *
 * Each product column shows:
 * - Product name as header
 * - Main CTA link
 * - Related free tools
 * - "All X Tools →" link to category anchor
 */
export function Footer() {
  const productColumns = Object.values(FOOTER_PRODUCT_COLUMNS)

  return (
    <footer className="border-t bg-muted/50 mt-20">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-8">
          {/* Logo column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <div className="relative h-14 w-56 mb-4">
              <Image
                src="/gostudiom-logo.png"
                alt="GoStudioM"
                fill
                className="object-contain object-left"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {TRUST_SIGNALS.tagline}
            </p>
          </div>

          {/* Product columns - Listing Analyzer, Cleaning Calendar, Financial Analytics, Learn */}
          {productColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-medium mb-3">{column.title}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {/* Main product CTA */}
                <li>
                  <a
                    href={column.mainLink.href}
                    className="hover:text-foreground transition-colors font-medium text-primary"
                  >
                    {column.mainLink.label}
                  </a>
                </li>
                {/* Related free tools */}
                {column.tools.map((tool) => (
                  <li key={tool.href}>
                    <a
                      href={tool.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {tool.label}
                    </a>
                  </li>
                ))}
                {/* Category anchor link */}
                <li className="pt-1">
                  <a
                    href={column.cta.href}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    {column.cta.label}
                  </a>
                </li>
              </ul>
            </div>
          ))}

          {/* Compare */}
          <div>
            <h3 className="text-sm font-medium mb-3">Compare</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {FOOTER_LINKS.compare.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal + Support combined */}
          <div>
            <h3 className="text-sm font-medium mb-3">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} GoStudioM. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
