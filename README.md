# PDF Upload App with Authentication

A simple React application with Supabase authentication and PDF upload functionality. Users can sign up/sign in and upload PDF files for asynchronous processing.

## Features

- **User Authentication**: Email/password signup and signin
- **Protected Routes**: Automatic redirect to login for unauthenticated users
- **PDF Upload**: Drag-and-drop or click to upload PDF files (max 10MB)
- **File Management**: View uploaded PDFs with processing status
- **Async Processing**: Stub function for PDF processing (ready for custom implementation)
- **Responsive UI**: Clean, modern design with form validation

## Local Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Supabase account

### 1. Clone the Repository

```bash
git clone https://github.com/jordonpeterson/pdf-conversion.git
cd pdf-conversion
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Supabase Setup

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully set up

#### Get Your Credentials
1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy your **Project URL** and **anon/public key**

#### Configure Environment Variables
1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` with your credentials:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
   ```

### 4. Database Setup

#### Option A: Using Supabase CLI (Recommended)
```bash
# Install Supabase CLI if not already installed
npm install supabase

# Login to Supabase CLI
supabase login

# Link to your project (replace with your project ID)
supabase link --project-ref your-project-id

# Run migrations
supabase db push
```

#### Option B: Manual Setup
1. Go to your Supabase dashboard → **SQL Editor**
2. Run this SQL to create the database table:

```sql
-- Create uploaded_pdfs table
CREATE TABLE uploaded_pdfs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE uploaded_pdfs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own PDFs" ON uploaded_pdfs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upload PDFs" ON uploaded_pdfs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own PDFs" ON uploaded_pdfs
  FOR UPDATE USING (auth.uid() = user_id);
```

### 5. Storage Setup

1. Go to **Storage** in your Supabase dashboard
2. Click **New bucket**
3. Create a bucket with these settings:
   - **Name**: `pdfs`
   - **Public**: OFF (keep it private)
   - **File size limit**: 10MB
   - **Allowed MIME types**: `application/pdf`

### 6. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 7. Test the Application

```bash
# Run automated tests
npm test
```

## Usage

1. **First Visit**: You'll be redirected to the login page
2. **Sign Up**: Create a new account with email/password
3. **Sign In**: Use your credentials to log in
4. **Upload PDFs**: 
   - Drag and drop PDF files onto the upload area
   - Or click to browse and select files
   - Files are validated (PDF only, max 10MB)
5. **View Files**: See your uploaded PDFs with processing status

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── Login.jsx          # Authentication form
│   │   └── ProtectedRoute.jsx # Route protection wrapper
│   ├── pages/
│   │   └── Home.jsx           # Main app with PDF upload
│   ├── lib/
│   │   └── supabase.js        # Supabase client & functions
│   ├── App.jsx                # Main app with routing
│   └── App.css                # Styling
├── supabase/
│   ├── migrations/            # Database migrations
│   └── config.toml           # Supabase config
├── tests/
│   └── run-tests.js          # Puppeteer tests
└── README.md
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm test` - Run Puppeteer tests
- `npm run preview` - Preview production build
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint code linting

### Database Migrations

The project includes Supabase migrations in `supabase/migrations/`. These automatically:
- Create the `uploaded_pdfs` table
- Set up Row Level Security policies
- Configure storage bucket and policies

### PDF Processing

The app includes a `processPDF` stub function in `src/lib/supabase.js` that:
- Updates status to "processing"
- Simulates async work (3 seconds)
- Updates status to "completed"

**To implement custom processing:**
1. Replace the `processPDF` function with your logic
2. Consider using Supabase Edge Functions for server-side processing
3. Update the status appropriately based on success/failure

### Continuous Integration

The project includes a GitHub Actions CI pipeline that runs on every push and pull request:

- **Type Check Job**: Runs TypeScript type checking and ESLint
- **Test Job**: Builds the app, starts it, and runs Puppeteer tests
- **Build Job**: Creates production build and uploads artifacts

**CI Pipeline Features:**
- Runs on Node.js 18
- Uses npm cache for faster builds
- Installs Puppeteer dependencies for headless testing
- Uses mock Supabase credentials for builds
- Uploads build artifacts for download

## Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **Storage Policies**: Files are organized by user ID and access-controlled
- **Authentication Required**: All routes except login are protected
- **File Validation**: Client-side validation for file type and size
- **Environment Variables**: Sensitive credentials stored securely

## Troubleshooting

### Common Issues

1. **"Bucket not found" error**:
   - Ensure you created the storage bucket named `pdfs`
   - Check that it's configured as private

2. **404 on uploaded_pdfs table**:
   - Run the database migration
   - Verify the table was created in Supabase dashboard

3. **Authentication issues**:
   - Check your `.env.local` file has correct credentials
   - Ensure environment variables start with `VITE_`

4. **Upload failures**:
   - Check browser console for detailed error logs
   - Verify storage policies are set up correctly

### Debug Mode

The upload function includes detailed console logging. Check your browser's developer console for upload debugging information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Commit and push your changes
6. Create a pull request

## License

This project is open source and available under the MIT License.