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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { insuranceService, type Insurance } from '@/services/insurance.service';
import { ChevronLeft, ChevronRight, Edit, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function InsurancePage() {
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState<Insurance | null>(null);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const { toast } = useToast();

  useEffect(() => {
    loadInsurances();
  }, [page]);

  const loadInsurances = async () => {
    try {
      setLoading(true);
      const response = await insuranceService.getInsurances(page, limit);
      setInsurances(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load insurances',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInsurance = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const formDataElement = new FormData(formElement);

    const name = formDataElement.get('name') as string;
    const imageFile = formDataElement.get('image') as File;

    const formData = new FormData();
    formData.append('data', JSON.stringify({ name }));
    formData.append('image', imageFile);

    try {
      setUploading(true);
      const response = await insuranceService.createInsurance(formData);

      toast({
        title: 'Success',
        description: response.message,
      });

      setCreateDialogOpen(false);
      formElement.reset();
      loadInsurances();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create insurance',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEditInsurance = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedInsurance) return;

    const formElement = e.currentTarget;
    const formDataElement = new FormData(formElement);

    const name = formDataElement.get('name') as string;
    const imageFile = formDataElement.get('image') as File | null;

    const formData = new FormData();
    formData.append('data', JSON.stringify({ name }));
    if (imageFile && imageFile.size > 0) {
      formData.append('image', imageFile);
    }

    try {
      setUploading(true);
      const response = await insuranceService.updateInsurance(selectedInsurance.id, formData);

      toast({
        title: 'Success',
        description: response.message,
      });

      setEditDialogOpen(false);
      setSelectedInsurance(null);
      loadInsurances();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update insurance',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteInsurance = async (id: string) => {
    if (!confirm('Are you sure you want to delete this insurance?')) return;

    try {
      await insuranceService.deleteInsurance(id);
      toast({
        title: 'Success',
        description: 'Insurance deleted successfully',
      });
      loadInsurances();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete insurance',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (insurance: Insurance) => {
    setSelectedInsurance(insurance);
    setEditDialogOpen(true);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Insurance Providers</h1>
          <p className="text-muted-foreground">Manage insurance provider listings</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Insurance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Insurance Provider</DialogTitle>
              <DialogDescription>Add a new insurance provider</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateInsurance}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="create-name">Name</Label>
                  <Input
                    id="create-name"
                    name="name"
                    placeholder="e.g., AARP Health Insurance"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-image">Logo</Label>
                  <Input id="create-image" name="image" type="file" accept="image/*" required />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Creating...' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Insurance Providers</CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : `${total} insurance provider(s) total`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : insurances.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No insurance providers found</p>
              <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Insurance Provider
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Logo</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {insurances.map((insurance) => (
                    <TableRow key={insurance.id}>
                      <TableCell>
                        <div className="relative h-12 w-12 overflow-hidden rounded-full bg-muted">
                          <Image
                            src={insurance.image}
                            alt={insurance.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{insurance.name}</TableCell>
                      <TableCell>{new Date(insurance.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(insurance)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteInsurance(insurance.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Insurance Provider</DialogTitle>
            <DialogDescription>Update insurance provider information</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditInsurance}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={selectedInsurance?.name}
                  placeholder="e.g., AARP Health Insurance"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-image">Logo (optional - leave empty to keep current)</Label>
                <Input id="edit-image" name="image" type="file" accept="image/*" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? 'Updating...' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
