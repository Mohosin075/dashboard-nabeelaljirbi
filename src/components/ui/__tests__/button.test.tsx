import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
    it('renders with default variant', () => {
        const { getByRole } = render(<Button>Click me</Button>);
        const button = getByRole('button', { name: /click me/i });
        expect(button).toBeInTheDocument();
    });

    it('renders with different variants', () => {
        const { rerender, getByRole } = render(<Button variant="destructive">Delete</Button>);
        const button = getByRole('button');
        expect(button.className).toContain('bg-destructive');

        rerender(<Button variant="outline">Cancel</Button>);
        expect(button.className).toContain('border');
    });

    it('renders with different sizes', () => {
        const { getByRole } = render(<Button size="sm">Small</Button>);
        const button = getByRole('button');
        expect(button.className).toContain('h-9');
    });

    it('can be disabled', () => {
        const { getByRole } = render(<Button disabled>Disabled</Button>);
        expect(getByRole('button')).toBeDisabled();
    });
});