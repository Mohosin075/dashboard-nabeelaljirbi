/**
 * 📊 Advanced Data Table Component
 *
 * Powerful data table with all features:
 * - Sorting (single & multi-column)
 * - Filtering (global & column-specific)
 * - Pagination
 * - Row selection (single & bulk)
 * - Column visibility toggle
 * - Export to CSV/JSON
 * - Responsive design
 * - Loading & empty states
 */

'use client'

import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  ArrowUpDown,
  ChevronDown,
  Download,
  Eye,
  Filter,
  Search,
  Trash2,
  X,
} from 'lucide-react'
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchPlaceholder?: string
  onRowClick?: (row: TData) => void
  onBulkAction?: (action: string, rows: TData[]) => void
  enableRowSelection?: boolean
  enableColumnVisibility?: boolean
  enableExport?: boolean
  isLoading?: boolean
  pageSize?: number
  // Server-side pagination props
  isServerSide?: boolean
  currentPage?: number
  totalPages?: number
  totalItems?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = 'Search...',
  onRowClick,
  onBulkAction,
  enableRowSelection = true,
  enableColumnVisibility = true,
  enableExport = true,
  isLoading = false,
  pageSize = 10,
  // Server-side pagination props
  isServerSide = false,
  currentPage = 0,
  totalPages = 0,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<TData, TValue>) {
  const { toast } = useToast()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState('')

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    ...(isServerSide ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      ...(isServerSide ? {} : {
        pagination: {
          pageIndex: currentPage,
          pageSize,
        },
      }),
    },
    ...(isServerSide ? {} : {
      initialState: {
        pagination: {
          pageSize,
        },
      },
    }),
    manualPagination: isServerSide,
    ...(isServerSide ? { pageCount: totalPages } : {}),
  })

  // Export to CSV
  const exportToCSV = () => {
    const rows = table.getFilteredRowModel().rows
    if (rows.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No data to export',
        description: 'Please adjust your filters or add data.',
      })
      return
    }

    // Get visible columns
    const visibleColumns = table.getVisibleFlatColumns()
    const headers = visibleColumns
      .filter((col) => col.id !== 'select' && col.id !== 'actions')
      .map((col) => col.id)

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        headers
          .map((header) => {
            const cell = row.getValue(header)
            // Escape commas and quotes
            const value = String(cell || '').replace(/"/g, '""')
            return `"${value}"`
          })
          .join(',')
      ),
    ].join('\n')

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `export_${new Date().getTime()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: 'Export successful',
      description: `Exported ${rows.length} rows to CSV.`,
    })
  }

  // Export to JSON
  const exportToJSON = () => {
    const rows = table.getFilteredRowModel().rows
    if (rows.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No data to export',
        description: 'Please adjust your filters or add data.',
      })
      return
    }

    const jsonData = rows.map((row) => row.original)
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: 'application/json',
    })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `export_${new Date().getTime()}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: 'Export successful',
      description: `Exported ${rows.length} rows to JSON.`,
    })
  }

  // Bulk actions
  const handleBulkAction = (action: string) => {
    const selectedRows = table.getFilteredSelectedRowModel().rows.map((row) => row.original)

    if (selectedRows.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No rows selected',
        description: 'Please select rows to perform bulk actions.',
      })
      return
    }

    if (onBulkAction) {
      onBulkAction(action, selectedRows)
    }

    // Reset selection after action
    setRowSelection({})
  }

  const selectedCount = table.getFilteredSelectedRowModel().rows.length

  return (
    <div className="w-full space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={globalFilter ?? ''}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-10"
            />
            {globalFilter && (
              <button
                onClick={() => setGlobalFilter('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Bulk Actions */}
          {enableRowSelection && selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedCount} selected
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Actions
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleBulkAction('delete')}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleBulkAction('export')}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Selected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* Right Toolbar */}
        <div className="flex items-center gap-2">
          {/* Column Visibility */}
          {enableColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  Columns
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    )
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Export */}
          {enableExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export Data</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={exportToCSV}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToJSON}>
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="ml-2 text-muted-foreground">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn(onRowClick && 'cursor-pointer')}
                  onClick={() => onRowClick && onRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Filter className="mb-2 h-8 w-8" />
                    <p>No results found.</p>
                    <p className="text-sm">Try adjusting your search or filters.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {isServerSide ? (
              `Showing ${data.length} of ${totalItems} results`
            ) : (
              `Showing ${table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to ${Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )} of ${table.getFilteredRowModel().rows.length} results`
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Rows per page:</span>
            <Select
              value={`${isServerSide ? pageSize : table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                const newPageSize = Number(value)
                if (isServerSide && onPageSizeChange) {
                  onPageSizeChange(newPageSize)
                } else {
                  table.setPageSize(newPageSize)
                }
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={isServerSide ? pageSize : table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 30, 40, 50].map((pageSizeOption) => (
                  <SelectItem key={pageSizeOption} value={`${pageSizeOption}`}>
                    {pageSizeOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isServerSide && onPageChange) {
                  onPageChange(0)
                } else {
                  table.setPageIndex(0)
                }
              }}
              disabled={isServerSide ? currentPage === 0 : !table.getCanPreviousPage()}
            >
              {'<<'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isServerSide && onPageChange) {
                  onPageChange(currentPage - 1)
                } else {
                  table.previousPage()
                }
              }}
              disabled={isServerSide ? currentPage === 0 : !table.getCanPreviousPage()}
            >
              {'<'}
            </Button>
            <div className="flex items-center gap-1 px-2">
              <span className="text-sm">
                Page {isServerSide ? currentPage + 1 : table.getState().pagination.pageIndex + 1} of{' '}
                {isServerSide ? totalPages : table.getPageCount()}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isServerSide && onPageChange) {
                  onPageChange(currentPage + 1)
                } else {
                  table.nextPage()
                }
              }}
              disabled={isServerSide ? currentPage >= totalPages - 1 : !table.getCanNextPage()}
            >
              {'>'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isServerSide && onPageChange) {
                  onPageChange(totalPages - 1)
                } else {
                  table.setPageIndex(table.getPageCount() - 1)
                }
              }}
              disabled={isServerSide ? currentPage >= totalPages - 1 : !table.getCanNextPage()}
            >
              {'>>'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper component for sortable column headers
export function DataTableColumnHeader({
  column,
  title,
  className,
}: {
  column: Column<any, unknown>
  title: string
  className?: string
}) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8 data-[state=open]:bg-accent"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        <span>{title}</span>
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}
