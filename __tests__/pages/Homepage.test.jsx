import { render, screen, fireEvent } from '@testing-library/react';
import Home from '@/app/page';
import { IncidentProvider } from '@/app/contexts/IncidentContext';
import React from 'react';

// Mock ThemeProvider to avoid circular dependency
jest.mock('@/app/contexts/ThemeContext', () => {
  const originalModule = jest.requireActual('@/app/contexts/ThemeContext');
  
  return {
    ...originalModule,
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

// Custom render function with providers
const customRender = (ui, options = {}) => {
  const mockIncidents = [
    {
      id: '1',
      name: 'Test Incident 1',
      category: 'Software',
      severity: 3,
      incident_date: '2000-01-01',
      description: 'Test description 1',
    },
    {
      id: '2',
      name: 'Test Incident 2',
      category: 'Hardware',
      severity: 4,
      incident_date: '1990-05-15',
      description: 'Test description 2',
    },
  ];

  const Wrapper = ({ children }) => (
    <IncidentProvider incidents={mockIncidents}>
      {children}
    </IncidentProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

describe('Home Page', () => {
  it('renders page correctly', () => {
    customRender(<Home />);
    
    // Check main elements
    expect(screen.getByText(/Database loaded successfully/i)).toBeInTheDocument();
    expect(screen.getByText(/EXPLORE ARCHIVE/i)).toBeInTheDocument();
  });

  it('opens info modal when "What is" link is clicked', () => {
    customRender(<Home />);
    
    // Find and click the learn more link
    const learnMoreButton = screen.getByText(/What is the Tech Incidents Archive\?/i);
    fireEvent.click(learnMoreButton);
    
    // Modal should appear
    expect(screen.getByText(/The Tech Incidents Archive is a digital museum/i)).toBeInTheDocument();
  });

  it('changes button text when donation button is clicked', () => {
    customRender(<Home />);
    
    // Find and click the dismiss button
    const dismissButton = screen.getByText(/Maybe Later/i);
    fireEvent.click(dismissButton);
    
    // Button text should change
    expect(screen.getByText(/Donate £100/i)).toBeInTheDocument();
  });
});