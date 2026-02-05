import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMinistryInfo } from '../hooks/useQueries';
import { Globe, Mail, MapPin, Heart, Loader2 } from 'lucide-react';

export default function MinistryPage() {
  const { data: ministryInfo, isLoading } = useMinistryInfo();

  if (isLoading || !ministryInfo) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
          Temple of Praise Ministries
        </h1>
        <p className="text-xl text-muted-foreground">H.O.G.S.I.C.</p>
      </div>

      <Card className="mb-6 border-2 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
          <CardTitle>Our Mission</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="leading-relaxed text-foreground">
            {ministryInfo.missionStatement}
          </p>
        </CardContent>
      </Card>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <Card className="border-2">
          <CardContent className="flex items-start gap-4 p-6">
            <Globe className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
            <div>
              <h3 className="mb-2 font-semibold">Website</h3>
              <a
                href={ministryInfo.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {ministryInfo.website}
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="flex items-start gap-4 p-6">
            <Mail className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
            <div>
              <h3 className="mb-2 font-semibold">Email</h3>
              <a
                href={`mailto:${ministryInfo.email}`}
                className="text-primary hover:underline"
              >
                {ministryInfo.email}
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 md:col-span-2">
          <CardContent className="flex items-start gap-4 p-6">
            <MapPin className="mt-1 h-6 w-6 flex-shrink-0 text-primary" />
            <div>
              <h3 className="mb-2 font-semibold">Location</h3>
              <p className="text-foreground">{ministryInfo.address}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-primary/50 shadow-lg">
        <CardContent className="p-6 text-center">
          <Heart className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h3 className="mb-2 text-xl font-semibold">Support Our Ministry</h3>
          <p className="mb-4 text-muted-foreground">
            Your generosity helps us continue spreading God's love
          </p>
          <Button size="lg" asChild>
            <a href={ministryInfo.supportLink} target="_blank" rel="noopener noreferrer">
              <Heart className="mr-2 h-5 w-5" />
              Support the Ministry
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
