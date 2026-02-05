import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Loader2, Heart } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileSetupModal() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfileMutation = useSaveCallerUserProfile();
  const [name, setName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const isAuthenticated = !!identity;

  useEffect(() => {
    // Show modal only if user is authenticated, profile is loaded, and no profile exists
    if (isAuthenticated && !profileLoading && isFetched && userProfile === null) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isAuthenticated, profileLoading, isFetched, userProfile]);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      await saveProfileMutation.mutateAsync({ name: name.trim() });
      toast.success('Welcome to Faith Unplugged!');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to save profile. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Heart className="h-6 w-6 text-primary" />
            Welcome to Faith Unplugged
          </DialogTitle>
          <DialogDescription className="text-base">
            Before we begin your 30-day devotional journey, please tell us your name so we can personalize your experience.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-semibold">
              Your Name
            </Label>
            <Input
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveProfile();
                }
              }}
              className="text-base"
              autoFocus
            />
          </div>
          <Button
            onClick={handleSaveProfile}
            disabled={saveProfileMutation.isPending || !name.trim()}
            className="w-full"
            size="lg"
          >
            {saveProfileMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              'Begin My Journey'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
