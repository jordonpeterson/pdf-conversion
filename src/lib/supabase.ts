import { createClient, User } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
)

export async function signIn(email: string, password: string): Promise<{ data: any, error: any }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export async function signUp(email: string, password: string): Promise<{ data: any, error: any }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  return { data, error }
}

export async function signOut(): Promise<{ error: any }> {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser(): Promise<{ user: User | null, error: any }> {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

interface TableOptions {
  select?: string
  filter?: Record<string, any>
  order?: { column: string, ascending?: boolean }
  limit?: number
}

export async function fetchTable(tableName: string, options: TableOptions = {}): Promise<{ data: any, error: any }> {
  let query = supabase.from(tableName).select(options.select || '*')
  
  if (options.filter) {
    Object.entries(options.filter).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
  }
  
  if (options.order) {
    query = query.order(options.order.column, { ascending: options.order.ascending ?? true })
  }
  
  if (options.limit) {
    query = query.limit(options.limit)
  }
  
  const { data, error } = await query
  return { data, error }
}

export async function insertRecord(tableName: string, record: any): Promise<{ data: any, error: any }> {
  const { data, error } = await supabase
    .from(tableName)
    .insert(record)
    .select()
  return { data, error }
}

export async function updateRecord(tableName: string, id: string, updates: any): Promise<{ data: any, error: any }> {
  const { data, error } = await supabase
    .from(tableName)
    .update(updates)
    .eq('id', id)
    .select()
  return { data, error }
}

export async function deleteRecord(tableName: string, id: string): Promise<{ error: any }> {
  const { error } = await supabase
    .from(tableName)
    .delete()
    .eq('id', id)
  return { error }
}

export function subscribeToTable(tableName: string, callback: any): any {
  const subscription = supabase
    .channel(`public:${tableName}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, callback)
    .subscribe()
  
  return subscription
}

// Storage functions for PDF upload
export async function uploadPDF(file: File, userId: string): Promise<{ data?: any, error?: any }> {
  console.log('Starting upload for:', file.name, 'Size:', file.size, 'Type:', file.type)
  
  const fileName = `${userId}/${Date.now()}_${file.name}`
  console.log('Upload path:', fileName)
  
  const { data, error } = await supabase.storage
    .from('pdfs')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) {
    console.error('Storage upload error:', error)
    return { error }
  }
  
  console.log('Storage upload success:', data)
  
  // Save file metadata to database
  const { data: fileRecord, error: dbError } = await supabase
    .from('uploaded_pdfs')
    .insert({
      file_name: file.name,
      file_path: data.path,
      file_size: file.size,
      user_id: userId,
      status: 'pending'
    })
    .select()
    .single()
  
  if (dbError) {
    console.error('Database insert error:', dbError)
    return { error: dbError }
  }
  
  console.log('Database insert success:', fileRecord)
  
  // Call processPDF stub
  processPDF(fileRecord.id)
  
  return { data: fileRecord, error: null }
}

// Stub function for PDF processing
export async function processPDF(fileId: string): Promise<void> {
  // This is a stub function that will be implemented later
  // For now, it just updates the status to 'processing' then 'completed'
  console.log(`Processing PDF with ID: ${fileId}`)
  
  // Update status to processing
  await supabase
    .from('uploaded_pdfs')
    .update({ status: 'processing' })
    .eq('id', fileId)
  
  // Simulate async processing
  setTimeout(async () => {
    await supabase
      .from('uploaded_pdfs')
      .update({ status: 'completed' })
      .eq('id', fileId)
    console.log(`PDF processing completed for ID: ${fileId}`)
  }, 3000)
}

// Get user's uploaded PDFs
export async function getUserPDFs(userId: string): Promise<{ data: any, error: any }> {
  const { data, error } = await supabase
    .from('uploaded_pdfs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  return { data, error }
}