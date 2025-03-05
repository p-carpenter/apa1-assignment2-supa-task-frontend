# Tech Incidents Archive

![]("https://i.imgur.com/wAN5OOv.gif")
A digital museum website showcasing significant technological failures throughout computing history. This website provides an interactive, historically-themed interface for exploring and cataloging technology incidents.

## 📑 Table of Contents

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
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)

## 🌟 Overview

The Tech Incidents Archive is a digital museum dedicated to documenting significant technological failures and their impact on modern computing safety standards. It presents incidents through era-appropriate interfaces, showcasing events like the Y2K Bug, the Morris Worm, and various hardware/software failures throughout tech history.

The application features a retro computing aesthetic with Windows 95-style interface elements for incidents from the 1990s and terminal-style displays for 1980s incidents.

## ✨ Features

- **Interactive Museum Interface**: Designed as a digital museum with a retro computing aesthetic
- **Era-Specific Visualization**: Different UI themes based on the decade of the incident (1980s terminal, 1990s Windows 95)
- **Comprehensive Catalog**: Browse all incidents with sorting and filtering capabilities
- **Advanced Search**: Find incidents by name, description, or category
- **Year-Based Navigation**: Browse incidents organized by year
- **Detailed Gallery View**: Explore incidents with era-appropriate visual presentations
- **Contribute after Registration**: Sign up to add, view, update, and delete incident records
- **Responsive Design**: Works on various screen sizes

## 🛠️ Tech Stack

- **Frontend Framework**: [Next.js](https://nextjs.org/) (v15.1.7)
- **UI Library**: [React](https://reactjs.org/) (v19.0.0)
- **Styling**:
  - CSS Modules
- **Backend**:
  - Next.js API Routes (for proxy endpoints)
  - [Supabase Edge Functions](https://supabase.com/docs/guides/functions) (for database operations)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Storage** (for community-added optional artifact images): [Supabase](https://supabase.com/)
- **Icons**: [Lucide React](https://lucide.dev/docs/lucide-react)

## 📂 Project Structure

```
app/
├── api/                    # Next.js API routes for proxy endpoints
│   ├── delete-incident/    # Endpoint to delete incidents
│   ├── new-incident/       # Endpoint to create new incidents
│   ├── tech-incidents/     # Endpoint to fetch all incidents
│   └── update-incident/    # Endpoint to update incidents
├── catalog/                # Catalog page to browse all incidents
├── components/             # Reusable UI components
│   ├── artifacts/          # Components for displaying incident artifacts
│   ├── layouts/            # Page layout components
│   └── ui/                 # UI components (buttons, cards, etc.)
│       ├── console/        # Terminal-style components for 80s theme
│       ├── themes/         # Decade-specific theme components
│       └── ...             # Other UI component categories
├── contexts/               # React context providers
│   ├── IncidentContext.jsx # Context for incident data management
│   └── ThemeContext.jsx    # Context for theme management
├── gallery/                # Gallery page for detailed incident viewing
├── hooks/                  # Custom React hooks
├── utils/                  # Utility functions
│   ├── navigation/         # Navigation utilities
│   └── ...                 # Other utility categories
├── globals.css             # Global styles
├── homepage.styles.css     # Homepage-specific styles
├── layout.js               # Root layout component
└── page.js                 # Homepage component
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or later)
- [npm](https://www.npmjs.com/) (v7 or later)
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

## 📋 Usage

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

!["You can search for incidents by name, description, category or year."]("https://i.imgur.com/hbl8Yxd.gif")

### Adding New Incidents

The application supports adding new incidents through a form interface:

1. Fill in the required details:
   - Name
   - Incident Date
   - Category
   - Severity (1-5)
   - Description
   - Cause
   - Consequences
   - Time to Resolve
2. Optionally add artifact content (code, images)
3. Submit the form to create a new incident record

### Updating or Deleting Incidents

1. In the detailed incident view, use the options to edit or delete the incident
2. The edit form will be pre-populated with the incident's existing data
3. Make changes and submit, or confirm deletion if deleting

## 🔌 API Routes

The application uses the following API routes:

- `GET /api/tech-incidents`: Fetch all incidents
- `POST /api/new-incident`: Create a new incident
- `PUT /api/update-incident`: Update an existing incident
- `DELETE /api/delete-incident`: Delete an incident

All these routes interact with Supabase Edge Functions for database operations.

## 🎨 Era-Specific Theming

The application features different visual themes based on the decade of the incident:

- **1980s**: Norton Commander-style dual-window interface
- **1990s**: Windows 95-style interface with classic window controls, menu bars, and pixel art

The theme is automatically selected based on the incident's date, through the Theme Provider (app/contexts/ThemeContext.jsx).

!["1980s and 1990s themes switching with the decade"]("https://i.imgur.com/RQDkyil.gif")

## 🔮 Future Enhancements

- Additional era themes (2000s, 2010s)
- User accounts

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/awesome-enhancement`)
3. Make changes and commit (`git commit -m 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/awesome-enhancement`)
5. Open a Pull Request
