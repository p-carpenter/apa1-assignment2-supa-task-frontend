import { rest } from 'msw';

export const handlers = [
  // GET all incidents
  rest.get('*/api/tech-incidents', (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: '1',
          name: 'Mock Incident 1',
          category: 'Software',
          severity: 3,
          incident_date: '2000-01-01',
          description: 'Mock description 1',
        },
        {
          id: '2',
          name: 'Mock Incident 2',
          category: 'Hardware',
          severity: 4,
          incident_date: '1990-05-15',
          description: 'Mock description 2',
        },
      ])
    );
  }),
  
  // POST new incident
  rest.post('*/api/new-incident', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ success: true, id: '3' })
    );
  }),
  
  // PUT update incident
  rest.put('*/api/update-incident', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ success: true })
    );
  }),
  
  // DELETE incident
  rest.delete('*/api/delete-incident', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ success: true })
    );
  }),
];

// Add a test for the handlers file itself to ensure it's not empty
describe('MSW Handlers', () => {
  it('defines API handlers', () => {
    expect(handlers.length).toBeGreaterThan(0);
  });
});