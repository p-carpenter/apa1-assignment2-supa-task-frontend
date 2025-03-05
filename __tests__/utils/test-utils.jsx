import React from 'react';
import { render } from '@testing-library/react';
import { IncidentProvider } from '@/app/contexts/IncidentContext';

// Mock incidents data
export const mockIncidents = [
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

// Create mock theme context to avoid circular dependency
const MockThemeContext = React.createContext({
  decade: 1990,
  theme: {
    name: "Windows 95",
    background: "bg-[#008080]",
    text: "text-black",
    fontFamily: "font-WFA95",
    accent: "bg-win95gray",
  },
  GalleryDisplay: ({ incident }) => (
    <div data-testid="mock-gallery-display">
      {incident?.name || 'No incident'}
    </div>
  ),
});

export const useTheme = () => React.useContext(MockThemeContext);

// Mock ThemeProvider
export const MockThemeProvider = ({ children }) => {
  return (
    <MockThemeContext.Provider value={{
      decade: 1990,
      theme: {
        name: "Windows 95",
        background: "bg-[#008080]",
        text: "text-black",
        fontFamily: "font-WFA95",
        accent: "bg-win95gray",
      },
      GalleryDisplay: ({ incident }) => (
        <div data-testid="mock-gallery-display">
          {incident?.name || 'No incident'}
        </div>
      )
    }}>
      {children}
    </MockThemeContext.Provider>
  );
};

// Custom render function that includes providers
export const customRender = (ui, options = {}) => {
  const {
    incidents = mockIncidents,
    ...renderOptions
  } = options;

  const Wrapper = ({ children }) => (
    <IncidentProvider incidents={incidents}>
      <MockThemeProvider>
        {children}
      </MockThemeProvider>
    </IncidentProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

export * from '@testing-library/react';

export { customRender as render };

// Add a simple test to ensure the file doesn't fail Jest's requirement for a test
describe('Test Utils', () => {
  it('exports custom render function', () => {
    expect(typeof customRender).toBe('function');
  });
  
  it('exports mock data', () => {
    expect(Array.isArray(mockIncidents)).toBe(true);
    expect(mockIncidents.length).toBe(2);
  });
});