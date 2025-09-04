# PDF Upload App with Authentication

A simple React application with Supabase authentication and PDF upload functionality.

## Features

- **User Authentication**: Sign up and sign in with email/password
- **Protected Routes**: Automatic redirect to login for unauthenticated users
- **PDF Upload**: Drag-and-drop or click to upload PDF files
- **File Management**: View uploaded PDFs with status tracking
- **Async Processing**: Stub function for PDF processing (to be implemented)

## Setup Instructions

### 1. Supabase Configuration

1. Create a new project at [database.new](https://database.new)
2. Go to Settings → API to get your project URL and anon key
3. Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

### 2. Database Setup

Run the SQL commands in `supabase-setup.sql` in your Supabase SQL editor to:
- Create the `uploaded_pdfs` table
- Set up Row Level Security policies
- Create storage bucket for PDFs
- Configure storage policies

### 3. Install and Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── Login.jsx          # Login/Signup form
│   └── ProtectedRoute.jsx # Auth guard component
├── pages/
│   └── Home.jsx           # Main page with PDF upload
├── lib/
│   └── supabase.js        # Supabase client and functions
├── App.jsx                # Main app with routing
└── App.css                # Styling
```

## Usage

1. Visit the app - you'll be redirected to login
2. Sign up with email/password or sign in if you have an account
3. After authentication, upload PDF files via drag-and-drop or click
4. View your uploaded PDFs with processing status

## PDF Processing

The app includes a `processPDF` stub function that:
- Updates file status to "processing"
- Simulates async processing (3 seconds)
- Updates status to "completed"

Replace this stub with actual processing logic as needed.

## Testing

Tests use Puppeteer to verify:
- Unauthenticated redirect to login
- Login form structure and validation
- Sign In/Sign Up toggle functionality
- CSS styling application

Run tests with: `npm test`

## Security

- Row Level Security (RLS) ensures users can only access their own data
- Storage policies restrict file access to file owners
- Authentication required for all protected routes
- PDF file type and size validation (max 10MB)