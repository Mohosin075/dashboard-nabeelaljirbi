/**
 * 📊 Data Table Test Page
 *
 * Test advanced data table with all features
 */

'use client'

import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Mail, MapPin } from 'lucide-react'

import { DataTable, DataTableColumnHeader } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

// Sample data type
export type User = {
  id: string
  name: string
  email: string
  role: 'admin' | 'user' | 'guest'
  status: 'active' | 'inactive' | 'pending'
  company: string
  location: string
  joinedAt: string
}

// Sample data
const users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    status: 'active',
    company: 'Acme Inc.',
    location: 'New York, USA',
    joinedAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    status: 'active',
    company: 'TechCorp',
    location: 'San Francisco, USA',
    joinedAt: '2024-02-20',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'user',
    status: 'inactive',
    company: 'StartupXYZ',
    location: 'London, UK',
    joinedAt: '2024-03-10',
  },
  {
    id: '4',
    name: 'Alice Williams',
    email: 'alice@example.com',
    role: 'guest',
    status: 'pending',
    company: 'FreelanceHub',
    location: 'Berlin, Germany',
    joinedAt: '2024-04-05',
  },
  {
    id: '5',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    role: 'admin',
    status: 'active',
    company: 'Acme Inc.',
    location: 'Tokyo, Japan',
    joinedAt: '2024-01-22',
  },
  {
    id: '6',
    name: 'Diana Prince',
    email: 'diana@example.com',
    role: 'user',
    status: 'active',
    company: 'TechCorp',
    location: 'Paris, France',
    joinedAt: '2024-02-14',
  },
  {
    id: '7',
    name: 'Ethan Hunt',
    email: 'ethan@example.com',
    role: 'user',
    status: 'active',
    company: 'MissionCorp',
    location: 'Dubai, UAE',
    joinedAt: '2024-03-18',
  },
  {
    id: '8',
    name: 'Fiona Green',
    email: 'fiona@example.com',
    role: 'guest',
    status: 'pending',
    company: 'GreenTech',
    location: 'Sydney, Australia',
    joinedAt: '2024-04-12',
  },
  {
    id: '9',
    name: 'George Miller',
    email: 'george@example.com',
    role: 'user',
    status: 'inactive',
    company: 'MillerCo',
    location: 'Toronto, Canada',
    joinedAt: '2024-02-28',
  },
  {
    id: '10',
    name: 'Hannah Davis',
    email: 'hannah@example.com',
    role: 'admin',
    status: 'active',
    company: 'DataSystems',
    location: 'Singapore',
    joinedAt: '2024-01-30',
  },
  {
    id: '11',
    name: 'Ian McKellen',
    email: 'ian@example.com',
    role: 'user',
    status: 'active',
    company: 'WizardTech',
    location: 'Wellington, NZ',
    joinedAt: '2024-03-25',
  },
  {
    id: '12',
    name: 'Julia Roberts',
    email: 'julia@example.com',
    role: 'user',
    status: 'active',
    company: 'MovieCorp',
    location: 'Los Angeles, USA',
    joinedAt: '2024-02-08',
  },
]

export default function DataTableTestPage() {
  const { toast } = useToast()

  // Column definitions
  const columns: ColumnDef<User>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{row.getValue('email')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
      cell: ({ row }) => {
        const role = row.getValue('role') as string
        return (
          <Badge
            variant={
              role === 'admin' ? 'default' : role === 'user' ? 'secondary' : 'outline'
            }
          >
            {role}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.getValue('status') as string
        return (
          <Badge
            variant={
              status === 'active'
                ? 'default'
                : status === 'inactive'
                  ? 'secondary'
                  : 'outline'
            }
          >
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'company',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Company" />,
      cell: ({ row }) => <div>{row.getValue('company')}</div>,
    },
    {
      accessorKey: 'location',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Location" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{row.getValue('location')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'joinedAt',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
      cell: ({ row }) => {
        const date = new Date(row.getValue('joinedAt'))
        return <div className="text-sm">{date.toLocaleDateString()}</div>
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  navigator.clipboard.writeText(user.id)
                  toast({
                    title: 'Copied!',
                    description: 'User ID copied to clipboard',
                  })
                }}
              >
                Copy user ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  toast({
                    title: 'View user',
                    description: `Viewing ${user.name}`,
                  })
                }}
              >
                View user
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  toast({
                    title: 'Edit user',
                    description: `Editing ${user.name}`,
                  })
                }}
              >
                Edit user
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  toast({
                    variant: 'destructive',
                    title: 'Delete user',
                    description: `${user.name} would be deleted`,
                  })
                }}
                className="text-destructive"
              >
                Delete user
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const handleRowClick = (user: User) => {
    toast({
      title: 'Row clicked',
      description: `You clicked on ${user.name}`,
    })
  }

  const handleBulkAction = (action: string, rows: User[]) => {
    toast({
      title: 'Bulk action',
      description: `${action} action on ${rows.length} user(s)`,
    })
    console.log('Bulk action:', action, rows)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-bold">Advanced Data Table</h1>
        <p className="text-muted-foreground">
          Full-featured data table with sorting, filtering, pagination, and more
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users Table</CardTitle>
          <CardDescription>
            Manage your users with advanced table features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={users}
            searchPlaceholder="Search users..."
            onRowClick={handleRowClick}
            onBulkAction={handleBulkAction}
            enableRowSelection={true}
            enableColumnVisibility={true}
            enableExport={true}
            pageSize={10}
          />
        </CardContent>
      </Card>

      {/* Features Documentation */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold">Core Features</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Global search across all columns</li>
                <li>Column-specific filtering</li>
                <li>Multi-column sorting (click headers)</li>
                <li>Pagination with customizable page size</li>
                <li>Row selection (single & bulk)</li>
                <li>Column visibility toggle</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">Advanced Features</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Export to CSV/JSON</li>
                <li>Bulk actions on selected rows</li>
                <li>Row click handlers</li>
                <li>Loading states</li>
                <li>Empty state with message</li>
                <li>Responsive design</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">Try It Out</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Search for users by name, email, or company</li>
                <li>Click column headers to sort</li>
                <li>Select rows and use bulk actions</li>
                <li>Toggle column visibility</li>
                <li>Export data to CSV or JSON</li>
                <li>Click on a row to see toast notification</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">Usage</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Built with TanStack Table v8</li>
                <li>Fully typed with TypeScript</li>
                <li>Customizable column definitions</li>
                <li>Flexible data filtering</li>
                <li>Easy to integrate with APIs</li>
                <li>shadcn/ui components</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
