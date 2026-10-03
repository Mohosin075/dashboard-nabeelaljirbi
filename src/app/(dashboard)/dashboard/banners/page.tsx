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
import { useToast } from '@/hooks/use-toast';
import { bannerService, type Banner } from '@/services/banner.service';
import { useLanguage } from '@/contexts/language-context';
import { Plus, Trash2, Upload } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function BannersPage() {
  const { t, tr } = useLanguage();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const response = await bannerService.getBanners();
      setBanners(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load banners',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBanner = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one image',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();

      // Add all selected files
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        if (file) {
          formData.append('images', file);
        }
      }

      const response = await bannerService.createBanner(formData);

      toast({
        title: 'Success',
        description: response.message,
      });

      setCreateDialogOpen(false);
      setSelectedFiles(null);
      loadBanners();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create banner',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm(tr('Are you sure you want to delete this banner?'))) return;

    try {
      await bannerService.deleteBanner(id);
      toast({
        title: 'Success',
        description: 'Banner deleted successfully',
      });
      loadBanners();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete banner',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            {t('banners', 'Banners')}
          </h1>
          <p className="mt-1 text-sm text-gray-500 sm:text-base">
            {banners.length} {t('banners', 'Banners')}
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
              {t('addBanner', 'Add Banner')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="text-start">
              <DialogTitle className="text-start">{t('uploadBanners', 'Upload Banners')}</DialogTitle>
              <DialogDescription className="text-start">
                {t('bannerImages', 'Select one or more images to upload as banners')}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateBanner}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2 text-start">
                  <Label htmlFor="images">{t('bannerImages', 'Banner Images')}</Label>
                  <Input
                    id="images"
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={(e) => setSelectedFiles(e.target.files)}
                    required
                  />
                  {selectedFiles && selectedFiles.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      {selectedFiles.length} {t('filesSelected')}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  {t('cancel', 'Cancel')}
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? (
                    <>
                      <Upload className="ltr:mr-2 rtl:ml-2 h-4 w-4 animate-spin" />
                      {t('uploading', 'Uploading...')}
                    </>
                  ) : (
                    <>
                      <Upload className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                      {t('upload', 'Upload')}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-start">{t('allBanners', 'All Banners')}</CardTitle>
          <CardDescription className="text-start">
            {loading ? t('loading', 'Loading...') : `${banners.length} banner(s) total`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : banners.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">{t('noBannersFound', 'No banners found')}</p>
              <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
                {t('addYourFirstBanner', 'Add Your First Banner')}
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {banners.map((banner) => (
                <Card key={banner.id} className="group overflow-hidden">
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {banner.image.endsWith('.mp4') ? (
                      <video
                        src={banner.image}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        autoPlay
                        muted
                        loop
                      />
                    ) : (
                      <Image
                        src={banner.image}
                        alt="Banner"
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          {new Date(banner.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
