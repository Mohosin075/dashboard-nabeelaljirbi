'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import {
  PrepaidCard,
  PrepaidCardStats,
  prepaidCardService,
} from '@/services/prepaid-card.service';
import {
  CreditCard,
  Download,
  Edit,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

export default function PrepaidCardsPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<PrepaidCardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCard, setSelectedCard] = useState<PrepaidCard | null>(null);
  const [processing, setProcessing] = useState(false);
  const [activeSearch, setActiveSearch] = useState('');

  // Forms
  const [createForm, setCreateForm] = useState({ amount: 100, quantity: 10 });
  const [updateForm, setUpdateForm] = useState({
    cardNumber: '',
    amount: 0,
    isActive: false
  });

  useEffect(() => {
    fetchCards();
  }, [page, activeSearch]);

  const handleSearch = () => {
    setPage(1);
    setActiveSearch(search);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await prepaidCardService.getAll({
        page,
        limit: 10,
        search: activeSearch // If API supports it
      });

      let data = response.data;
      if (activeSearch && data && data.data) {
          // Fallback filter
          data.data = data.data.filter(c => c.cardNumber.includes(activeSearch));
      }

      setStats(data);
      setTotalPages(Math.ceil((response.meta.total || 0) / 10));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load prepaid cards',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      setProcessing(true);
      await prepaidCardService.create(createForm);
      toast({ title: 'Success', description: 'Prepaid cards created successfully' });
      setShowCreateModal(false);
      fetchCards();
      setCreateForm({ amount: 100, quantity: 10 }); // Reset
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create cards',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const openUpdateModal = (card: PrepaidCard) => {
    setSelectedCard(card);
    setUpdateForm({
      cardNumber: card.cardNumber,
      amount: card.amount,
      isActive: !card.used // Assuming !used means active/available
    });
    setShowUpdateModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedCard) return;
    try {
      setProcessing(true);
      await prepaidCardService.update(selectedCard.id, {
        cardNumber: updateForm.cardNumber,
        amount: updateForm.amount,
        isActive: updateForm.isActive // Maps to used/unused logic in backend?
      });
      toast({ title: 'Success', description: 'Card updated successfully' });
      setShowUpdateModal(false);
      fetchCards();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update card',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCard) return;
    try {
      setProcessing(true);
      await prepaidCardService.delete(selectedCard.id);
      toast({ title: 'Success', description: 'Card deleted successfully' });
      setShowDeleteDialog(false);
      fetchCards();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete card',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = async () => {
    try {
      toast({ title: 'Downloading...', description: 'Preparing your file.' });
      const response = await prepaidCardService.download();

      // If the response is the list data (as per fetchCards)
      // client-side export to Excel
      const cards = response.data?.data || [];
      const exportData = cards.map(c => ({
        'Card Number': c.cardNumber,
        'Amount': c.amount,
        'Status': c.used ? 'Used' : 'Unused',
        'Created At': new Date(c.createdAt).toLocaleDateString(),
        'Used By': c.topUps?.[0]?.user?.fullName || 'N/A',
        'TopUp Date': c.topUps?.[0]?.createdAt ? new Date(c.topUps[0].createdAt).toLocaleDateString() : 'N/A'
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Prepaid Cards");
      XLSX.writeFile(wb, "PrepaidCards_Details.xlsx");

      toast({ title: 'Success', description: 'Download complete.' });
    } catch (error: any) {
        // If it was a generic error
      toast({
        title: 'Error',
        description: 'Failed to download details',
        variant: 'destructive',
      });
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('prepaidCards')}</h1>
          <p className="text-muted-foreground text-sm">{t('managePrepaidCards')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleDownload} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>{t('downloadDetails')}</span>
          </Button>
          <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span>{t('createCards')}</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('totalCards')}</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCard}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('usedCards')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.usedCard}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('unusedCards')}</CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unUsedCard}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('totalSales')}</CardTitle>
              <div className="text-sm font-bold text-green-600">$</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAmountOfSell}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search
            className="absolute ltr:left-2.5 rtl:right-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer"
            onClick={handleSearch}
          />
          <Input
            placeholder={t('searchCards')}
            className="ltr:pl-8 rtl:pr-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-start">{t('cardNumber')}</TableHead>
                <TableHead className="text-start">{t('amount')}</TableHead>
                <TableHead className="text-start">{t('status')}</TableHead>
                <TableHead className="text-start">{t('createdAt')}</TableHead>
                <TableHead className="text-start">{t('usedBy')}</TableHead>
                <TableHead className="text-end">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats?.data?.map((card) => (
                <TableRow key={card.id}>
                  <TableCell className="font-medium font-mono">{card.cardNumber}</TableCell>
                  <TableCell className="font-semibold">${card.amount}</TableCell>
                  <TableCell>
                    <Badge variant={card.used ? 'secondary' : 'default'} className={!card.used ? "bg-green-600 text-white" : ""}>
                      {card.used ? t('used') : t('unused')}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(card.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {card.topUps && card.topUps.length > 0 ? (
                      <div className="flex flex-col text-sm">
                        <span className="font-medium">{card.topUps[0]?.user.fullName}</span>
                        <span className="text-muted-foreground text-xs font-mono">{card.topUps[0]?.user.phoneNumber}</span>
                      </div>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-end">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openUpdateModal(card)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedCard(card); setShowDeleteDialog(true); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!stats?.data || stats.data.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {t('noCardsFound')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 my-4">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="outline"
            size="sm"
          >
            {t('previous', 'Previous')}
          </Button>
          <div className="text-sm text-muted-foreground">
            {page} / {totalPages}
          </div>
          <Button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            variant="outline"
            size="sm"
          >
            {t('next', 'Next')}
          </Button>
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('generatePrepaidCards')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">{t('amount')}</Label>
              <Input
                id="amount"
                type="number"
                value={createForm.amount}
                onChange={(e) => setCreateForm({ ...createForm, amount: Number(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="quantity">{t('quantity')}</Label>
              <Input
                id="quantity"
                type="number"
                value={createForm.quantity}
                onChange={(e) => setCreateForm({ ...createForm, quantity: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>{t('cancel')}</Button>
            <Button onClick={handleCreate} disabled={processing}>
              {processing ? t('generating') : t('generate')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Modal */}
      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('updateCard')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-card">{t('cardNumber')}</Label>
              <Input
                id="edit-card"
                value={updateForm.cardNumber}
                onChange={(e) => setUpdateForm({ ...updateForm, cardNumber: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-amount">{t('amount')}</Label>
              <Input
                id="edit-amount"
                type="number"
                value={updateForm.amount}
                onChange={(e) => setUpdateForm({ ...updateForm, amount: Number(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateModal(false)}>{t('cancel')}</Button>
            <Button onClick={handleUpdate} disabled={processing}>
              {processing ? t('updating', 'Updating...') : t('update', 'Update')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteCard')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteCardConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              {processing ? t('loading') : t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
