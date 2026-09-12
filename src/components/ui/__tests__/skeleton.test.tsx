import { render } from '@testing-library/react'
import {
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  ListSkeleton,
  DashboardSkeleton,
} from '../skeleton'

describe('Skeleton Components', () => {
  it('should render basic Skeleton', () => {
    const { container } = render(<Skeleton />)
    expect(container.firstChild).toHaveClass('animate-pulse')
    expect(container.firstChild).toHaveClass('rounded-md')
  })

  it('should render CardSkeleton', () => {
    const { container } = render(<CardSkeleton />)
    expect(container.querySelector('.rounded-lg')).toBeInTheDocument()
  })

  it('should render TableSkeleton with custom rows', () => {
    const { container } = render(<TableSkeleton rows={3} />)
    // 1 header + 3 rows = 4 skeletons
    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(4)
  })

  it('should render ListSkeleton with custom items', () => {
    const { container } = render(<ListSkeleton items={3} />)
    expect(container.querySelectorAll('.flex.items-center')).toHaveLength(3)
  })

  it('should render DashboardSkeleton', () => {
    const { container } = render(<DashboardSkeleton />)
    expect(container.querySelector('.grid')).toBeInTheDocument()
  })

  it('should accept custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
