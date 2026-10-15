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
import { Checkbox } from '@/components/ui/checkbox';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  AlertCircle,
  CheckSquare,
  CreditCard,
  Download,
  Edit,
  FileSpreadsheet,
  FilterX,
  Loader2,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useAuthStore } from '@/stores/auth-store';
import { useEffect, useMemo, useState } from 'react';

export default function PrepaidCardsPage() {
  const { t } = useLanguage();
  const adminTier = useAuthStore((state) => state.adminTier) || 'SUPER_ADMIN';
  const isReadOnly = adminTier === 'READ_ONLY';

  // Data & Pagination
  const [stats, setStats] = useState<PrepaidCardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters State
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>('all');
  const [denominationFilter, setDenominationFilter] = useState<string>('all');
  const [availableDenominations, setAvailableDenominations] = useState<number[]>([]);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal & Action States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [selectedCard, setSelectedCard] = useState<PrepaidCard | null>(null);
  const [processing, setProcessing] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Forms
  const [createForm, setCreateForm] = useState({ amount: 100, quantity: 10 });
  const [updateForm, setUpdateForm] = useState({
    cardNumber: '',
    amount: 0,
    isActive: false,
  });

  // Fetch available denominations
  const fetchDenominations = async () => {
    try {
      const res = await prepaidCardService.getDenominations();
      if (res.data && Array.isArray(res.data)) {
        setAvailableDenominations(res.data);
      }
    } catch {
      // Fallback: keep existing denominations
    }
  };

  useEffect(() => {
    fetchDenominations();
  }, []);

  // Fetch Cards when filters or page change
  useEffect(() => {
    fetchCards();
  }, [page, activeSearch, statusFilter, denominationFilter]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await prepaidCardService.getAll({
        page,
        limit: 10,
        searchTerm: activeSearch || undefined,
        used: statusFilter !== 'all' ? statusFilter : undefined,
        amount: denominationFilter !== 'all' ? denominationFilter : undefined,
      });

      setStats(response.data);
      setTotalCount(response.meta.total || 0);
      setTotalPages(Math.ceil((response.meta.total || 0) / 10));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || t('Failed to load prepaid cards', 'Failed to load prepaid cards'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    setActiveSearch(search);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setActiveSearch('');
    setStatusFilter('all');
    setDenominationFilter('all');
    setPage(1);
  };

  const isFilterActive =
    activeSearch.trim() !== '' ||
    statusFilter !== 'all' ||
    denominationFilter !== 'all';

  // Card Selection Handlers
  const currentPageCards = useMemo(() => stats?.data || [], [stats]);
  const isAllCurrentPageSelected =
    currentPageCards.length > 0 &&
    currentPageCards.every((c) => selectedIds.has(c.id));
  const isSomeCurrentPageSelected =
    currentPageCards.some((c) => selectedIds.has(c.id)) &&
    !isAllCurrentPageSelected;

  const toggleSelectAllCurrentPage = () => {
    const next = new Set(selectedIds);
    if (isAllCurrentPageSelected) {
      currentPageCards.forEach((c) => next.delete(c.id));
    } else {
      currentPageCards.forEach((c) => next.add(c.id));
    }
    setSelectedIds(next);
  };

  const toggleSelectCard = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  // Card Generation
  const handleCreate = async () => {
    if (!createForm.amount || createForm.amount <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Amount must be greater than 0',
        variant: 'destructive',
      });
      return;
    }
    if (!createForm.quantity || createForm.quantity <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Quantity must be at least 1',
        variant: 'destructive',
      });
      return;
    }

    try {
      setProcessing(true);
      const res = await prepaidCardService.create(createForm);
      toast({
        title: 'Success',
        description: `${res.data?.totalCreated || createForm.quantity} prepaid cards generated successfully`,
      });
      setShowCreateModal(false);
      fetchCards();
      fetchDenominations();
      setCreateForm({ amount: 100, quantity: 10 });
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

  // Single Card Delete
  const handleDelete = async () => {
    if (!selectedCard) return;

    if (selectedCard.used) {
      toast({
        title: 'Protected Card',
        description: t('usedCardDeleteProtected'),
        variant: 'destructive',
      });
      setShowDeleteDialog(false);
      return;
    }

    try {
      setProcessing(true);
      await prepaidCardService.delete(selectedCard.id);
      toast({ title: 'Success', description: 'Card deleted successfully' });
      setShowDeleteDialog(false);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(selectedCard.id);
        return next;
      });
      fetchCards();
      fetchDenominations();
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

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;

    try {
      setProcessing(true);
      const res = await prepaidCardService.bulkDelete(Array.from(selectedIds));
      toast({
        title: 'Bulk Delete Completed',
        description: res.data?.message || res.message || 'Cards processed successfully',
      });
      setShowBulkDeleteDialog(false);
      setSelectedIds(new Set());
      fetchCards();
      fetchDenominations();
    } catch (error: any) {
      toast({
        title: 'Bulk Delete Error',
        description: error.response?.data?.message || 'Failed to perform bulk delete',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  // Export Selected or Filtered
  const handleExportSelected = async () => {
    if (selectedIds.size === 0) return;
    try {
      setExporting(true);
      toast({
        title: 'Exporting...',
        description: `Exporting ${selectedIds.size} selected card(s) to Excel.`,
      });
      await prepaidCardService.exportCards({
        ids: Array.from(selectedIds),
      });
      toast({ title: 'Success', description: 'Selected cards exported successfully.' });
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.response?.data?.message || 'Failed to export cards',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportFiltered = async () => {
    try {
      setExporting(true);
      toast({
        title: 'Exporting...',
        description: 'Generating Excel report with active filters.',
      });
      await prepaidCardService.exportCards({
        searchTerm: activeSearch || undefined,
        used: statusFilter !== 'all' ? statusFilter : undefined,
        amount: denominationFilter !== 'all' ? denominationFilter : undefined,
      });
      toast({ title: 'Success', description: 'Cards exported successfully.' });
    } catch (error: any) {
      toast({
        title: 'Export Failed',
        description: error.response?.data?.message || 'Failed to export cards',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const openUpdateModal = (card: PrepaidCard) => {
    setSelectedCard(card);
    setUpdateForm({
      cardNumber: card.cardNumber,
      amount: card.amount,
      isActive: !card.used,
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
        isActive: updateForm.isActive,
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
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
            {t('prepaidCards')}
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {t('managePrepaidCards')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleExportFiltered}
            disabled={exporting}
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            )}
            <span>{t('exportAllFiltered')}</span>
          </Button>
          {!isReadOnly && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center gap-2 w-full sm:w-auto shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>{t('createCards')}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border shadow-xs hover:shadow-sm transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('totalCards')}
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCard}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalCard} generated in total
              </p>
            </CardContent>
          </Card>
          <Card className="border shadow-xs hover:shadow-sm transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('usedCards')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {stats.usedCard}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Redeemed by patients
              </p>
            </CardContent>
          </Card>
          <Card className="border shadow-xs hover:shadow-sm transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('unusedCards')}
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {stats.unUsedCard}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Active & ready to sell
              </p>
            </CardContent>
          </Card>
          <Card className="border shadow-xs hover:shadow-sm transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('totalSales')}
              </CardTitle>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                LYD
              </span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalAmountOfSell.toLocaleString()} LYD
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total value redeemed
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-card p-4 rounded-lg border shadow-xs">
        <div className="flex flex-col sm:flex-row flex-1 gap-3 items-stretch sm:items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              className="absolute ltr:left-3 rtl:right-3 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer"
              onClick={handleSearch}
            />
            <Input
              placeholder={t('searchCards')}
              className="ltr:pl-9 rtl:pr-9 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-[160px]">
            <Select
              value={statusFilter}
              onValueChange={(val: 'all' | 'true' | 'false') => {
                setStatusFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder={t('status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatuses')}</SelectItem>
                <SelectItem value="false">{t('unused')}</SelectItem>
                <SelectItem value="true">{t('used')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Denomination Filter */}
          <div className="w-full sm:w-[180px]">
            <Select
              value={denominationFilter}
              onValueChange={(val) => {
                setDenominationFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder={t('denomination')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allDenominations')}</SelectItem>
                {availableDenominations.map((amount) => (
                  <SelectItem key={amount} value={String(amount)}>
                    {amount} LYD
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reset Filters */}
          {isFilterActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-9 text-muted-foreground hover:text-foreground flex items-center gap-1.5"
            >
              <FilterX className="h-4 w-4" />
              <span>{t('Clear Selection', 'Reset')}</span>
            </Button>
          )}
        </div>

        {/* Total records found */}
        <div className="text-xs text-muted-foreground self-end sm:self-center">
          {totalCount} {t('cardsSelected', 'cards')}
        </div>
      </div>

      {/* Bulk Action Bar (Visible when cards are selected) */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg shadow-xs animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm">
              {selectedIds.size} {t('cardsSelected')}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportSelected}
              disabled={exporting}
              className="h-8 gap-1.5 bg-background shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{t('exportSelected')}</span>
            </Button>

            {!isReadOnly && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowBulkDeleteDialog(true)}
                disabled={processing}
                className="h-8 gap-1.5 shadow-xs"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t('deleteSelected')}</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              className="h-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              <span>{t('clearSelection')}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Cards Table */}
      <div className="rounded-md border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[48px] text-center">
                  <Checkbox
                    checked={
                      isAllCurrentPageSelected
                        ? true
                        : isSomeCurrentPageSelected
                        ? 'indeterminate'
                        : false
                    }
                    onCheckedChange={toggleSelectAllCurrentPage}
                    aria-label="Select all cards on page"
                  />
                </TableHead>
                <TableHead className="text-start">{t('cardNumber')}</TableHead>
                <TableHead className="text-start">{t('amount')}</TableHead>
                <TableHead className="text-start">{t('status')}</TableHead>
                <TableHead className="text-start">{t('createdAt')}</TableHead>
                <TableHead className="text-start">{t('usedBy')}</TableHead>
                <TableHead className="text-end">{t('actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentPageCards.map((card) => {
                const isSelected = selectedIds.has(card.id);
                return (
                  <TableRow
                    key={card.id}
                    className={`transition-colors ${
                      isSelected ? 'bg-primary/5 hover:bg-primary/10' : ''
                    }`}
                  >
                    <TableCell className="text-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelectCard(card.id)}
                        aria-label={`Select card ${card.cardNumber}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium font-mono text-sm tracking-wider">
                      {card.cardNumber}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      {card.amount} LYD
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={card.used ? 'secondary' : 'default'}
                        className={
                          !card.used
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-muted text-muted-foreground'
                        }
                      >
                        {card.used ? t('used') : t('unused')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(card.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {card.topUps && card.topUps.length > 0 ? (
                        <div className="flex flex-col text-xs">
                          <span className="font-medium text-foreground">
                            {card.topUps[0]?.user.fullName}
                          </span>
                          <span className="text-muted-foreground font-mono">
                            {card.topUps[0]?.user.phoneNumber}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-end">
                      {!isReadOnly ? (
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openUpdateModal(card)}
                            className="h-8 w-8 hover:bg-muted"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {/* Delete is only permitted on unused cards */}
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={card.used}
                            title={
                              card.used
                                ? t('usedCardDeleteProtected')
                                : t('deleteCard')
                            }
                            onClick={() => {
                              setSelectedCard(card);
                              setShowDeleteDialog(true);
                            }}
                            className={`h-8 w-8 ${
                              card.used
                                ? 'cursor-not-allowed opacity-30'
                                : 'text-destructive hover:bg-destructive/10'
                            }`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          View Only
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {currentPageCards.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-28 text-center text-muted-foreground"
                  >
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
          <div className="text-sm text-muted-foreground font-mono">
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

      {/* Generate Prepaid Cards Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <span>{t('generatePrepaidCards')}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-3">
            {/* Amount / Denomination */}
            <div className="grid gap-2">
              <Label htmlFor="amount">{t('amount')} (LYD)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                value={createForm.amount}
                onChange={(e) =>
                  setCreateForm({ ...createForm, amount: Number(e.target.value) })
                }
              />
              <div className="flex gap-1.5 flex-wrap pt-1">
                {[10, 20, 50, 100, 200, 500].map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant={createForm.amount === preset ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs px-2.5"
                    onClick={() => setCreateForm({ ...createForm, amount: preset })}
                  >
                    {preset} LYD
                  </Button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="grid gap-2">
              <Label htmlFor="quantity">{t('quantity')}</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="10000"
                value={createForm.quantity}
                onChange={(e) =>
                  setCreateForm({ ...createForm, quantity: Number(e.target.value) })
                }
              />
              <div className="flex gap-1.5 flex-wrap pt-1">
                {[10, 50, 100, 500, 1000].map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant={createForm.quantity === preset ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs px-2.5"
                    onClick={() => setCreateForm({ ...createForm, quantity: preset })}
                  >
                    {preset}
                  </Button>
                ))}
              </div>
            </div>

            {/* Scale efficiency hint */}
            <div className="bg-muted/50 p-2.5 rounded text-xs text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-primary" />
              <span>
                High-speed batch generation handles hundreds of unique cards in milliseconds.
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              disabled={processing}
            >
              {t('cancel')}
            </Button>
            <Button onClick={handleCreate} disabled={processing} className="gap-2">
              {processing && <Loader2 className="h-4 w-4 animate-spin" />}
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
                onChange={(e) =>
                  setUpdateForm({ ...updateForm, cardNumber: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-amount">{t('amount')} (LYD)</Label>
              <Input
                id="edit-amount"
                type="number"
                value={updateForm.amount}
                onChange={(e) =>
                  setUpdateForm({ ...updateForm, amount: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUpdateModal(false)}
              disabled={processing}
            >
              {t('cancel')}
            </Button>
            <Button onClick={handleUpdate} disabled={processing}>
              {processing ? t('updating', 'Updating...') : t('update', 'Update')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteCard')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteCardConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={processing}
              className="bg-destructive hover:bg-destructive/90"
            >
              {processing ? t('loading') : t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirm Dialog */}
      <AlertDialog
        open={showBulkDeleteDialog}
        onOpenChange={setShowBulkDeleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              <span>{t('bulkDeleteConfirmTitle')}</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-start">
              <p>
                {t(
                  'bulkDeleteConfirmDesc',
                  'Are you sure you want to delete the selected unused cards? Used cards will be safely protected from deletion to preserve financial audit history.'
                )}
              </p>
              <div className="bg-destructive/10 text-destructive text-xs p-2.5 rounded font-medium">
                {selectedIds.size} cards selected for deletion.
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={processing}
              className="bg-destructive hover:bg-destructive/90 gap-2"
            >
              {processing && <Loader2 className="h-4 w-4 animate-spin" />}
              {processing ? t('loading') : t('deleteSelected')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
