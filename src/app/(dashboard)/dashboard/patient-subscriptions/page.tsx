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
  patientSubscriptionService,
  type PatientSubscription,
} from '@/services/patient-subscription.service';
import { DollarSign, Edit, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

const COUNTRIES = ['LIBYA', 'TUNISIA', 'EGYPT', 'ALGERIA'];

export default function PatientSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<PatientSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<PatientSubscription | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await patientSubscriptionService.getSubscriptions();
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
      const response = await patientSubscriptionService.createOrUpdateSubscription({
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
    if (!confirm(`Are you sure you want to delete subscription for ${country}?`)) return;

    try {
      await patientSubscriptionService.deleteSubscription(country);
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

  const openEditDialog = (subscription: PatientSubscription) => {
    setEditingSubscription(subscription);
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingSubscription(null);
    setDialogOpen(true);
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Platform Subscriptions</h1>
          <p className="text-muted-foreground">
            Manage subscription pricing for patients by country
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Subscription
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSubscription ? 'Edit Subscription' : 'Create Subscription'}
              </DialogTitle>
              <DialogDescription>
                {editingSubscription
                  ? 'Update subscription pricing for this country'
                  : 'Set subscription pricing for a new country'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    name="country"
                    defaultValue={editingSubscription?.country ?? ''}
                    required
                    disabled={!!editingSubscription}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
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
                      Country cannot be changed. Delete and create new if needed.
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={editingSubscription?.amount ?? ''}
                    placeholder="e.g., 19.99"
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
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : editingSubscription ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
              <p className="text-muted-foreground">No subscriptions found</p>
              <Button className="mt-4" onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Subscription
              </Button>
            </CardContent>
          </Card>
        ) : (
          subscriptions.map((subscription) => (
            <Card key={subscription.id} className="relative overflow-hidden">
              <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-primary/10" />
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{subscription.country.replace('_', ' ')}</span>
                  <DollarSign className="h-5 w-5 text-primary" />
                </CardTitle>
                <CardDescription>Patient Platform Subscription</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl font-bold">${subscription.amount.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">per month</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(subscription)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
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
                  Updated: {new Date(subscription.updatedAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
