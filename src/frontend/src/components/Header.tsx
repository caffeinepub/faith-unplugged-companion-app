import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, BookOpen, FileText, Church, Settings, Flame, Book, User, LogOut, LogIn } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

type Page = 'home' | 'devotion' | 'journal' | 'ministry' | 'settings' | 'fasting' | 'bible' | 'myjourney';

interface HeaderProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isAuthenticated: boolean;
}

export default function Header({ currentPage, onNavigate, isAuthenticated }: HeaderProps) {
  const { login, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();

  const navItems = [
    { id: 'home' as Page, label: 'Home', icon: Home },
    { id: 'bible' as Page, label: 'Bible', icon: Book },
    { id: 'journal' as Page, label: 'Journal', icon: FileText },
    { id: 'fasting' as Page, label: 'Fasting', icon: Flame },
    { id: 'myjourney' as Page, label: 'My Journey', icon: User },
    { id: 'ministry' as Page, label: 'Ministry', icon: Church },
    { id: 'settings' as Page, label: 'Settings', icon: Settings },
  ];

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      toast.success('Logged out successfully');
    } else {
      try {
        await login();
        toast.success('Logged in successfully');
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        } else {
          toast.error('Login failed. Please try again.');
        }
      }
    }
  };

  const disabled = loginStatus === 'logging-in';

  return (
    <header className="sticky top-0 z-50 border-b-2 border-border bg-card shadow-sm backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <img
            src="/assets/generated/cross-icon-transparent.dim_64x64.png"
            alt="Cross"
            className="h-9 w-9 drop-shadow-sm"
          />
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Faith Unplugged
          </h1>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={currentPage === item.id ? 'default' : 'ghost'}
                onClick={() => onNavigate(item.id)}
                className={currentPage === item.id ? 'shadow-button' : ''}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
          <Button
            onClick={handleAuth}
            disabled={disabled}
            variant={isAuthenticated ? 'outline' : 'default'}
            className="ml-2 border-2 shadow-button"
          >
            {isAuthenticated ? (
              <>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </>
            )}
          </Button>
        </nav>

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="border-2">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] bg-card">
            <nav className="flex flex-col gap-3 pt-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? 'default' : 'ghost'}
                    onClick={() => onNavigate(item.id)}
                    className="justify-start text-base"
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </Button>
                );
              })}
              <Button
                onClick={handleAuth}
                disabled={disabled}
                variant={isAuthenticated ? 'outline' : 'default'}
                className="justify-start border-2 text-base"
              >
                {isAuthenticated ? (
                  <>
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                  </>
                ) : (
                  <>
                    <LogIn className="mr-3 h-5 w-5" />
                    Login
                  </>
                )}
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
