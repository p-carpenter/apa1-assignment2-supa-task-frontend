import { render, screen, fireEvent, within } from '@testing-library/react';
import { IncidentProvider } from '@/app/contexts/IncidentContext';
import IncidentGrid from '@/app/components/layouts/IncidentGrid';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ href, children, onClick, className }) => {
    return (
      <a href={href} onClick={onClick} className={className}>
        {children}
      </a>
    );
  };
});

// Mock ThemeProvider to avoid circular dependency
jest.mock('@/app/contexts/ThemeContext', () => {
  return {
    ThemeProvider: ({ children }) => <div data-testid="mock-theme-provider">{children}</div>,
    useTheme: () => ({
      decade: 1990,
      theme: {
        name: "Windows 95",
        background: "bg-[#008080]",
        text: "text-black",
        fontFamily: "font-WFA95",
        accent: "bg-win95gray",
      },
      GalleryDisplay: ({ incident }) => <div data-testid="mock-gallery-display">{incident?.name || 'No incident'}</div>
    })
  };
});


const mockGenerateSlug = jest.fn((name) => name?.toLowerCase().replace(/\s+/g, '-') || 'unknown');
const mockGetCategoryIcon = jest.fn(() => '🔷');
const mockGetSeverityIcon = jest.fn(() => '⚠️');


jest.mock('@/app/utils/navigation/slugUtils', () => ({
  generateSlug: (name) => mockGenerateSlug(name)
}));

jest.mock('@/app/utils/ui/categoryIcons', () => ({
  getCategoryIcon: (category) => mockGetCategoryIcon(category)
}));

jest.mock('@/app/utils/ui/severityIcons', () => ({
  getSeverityIcon: (severity) => mockGetSeverityIcon(severity)
}));

describe('IncidentGrid Component', () => {
  const mockGridIncidents = [
    {
      id: '1',
      name: 'Test Incident 1',
      category: 'Software',
      incident_date: '2000-01-01',
    },
    {
      id: '2',
      name: 'Test Incident 2',
      category: 'Hardware',
      incident_date: '1990-05-15',
    },
  ];

  const mockGetIncidentYear = (incident) => {
    return new Date(incident.incident_date).getFullYear();
  };

  // Custom render function with IncidentProvider
  const customRender = (ui, options = {}) => {
    const Wrapper = ({ children }) => (
      <IncidentProvider incidents={mockGridIncidents}>
        {children}
      </IncidentProvider>
    );
    return render(ui, { wrapper: Wrapper, ...options });
  };

  it('renders incidents correctly', () => {
    customRender(
      <IncidentGrid 
        incidents={mockGridIncidents} 
        isLoading={false}
        getIncidentYear={mockGetIncidentYear}
      />
    );
    
    expect(screen.getByText('Test Incident 1')).toBeInTheDocument();
    expect(screen.getByText('Test Incident 2')).toBeInTheDocument();
    expect(screen.getByText(/Software/)).toBeInTheDocument();
    expect(screen.getByText(/Hardware/)).toBeInTheDocument();
  });

  it('displays loading state', () => {
    const { container } = customRender(
      <IncidentGrid 
        incidents={[]} 
        isLoading={true}
        getIncidentYear={mockGetIncidentYear}
      />
    );
    
    // Check for loading cards
    const loadingCards = container.querySelectorAll('.loading-card');
    expect(loadingCards.length).toBe(8); // The component creates 8 loading cards
  });

  it('displays empty message when no incidents', () => {
    customRender(
      <IncidentGrid 
        incidents={[]} 
        isLoading={false}
        emptyMessage="No incidents found"
        getIncidentYear={mockGetIncidentYear}
      />
    );
    
    // Find the text within the component (which has "Error: " prefix)
    const errorElement = screen.getByText(/Error:/);
    expect(errorElement.textContent).toContain('No incidents found');
  });

  it('calls onIncidentSelect when incident is clicked', () => {
    const handleSelect = jest.fn();
    
    customRender(
      <IncidentGrid 
        incidents={mockGridIncidents} 
        isLoading={false}
        onIncidentSelect={handleSelect}
        getIncidentYear={mockGetIncidentYear}
      />
    );
    
    fireEvent.click(screen.getByText('Test Incident 1'));
    expect(handleSelect).toHaveBeenCalledWith(mockGridIncidents[0]);
  });
});