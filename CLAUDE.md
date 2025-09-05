# CLAUDE.md

Always be concise. Solve problems in the simplest way possible without added complexity. 
## Commands

### Development
- `npm run dev` - Start the Vite development server at http://localhost:5173
- `npm run build` - Build for production to dist/
- `npm run preview` - Preview production build at http://localhost:4173

### Code Quality
- `npm run lint` - Run ESLint on all JS/JSX files
- `npm run typecheck` - Run TypeScript type checking with tsc --noEmit

### Testing
- `npm test` - Run Puppeteer tests (requires built app running)
- The test suite uses Puppeteer for automated browser testing of authentication and upload flows

## Architecture

### Tech Stack
- **Frontend**: React 19 with TypeScript, React Router for routing
- **Build Tool**: Vite with React plugin
- **Backend**: Supabase for authentication, database, and file storage
- **Edge Functions**: Deno-based Supabase edge functions for PDF processing
- **CI/CD**: GitHub Actions pipeline with type checking, linting, testing, and build steps

### Project Structure
- `/src` - TypeScript React application
  - `/components` - Reusable components (Login, ProtectedRoute)
  - `/pages` - Route-specific pages (Home with PDF upload)
  - `/lib` - Supabase client and helper functions
- `/supabase` - Backend configuration
  - `/migrations` - SQL migrations for database setup
  - `/functions` - Edge functions (process-pdf)
- `/tests` - Puppeteer test files

### Key Components

#### Authentication Flow
- Uses Supabase Auth with email/password
- ProtectedRoute component wraps protected pages
- Redirects to /login when not authenticated
- Session persisted via Supabase client

#### PDF Upload System
1. File validation (PDF only, max 10MB) in Home.tsx
2. Upload to Supabase Storage bucket 'pdfs' via uploadPDF()
3. Metadata saved to uploaded_pdfs table with user_id
4. Edge function triggered for async processing
5. Real-time status updates via database subscription

#### Database Schema
- **uploaded_pdfs** table tracks PDF metadata:
  - file_name, file_path, file_size
  - user_id (references auth.users)
  - status: pending → processing → completed/failed
  - Row Level Security ensures users only see their own files

#### Storage Configuration
- Bucket: 'pdfs' (private)
- Files organized by user_id in path structure
- 10MB file size limit enforced

## Environment Setup

Required environment variables in `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

## Supabase Integration

The app uses comprehensive Supabase helper functions in src/lib/supabase.ts:
- Authentication: signIn, signUp, signOut, getCurrentUser
- Database: fetchTable, insertRecord, updateRecord, deleteRecord
- Storage: uploadPDF with automatic metadata tracking
- Real-time: subscribeToTable for live updates
- Edge Functions: processPDF triggers async processing

## TypeScript Configuration

- Target: ES2020 with React JSX
- Strict mode enabled
- Path alias: @/* maps to ./src/*
- noUnusedLocals and noUnusedParameters disabled for flexibility

## Testing Approach

Tests use Puppeteer to validate critical user flows:
- Authentication (signup/signin)
- PDF upload functionality
- Protected route access

Run tests with app built and running on port 4173.

## CI/CD Pipeline

GitHub Actions workflow runs on push/PR:
1. **Type Check Job**: TypeScript compilation and ESLint
2. **Test Job**: Builds app, starts preview server, runs Puppeteer tests
3. **Build Job**: Production build with artifact upload

Uses mock Supabase credentials for CI builds.