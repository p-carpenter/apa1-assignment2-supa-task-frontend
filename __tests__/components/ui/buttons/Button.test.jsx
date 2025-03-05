import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/app/components/ui/buttons/Button';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ href, children, className, onClick }) => {
    return (
      <a href={href} className={className} onClick={onClick}>
        {children}
      </a>
    );
  };
});

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    render(<Button />);
    const linkElement = screen.getByRole('link');
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveTextContent('BACK TO HOMEPAGE');
  });

  it('renders with custom label', () => {
    render(<Button label="Custom Text" />);
    expect(screen.getByText('Custom Text')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} label="Click Me" />);
    
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<Button className="custom-class" />);
    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveClass('custom-class');
    expect(linkElement).toHaveClass('home-button'); // Also has default class
  });

  it('renders with custom icon', () => {
    render(<Button icon="→" />);
    const iconElement = screen.getByText('→');
    expect(iconElement).toBeInTheDocument();
    expect(iconElement).toHaveClass('home-icon');
  });

  it('uses custom href', () => {
    render(<Button href="/custom-path" />);
    const linkElement = screen.getByRole('link');
    expect(linkElement).toHaveAttribute('href', '/custom-path');
  });
});