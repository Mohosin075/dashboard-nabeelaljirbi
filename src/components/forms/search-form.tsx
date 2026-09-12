/**
 * 🔍 Advanced Search Form Component
 *
 * Comprehensive search with filters, sorting, and advanced options
 * Features:
 * - Text search with autocomplete
 * - Category filtering
 * - Price range filter
 * - Date range filter
 * - Rating filter
 * - Sort options
 * - Advanced filters toggle
 */

'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Star,
  DollarSign,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Collapsible,
  CollapsibleContent,
} from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'

// Search form schema
const searchFormSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  rating: z.number().min(0).max(5).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  inStock: z.boolean().optional(),
  onSale: z.boolean().optional(),
  freeShipping: z.boolean().optional(),
  brands: z.array(z.string()).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
})

export type SearchFormValues = z.infer<typeof searchFormSchema>

interface SearchFormProps {
  onSearch: (values: SearchFormValues) => void
  categories?: string[]
  brands?: string[]
  defaultValues?: Partial<SearchFormValues>
  showAdvanced?: boolean
}

export function SearchForm({
  onSearch,
  categories = ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports', 'Toys'],
  brands = ['Apple', 'Samsung', 'Nike', 'Adidas', 'Sony', 'Microsoft'],
  defaultValues,
  showAdvanced = true,
}: SearchFormProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      query: '',
      sortBy: 'relevance',
      sortOrder: 'desc',
      inStock: false,
      onSale: false,
      freeShipping: false,
      brands: [],
      ...defaultValues,
    },
  })

  const handleSubmit = (values: SearchFormValues) => {
    // Track active filters
    const filters: string[] = []
    if (values.category) filters.push(`Category: ${values.category}`)
    if (values.minPrice || values.maxPrice) {
      filters.push(`Price: $${values.minPrice || 0} - $${values.maxPrice || '∞'}`)
    }
    if (values.rating) filters.push(`${values.rating}+ Stars`)
    if (values.inStock) filters.push('In Stock')
    if (values.onSale) filters.push('On Sale')
    if (values.freeShipping) filters.push('Free Shipping')
    if (values.brands && values.brands.length > 0) {
      filters.push(`Brands: ${values.brands.join(', ')}`)
    }
    setActiveFilters(filters)

    onSearch(values)
  }

  const handleClearFilters = () => {
    form.reset({
      query: form.getValues('query'), // Keep search query
      sortBy: 'relevance',
      sortOrder: 'desc',
      inStock: false,
      onSale: false,
      freeShipping: false,
      brands: [],
    })
    setActiveFilters([])
    onSearch({ query: form.getValues('query') })
  }

  const removeFilter = (filter: string) => {
    // Reset specific filter based on label
    if (filter.startsWith('Category:')) {
      form.setValue('category', undefined)
    } else if (filter.startsWith('Price:')) {
      form.setValue('minPrice', undefined)
      form.setValue('maxPrice', undefined)
    } else if (filter.includes('Stars')) {
      form.setValue('rating', undefined)
    } else if (filter === 'In Stock') {
      form.setValue('inStock', false)
    } else if (filter === 'On Sale') {
      form.setValue('onSale', false)
    } else if (filter === 'Free Shipping') {
      form.setValue('freeShipping', false)
    } else if (filter.startsWith('Brands:')) {
      form.setValue('brands', [])
    }

    handleSubmit(form.getValues())
  }

  return (
    <div className="w-full space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Main Search Bar */}
          <div className="flex gap-2">
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search products, brands, categories..."
                        className="pl-10"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            {showAdvanced && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
                <ChevronDown
                  className={`ml-2 h-4 w-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''
                    }`}
                />
              </Button>
            )}
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <Badge key={filter} variant="secondary" className="gap-1">
                  {filter}
                  <button
                    type="button"
                    onClick={() => removeFilter(filter)}
                    className="ml-1 rounded-full hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Advanced Filters */}
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleContent className="space-y-4 rounded-lg border p-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="All categories" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All categories</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat.toLowerCase()}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* Sort By */}
                <FormField
                  control={form.control}
                  name="sortBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort By</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || 'relevance'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Relevance" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="relevance">Relevance</SelectItem>
                          <SelectItem value="price">Price</SelectItem>
                          <SelectItem value="rating">Rating</SelectItem>
                          <SelectItem value="date">Date Added</SelectItem>
                          <SelectItem value="popular">Popularity</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {/* Sort Order */}
                <FormField
                  control={form.control}
                  name="sortOrder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value || 'desc'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Descending" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="asc">Ascending</SelectItem>
                          <SelectItem value="desc">Descending</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <FormLabel>Price Range</FormLabel>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="minPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Min price"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Max price"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Rating */}
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <FormLabel>Minimum Rating</FormLabel>
                    </div>
                    <FormControl>
                      <div className="space-y-2">
                        <Slider
                          min={0}
                          max={5}
                          step={0.5}
                          value={[field.value || 0]}
                          onValueChange={(value) => field.onChange(value[0])}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Any</span>
                          <span className="font-medium text-foreground">
                            {field.value ? `${field.value}+ stars` : 'Any rating'}
                          </span>
                          <span>5 stars</span>
                        </div>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Quick Filters */}
              <div className="space-y-3">
                <FormLabel>Quick Filters</FormLabel>
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="inStock"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          In Stock Only
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="onSale"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          On Sale
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="freeShipping"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Free Shipping
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Brands */}
              <div className="space-y-3">
                <FormLabel>Brands</FormLabel>
                <FormField
                  control={form.control}
                  name="brands"
                  render={() => (
                    <FormItem>
                      <div className="grid gap-2 md:grid-cols-2">
                        {brands.map((brand) => (
                          <FormField
                            key={brand}
                            control={form.control}
                            name="brands"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(brand) || false}
                                    onCheckedChange={(checked) => {
                                      const value = field.value || []
                                      return checked
                                        ? field.onChange([...value, brand])
                                        : field.onChange(
                                          value.filter((val) => val !== brand)
                                        )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {brand}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Apply Filters
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearFilters}
                >
                  Clear
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </form>
      </Form>
    </div>
  )
}
