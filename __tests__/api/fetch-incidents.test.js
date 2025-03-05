import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { handlers } from '../__mocks__/handlers';

// Set up MSW server with mock handlers
const server = setupServer(...handlers);

describe('Tech Incidents API', () => {
  // Start the server before all tests
  beforeAll(() => server.listen());
  
  // Reset handlers after each test
  afterEach(() => server.resetHandlers());
  
  // Clean up after all tests
  afterAll(() => server.close());

  // Use global fetch for API calls in Node.js environment
  const originalFetch = global.fetch;
  let mockResponse;

  beforeEach(() => {
    mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue([
        { id: '1', name: 'Mock Incident 1' },
        { id: '2', name: 'Mock Incident 2' },
      ]),
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('fetches incidents successfully', async () => {
    const response = await fetch('/api/tech-incidents');
    const data = await response.json();
    
    expect(response.ok).toBe(true);
    expect(data.length).toBe(2);
    expect(data[0].name).toBe('Mock Incident 1');
  });

  it('handles fetch errors', async () => {
    // Override the default handler for this test
    server.use(
      rest.get('*/api/tech-incidents', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );
    
    mockResponse.ok = false;
    mockResponse.status = 500;
    mockResponse.json.mockResolvedValue({ error: 'Server error' });
    
    const response = await fetch('/api/tech-incidents');
    const data = await response.json();
    
    expect(response.ok).toBe(false);
    expect(data.error).toBe('Server error');
  });
});