import Link from 'next/link';
import { MapPin, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function RegulationNotFound() {
  return (
    <div className="container py-16 lg:py-24">
      <div className="max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-8">
          <MapPin className="h-10 w-10 text-muted-foreground" />
        </div>

        <h1 className="text-3xl font-bold mb-4">Market Not Found</h1>
        <p className="text-muted-foreground mb-8 text-lg">
          We couldn&apos;t find regulations for this market. It may not be in our
          database yet, or the URL might be incorrect.
        </p>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="font-semibold mb-4">What you can do:</h2>
            <ul className="text-left text-muted-foreground space-y-3">
              <li className="flex items-start gap-3">
                <Search className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>
                  Search our{' '}
                  <Link href="/regulations" className="text-primary hover:underline">
                    regulations directory
                  </Link>{' '}
                  to find your market
                </span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>
                  Request a market to be added by emailing{' '}
                  <a
                    href="mailto:support@gostudiom.com?subject=Request%20Regulation%20Market"
                    className="text-primary hover:underline"
                  >
                    support@gostudiom.com
                  </a>
                </span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/regulations">
            <Button variant="default" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Browse All Markets
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Go to Homepage</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
