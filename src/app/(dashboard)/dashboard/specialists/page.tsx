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
import { useLanguage } from '@/contexts/language-context';
import { specialistService, type Specialist } from '@/services/specialist.service';
import { ChevronLeft, ChevronRight, Edit, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function SpecialistsPage() {
  const { t, tr } = useLanguage();
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSpecialist, setSelectedSpecialist] = useState<Specialist | null>(null);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;
  const { toast } = useToast();

  useEffect(() => {
    loadSpecialists();
  }, [page]);

  const loadSpecialists = async () => {
    try {
      setLoading(true);
      const response = await specialistService.getSpecialists(page, limit);
      setSpecialists(response.data);
      setTotal(response.meta.total);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load specialists',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSpecialist = async (e: React.FormEvent<HTMLFormElement>) => {
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
      const response = await specialistService.createSpecialist(formData);

      toast({
        title: 'Success',
        description: response.message,
      });

      setCreateDialogOpen(false);
      formElement.reset();
      loadSpecialists();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create specialist',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEditSpecialist = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSpecialist) return;

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
      const response = await specialistService.updateSpecialist(selectedSpecialist.id, formData);

      toast({
        title: 'Success',
        description: response.message,
      });

      setEditDialogOpen(false);
      setSelectedSpecialist(null);
      loadSpecialists();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update specialist',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteSpecialist = async (id: string) => {
    if (!confirm(tr('Are you sure you want to delete this specialist?'))) return;

    try {
      await specialistService.deleteSpecialist(id);
      toast({
        title: 'Success',
        description: 'Specialist deleted successfully',
      });
      loadSpecialists();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete specialist',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (specialist: Specialist) => {
    setSelectedSpecialist(specialist);
    setEditDialogOpen(true);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {t('specialists', 'Specialists')}
          </h1>
          <p className="mt-1 text-sm text-gray-500 sm:text-base">
            {t('specialistCategories', 'Manage specialist categories')}
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              {t('addSpecialist', 'Add Specialist')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="text-start">
              <DialogTitle className="text-start">{t('createSpecialist', 'Create Specialist')}</DialogTitle>
              <DialogDescription className="text-start">{t('specialistCategories', 'Add a new specialist category')}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSpecialist}>
              <div className="grid gap-4 py-4 text-start">
                <div className="grid gap-2 text-start">
                  <Label htmlFor="create-name">{t('name', 'Name')}</Label>
                  <Input id="create-name" name="name" placeholder="e.g., Cardiologist" required />
                </div>
                <div className="grid gap-2 text-start">
                  <Label htmlFor="create-image">{t('image', 'Image')}</Label>
                  <Input id="create-image" name="image" type="file" accept="image/*" required />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  {t('cancel', 'Cancel')}
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? t('loading', 'Creating...') : t('save', 'Create')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-start">{t('allSpecialists', 'All Specialists')}</CardTitle>
          <CardDescription className="text-start">
            {loading ? t('loading', 'Loading...') : `${total} specialist(s) total`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : specialists.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">{t('noSpecialistsFound', 'No specialists found')}</p>
              <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                {t('addSpecialist', 'Add Your First Specialist')}
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/75">
                      <TableHead className="text-start">{t('image', 'Image')}</TableHead>
                      <TableHead className="text-start">{t('name', 'Name')}</TableHead>
                      <TableHead className="text-start">{t('date', 'Created At')}</TableHead>
                      <TableHead className="text-start">{t('actions', 'Actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {specialists.map((specialist) => (
                      <TableRow key={specialist.id}>
                        <TableCell className="text-start">
                          <div className="relative h-12 w-12 overflow-hidden rounded-full bg-muted">
                            <Image
                              src={specialist.image}
                              alt={specialist.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-start">{specialist.name}</TableCell>
                        <TableCell className="text-start text-xs text-gray-500">{new Date(specialist.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-start">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(specialist)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteSpecialist(specialist.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

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
          <DialogHeader className="text-start">
            <DialogTitle className="text-start">{t('editSpecialist')}</DialogTitle>
            <DialogDescription className="text-start">{t('updateSpecialistInfo')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSpecialist}>
            <div className="grid gap-4 py-4 text-start">
              <div className="grid gap-2 text-start">
                <Label htmlFor="edit-name">{t('name')}</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={selectedSpecialist?.name}
                  placeholder="e.g., Cardiologist"
                  required
                />
              </div>
              <div className="grid gap-2 text-start">
                <Label htmlFor="edit-image">{t('imageOptional')}</Label>
                <Input id="edit-image" name="image" type="file" accept="image/*" />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={uploading}>
                {uploading ? t('updating') : t('edit')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
