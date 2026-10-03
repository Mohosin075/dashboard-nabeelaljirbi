'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  clinicSubscriptionService,
  type ClinicSubscription,
} from '@/services/clinic-subscription.service';
import { DollarSign, Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useLanguage } from '@/contexts/language-context';

const COUNTRIES = ['LIBYA', 'TUNISIA', 'EGYPT', 'ALGERIA'];

export default function ClinicSubscriptionsPage() {
  const { t, tr } = useLanguage();
  const [subscriptions, setSubscriptions] = useState<ClinicSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<ClinicSubscription | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await clinicSubscriptionService.getSubscriptions();
      setSubscriptions(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load subscriptions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get('amount') as string);
    const country = editingSubscription?.country || (formData.get('country') as string);

    try {
      setSubmitting(true);
      const response = await clinicSubscriptionService.createOrUpdateSubscription({
        amount,
        country,
      });

      toast({
        title: 'Success',
        description: response.message,
      });

      setDialogOpen(false);
      setEditingSubscription(null);
      loadSubscriptions();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to save subscription',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (country: string) => {
    if (!confirm(tr(`Are you sure you want to delete subscription for ${country}?`))) return;

    try {
      await clinicSubscriptionService.deleteSubscription(country);
      toast({
        title: 'Success',
        description: 'Subscription deleted successfully',
      });
      loadSubscriptions();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete subscription',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (subscription: ClinicSubscription) => {
    setEditingSubscription(subscription);
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingSubscription(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('clinicPlatformSubscriptions')}</h1>
          <p className="text-muted-foreground text-sm">
            {t('clinicSubscriptionsDesc')}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>{t('addSubscription')}</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSubscription ? t('editSubscription') : t('createSubscription')}
              </DialogTitle>
              <DialogDescription>
                {editingSubscription
                  ? t('updateSubscriptionPricing')
                  : t('setSubscriptionPricing')}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="country">{t('country')}</Label>
                  <Select
                    name="country"
                    defaultValue={editingSubscription?.country ?? ''}
                    required
                    disabled={!!editingSubscription}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectCountry')} />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {editingSubscription && (
                    <p className="text-xs text-muted-foreground">
                      {t('countryCannotBeChanged')}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">{t('amountUsd')}</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editingSubscription?.amount ?? ''}
                    placeholder="e.g., 20.22"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setEditingSubscription(null);
                  }}
                >
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? t('saving') : editingSubscription ? t('update') : t('save')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : subscriptions.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">{t('noSubscriptionsFound')}</p>
              <Button className="mt-4 flex items-center gap-2 mx-auto" onClick={openCreateDialog}>
                <Plus className="h-4 w-4" />
                <span>{t('addYourFirstSubscription')}</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          subscriptions.map((subscription) => (
            <Card key={subscription.id} className="relative overflow-hidden">
              <div className="absolute ltr:right-0 rtl:left-0 top-0 h-24 w-24 -translate-y-8 ltr:translate-x-8 rtl:-translate-x-8 rounded-full bg-blue-500/10" />
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{subscription.country.replace('_', ' ')}</span>
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </CardTitle>
                <CardDescription>{t('clinicPlatformSubscriptions')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl font-bold">${subscription.amount.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{t('perMonth')}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-2"
                    onClick={() => openEditDialog(subscription)}
                  >
                    <Edit className="h-4 w-4" />
                    <span>{t('edit')}</span>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(subscription.country)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  {t('updated')} {new Date(subscription.updatedAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
