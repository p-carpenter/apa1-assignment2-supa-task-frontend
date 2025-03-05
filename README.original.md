# APA1 Supa Task Frontend

## Project Overview
This project for an open ending CRUD app, what the app does is your choice but it should implement CRUD functionality

## Setup Instructions
1. Install dependencies: Run `npm install` in your terminal to install all necessary dependencies.
2. Set up Supabase:
   - Create a free Supabase account if you don't have one
   - Create a new project in your Supabase dashboard
   - Copy your Supabase URL and anon key into the `.env` file (use `.env.example` as a template)
3. Start the development server: Run `node server.js` in your terminal.
4. Open your web browser and navigate to `http://localhost:3000` to access the application.

## Database Management
The project uses Supabase as the database provider:

The [companion backend app](https://github.com/jdowie-ada/apa1-supa-task-backend) will be used to manage the database 

## Testing
This is an open-ended project, and you may choose your preferred testing approach:
- Manual testing through the application interface
- Leveraging Supabase's built-in Row Level Security (RLS) policy testing
- Writing custom unit or integration tests with a framework of your choice (Jest, Mocha, etc.)

## Assignment Objectives
- Extend and enhance the existing web application
- Apply database and frontend development principles using Supabase
- Follow good programming standards
- Develop and execute a testing strategy appropriate for your implementation
- Use GitHub effectively for collaboration and documentation
- Prepare for a viva to explain project design and code implementation

## TODO

### Core Functionalities
1. Implement full CRUD operations for all items using Supabase's JavaScript client
2. Create a unified interface to manage all items
3. Create appropriate database relationships and constraints using Supabase's SQL editor

### Extend Functionalities
1. User login auth etc.
2. Enhance the frontend to display and manage the various items
3. Implement sorting and filtering options
4. (on backend) write more edge functions to extend API

You're free to come up with your own ideas too either on the front or backend

### Good Programming Standards
1. Structure your code for readability and modularity
2. Use consistent naming conventions
3. Implement proper error handling 
4. Document your code thoroughly
etc.

### Testing
Ideas for testing:
1. Document manual testing procedures and results
2. Leverage Supabase's RLS policies and test them
3. Write unit/integration tests for critical functionality

### GitHub Practices
1. Use Git and GitHub for version control
2. Create a comprehensive README documenting your implementation (replace this README)
3. Make small, meaningful commits with clear messages
4. Create a project board to track your progress (optional)

## Additional Features (Optional)
1. Implement responsive design for different devices
2. Add accessibility features following WCAG guidelines
3. Implement more advanced Supabase features:
   - Real-time updates using Supabase subscriptions
   - Storage for product images
   - Edge Functions for complex operations
4. Add analytics dashboard using Supabase's built-in analytics


Remember to document your development process, including any challenges you encounter and how you solve them. This will be valuable during your viva and for maintaining the project in the future.