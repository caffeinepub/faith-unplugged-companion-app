import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Bell, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Load settings from localStorage
    const savedEnabled = localStorage.getItem('remindersEnabled') === 'true';
    const savedTime = localStorage.getItem('reminderTime') || '09:00';
    setRemindersEnabled(savedEnabled);
    setReminderTime(savedTime);

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        toast.success('Notifications enabled!');
      } else {
        toast.error('Notification permission denied');
      }
    }
  };

  const handleToggleReminders = (enabled: boolean) => {
    setRemindersEnabled(enabled);
    localStorage.setItem('remindersEnabled', enabled.toString());
    
    if (enabled && notificationPermission !== 'granted') {
      requestNotificationPermission();
    } else if (enabled) {
      toast.success('Daily reminders enabled');
    } else {
      toast.info('Daily reminders disabled');
    }
  };

  const handleTimeChange = (time: string) => {
    setReminderTime(time);
    localStorage.setItem('reminderTime', time);
    toast.success(`Reminder time set to ${time}`);
  };

  const sendTestNotification = () => {
    if (notificationPermission === 'granted') {
      new Notification('Faith Unplugged', {
        body: 'Take 5 minutes. Quiet the noise.',
        icon: '/assets/generated/cross-icon-transparent.dim_64x64.png',
      });
      toast.success('Test notification sent!');
    } else {
      toast.error('Please enable notifications first');
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Customize your devotional experience
        </p>
      </div>

      <Card className="mb-6 border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-5 w-5" />
            Daily Reminders
          </CardTitle>
          <CardDescription>
            Receive gentle reminders to take time for your daily devotion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="reminders-toggle" className="text-base">
              Enable Daily Reminders
            </Label>
            <Switch
              id="reminders-toggle"
              checked={remindersEnabled}
              onCheckedChange={handleToggleReminders}
            />
          </div>

          {remindersEnabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="reminder-time" className="flex items-center text-base">
                  <Clock className="mr-2 h-4 w-4" />
                  Reminder Time
                </Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={reminderTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="max-w-xs"
                />
                <p className="text-sm text-muted-foreground">
                  You'll receive a notification at this time each day
                </p>
              </div>

              <div className="rounded-lg bg-muted/50 p-4">
                <p className="mb-2 text-sm font-medium">Example Notification:</p>
                <p className="italic text-muted-foreground">
                  "Take 5 minutes. Quiet the noise."
                </p>
              </div>

              {notificationPermission === 'granted' && (
                <Button variant="outline" onClick={sendTestNotification}>
                  Send Test Notification
                </Button>
              )}

              {notificationPermission === 'denied' && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <p className="text-sm text-destructive">
                    Notifications are blocked. Please enable them in your browser settings.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>About This App</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>Faith Unplugged</strong> is a 30-day devotional companion app designed to help you hear God in the noise of life.
          </p>
          <p>
            All journal entries are stored locally on your device for privacy and offline access.
          </p>
          <p className="pt-4 text-xs">
            Version 1.0.0
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
