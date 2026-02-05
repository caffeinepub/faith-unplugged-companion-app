import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t-2 border-border bg-muted/40 py-8">
      <div className="container mx-auto px-4 text-center">
        <p className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
          © 2025. Built with{' '}
          <Heart className="h-4 w-4 fill-primary text-primary" />{' '}
          using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary underline-offset-4 transition-colors hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
