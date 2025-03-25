# Tech Incidents Archive

![](/public/readme-assets/homepage.gif)

A digital museum website showcasing significant technological failures ("incidents") throughout computing history. This website provides an interactive, historically-themed interface for exploring and cataloguing technology incidents.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Usage](#usage)
  - [Viewing Incidents](#viewing-incidents)
  - [Filtering and Searching](#filtering-and-searching)
  - [Adding New Incidents](#adding-new-incidents)
  - [Updating or Deleting Incidents](#updating-or-deleting-incidents)
- [API Routes](#api-routes)
- [Era-Specific Theming](#era-specific-theming)
- [Authentication](#authentication)
- [Database Schema](#database-schema)
- [State Management](#state-management)
- [Testing](#testing)
- [Deployment](#deployment)
- [Accessibility](#accessibility)
- [Code Standards](#code-standards)
- [Performance](#performance)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)

## Overview

The Tech Incidents Archive presents incidents through a museum exhibit-themed gallery, showcasing events like the Y2K Bug, the Morris Worm, and other famous hardware/software failures throughout tech history. Some of the incidents displayed in the gallery allow users to interact with the artifacts and become immersed in the incident. Detail windows to the right of the artifacts are themed according to the decade.

Registered users are able to edit, add and delete incidents in the catalog.

## Features

- **Interactive Museum Interface**: Designed as a digital museum with a retro computing aesthetic
- **Era-Specific Visualisation**: Different detail window themes based on the decade of the incident
- **Comprehensive Catalog**: Browse all incidents with sorting and filtering capabilities
- **Advanced Search**: Find incidents by name, description, or category
- **Year-Based Navigation**: Browse incidents organized by year
- **Detailed Gallery View**: Explore incidents with era-appropriate visual presentations
- **Contribute after Registration**: Sign up to add, view, update, and delete incident records

## Tech Stack

- **Frontend Framework**: [Next.js](https://nextjs.org/)
- **UI Library**: [React](https://reactjs.org/)
- **Styling**:
  - CSS Modules
- **Backend**:
  - Next.js API Routes (for proxy endpoints)
  - [Supabase Edge Functions](https://supabase.com/docs/guides/functions) (for database operations)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Storage** (for community-added optional artifact images): [Supabase](https://supabase.com/)
- **Icons**: [Lucide React](https://lucide.dev/docs/lucide-react)

## Project Structure

- `/app`: Main application code
  - `/api`: API route handlers for Supabase interactions
  - `/catalog`: Catalog page components for browsing incidents
  - `/components`: Reusable UI components
    - `/forms`: Form components for user inputs
    - `/layouts`: Layout components for page structure
    - `/ui`: UI elements and interactive components
  - `/contexts`: React contexts for state management
    - `AuthContext.jsx`: Authentication state management
    - `IncidentContext.jsx`: Incident data state management
    - `ThemeContext.jsx`: Era-specific theme management
  - `/gallery`: Gallery view components
  - `/hooks`: Custom React hooks
  - `/login`, `/signup`, `/profile`, `/reset_password`: Authentication-related pages
  - `/utils`: Utility functions for data processing and formatting

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- A [Supabase](https://supabase.com/) account and project

### Installation

1. Clone the repository:

   ```bash
   git clone hhttps://github.com/p-carpenter/apa1-assignment2-supa-task-frontend
   cd apa1-assignment2-supa-task-frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables (see section below)
4. Run the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Environment Variables

Create a `.env` file in the project root with the following variables:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Usage

### Viewing Incidents

1. **Home Page**: The landing page provides an introduction to the digital museum with a link to explore the archive.
2. **Catalog**: View all incidents in a grid format with sorting and filtering options.
3. **Gallery**: Click on any incident in the catalog to view detailed information in an era-appropriate interface.

### Filtering and Searching

In the catalog page:

1. Use the year dropdown to filter incidents by year
2. Use the category dropdown to filter by incident category (Hardware, Software, Security, etc.)
3. Use the search bar to find incidents by name, description, year of incident, or category
4. Use the sort dropdown to order incidents by year, name, or severity

![](/public/readme-assets/catalog.gif)

### Adding New Incidents

The application supports adding new incidents through a form interface:

1. Fill in the required details:
   - Name
   - Incident Date
   - Category
   - Severity (Low-Critical)
   - Description
2. Optionally add artifact content (code, images)
3. Submit the form to create a new incident record

### Updating or Deleting Incidents

1. In selection mode, use the options to edit or delete the incident
2. The edit form will be pre-populated with the incident's existing data
3. Make changes and submit, or confirm deletion if deleting

## API Routes

The application uses the following API routes:
_Incident routes_:

- `GET /api/fetch-incidents`: Fetch all incidents
- `POST /api/new-incident`: Create a new incident
- `PUT /api/update-incident`: Update an existing incident
- `DELETE /api/delete-incident`: Delete an incident

  _Authentication routes_:

- `GET /api/auth/user`: Get the current authenticated user's details
- `POST /api/auth/signup`: Sign up with email and password
- `POST /api/auth/signout`: Sign out of the application
- `POST /api/auth/signin`: Sign into the application
- `POST /api/auth/protected`: Submit data to a protected endpoint
- `GET /api/auth/protected`: Get data from a protected endpoint
- `POST /api/auth/password-recovery`: Send email with link to reset password
- `POST /api/auth/password-recovery/confirm: Create new password

All of these routes interact with Supabase Edge Functions for database operations.

## Era-Specific Theming

The incident's detail window in the gallery features different visual themes based on the decade of the incident:

- **1980s**: 1980s Apple System II OS interface
- **1990s**: Windows 98 interface
- **2000s**: Frutiger Aero-style interface with category-specific icons
- **2010s**: Material Design/flat design interface with severity-specific header colour
- **2020s**: Dark/light themed (adapts to system preference with toggle) interface with catalog and severity specific colours

The theme is automatically selected based on the incident's date, through the Theme Provider (app/contexts/ThemeContext.jsx).

## Authentication

The application uses Supabase Authentication for user management:

- **User Roles**: Public (view-only) and Member (can contribute)
- **Authentication Flow**:
  - Email/password registration and login (with email confirmation)
  - Password recovery via email
  - Session persistence using Supabase Auth
- **Protected Routes**: Only authenticated users can add, edit, or delete incidents, and view their profile
- **Auth Context**: The `AuthContext` provides authentication state throughout the application
- **Server Validation**: All protected API routes verify authentication server-side

## Database Schema

The Supabase database includes the following main tables:

- **incidents**: Stores incident records

  - `id`: Unique identifier (UUID)
  - `created_at`: Record creation timestamp
  - `incident_name`: Incident name
  - `incident_date`: Date when incident occurred
  - `category`: Type of incident (Hardware, Software, Security, etc.)
  - `severity`: Impact level (Low, Medium, High, Critical)
  - `description`: Detailed description
  - `artifact_type`: Optional 'image' or 'code' artifact type
  - `artifact_content`: Optional technical details or code samples

## State Management

The application uses several React contexts for state management:

- **AuthContext**: Manages authentication state

  - Current user information
  - Login/logout functionality
  - Authentication status checks

- **IncidentContext**: Manages incident data

  - Fetching and caching incidents
  - CRUD operations for incidents
  - Filtering and sorting functionality

- **ThemeContext**: Handles era-specific theming
  - Determines appropriate theme based on incident date
  - Provides theme variables to styled components

## Testing

The application includes testing setup with:

- **Unit Tests**: Test individual components and utility functions
- **Integration Tests**: Test interactions between components
- **Mock Services**: Mock implementations of Supabase services

To run tests:

```bash
# Run all tests
npm test

# Run tests with coverage report
npm test -- --coverage
```

## Code Standards

Code quality is maintained through:

- **Prettier**: For consistent code formatting
- **Next.js Best Practices**: Following recommended patterns from their documentation
- **Component Structure**: Consistent organisation of component files
- **CSS Modules**: Scoped styling to prevent conflicts

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/awesome-enhancement`)
3. Make changes and commit (`git commit -m 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/awesome-enhancement`)
5. Open a Pull Request
