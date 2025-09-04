import { useState, useEffect, DragEvent, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, signOut, uploadPDF, getUserPDFs } from '../lib/supabase.ts'
import { User } from '@supabase/supabase-js'

interface PDFRecord {
  id: string
  file_name: string
  file_path: string
  file_size: number
  user_id: string
  status: string
  created_at: string
}

function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [uploading, setUploading] = useState<boolean>(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false)
  const [userPDFs, setUserPDFs] = useState<PDFRecord[]>([])
  const [dragActive, setDragActive] = useState<boolean>(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadUserPDFs()
    }
  }, [user])

  async function loadUser(): Promise<void> {
    const { user, error } = await getCurrentUser()
    if (!error && user) {
      setUser(user)
    }
  }

  async function loadUserPDFs(): Promise<void> {
    if (!user) return
    const { data, error } = await getUserPDFs(user.id)
    if (!error && data) {
      setUserPDFs(data as PDFRecord[])
    }
  }

  async function handleSignOut(): Promise<void> {
    const { error } = await signOut()
    if (!error) {
      navigate('/login')
    }
  }

  const handleDrag = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleFileUpload = async (file: File): Promise<void> => {
    // Validate file type
    if (file.type !== 'application/pdf') {
      setUploadError('Please upload only PDF files')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB')
      return
    }

    setUploading(true)
    setUploadError(null)
    setUploadSuccess(false)

    try {
      if (!user) return
      const { data, error } = await uploadPDF(file, user.id)
      
      if (error) throw error
      
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)
      
      // Reload PDFs list
      loadUserPDFs()
    } catch (error: any) {
      setUploadError(error.message || 'Failed to upload PDF')
    } finally {
      setUploading(false)
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pending': return '#ffa500'
      case 'processing': return '#3498db'
      case 'completed': return '#2ecc71'
      case 'failed': return '#e74c3c'
      default: return '#95a5a6'
    }
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>PDF Upload Portal</h1>
        <div className="user-info">
          <span>{user?.email}</span>
          <button onClick={handleSignOut} className="sign-out-btn">
            Sign Out
          </button>
        </div>
      </header>

      <main className="home-main">
        <div className="upload-section">
          <h2>Upload PDF</h2>
          <div 
            className={`upload-box ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="file-upload"
              accept="application/pdf"
              onChange={handleFileSelect}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" className="upload-label">
              {uploading ? (
                <span>Uploading...</span>
              ) : (
                <>
                  <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Click to upload or drag and drop</span>
                  <span className="file-type">PDF files only (max 10MB)</span>
                </>
              )}
            </label>
          </div>
          
          {uploadError && (
            <div className="error-message">{uploadError}</div>
          )}
          
          {uploadSuccess && (
            <div className="success-message">PDF uploaded successfully!</div>
          )}
        </div>

        <div className="pdfs-section">
          <h2>Your Uploaded PDFs</h2>
          {userPDFs.length === 0 ? (
            <p className="no-pdfs">No PDFs uploaded yet</p>
          ) : (
            <div className="pdfs-grid">
              {userPDFs.map((pdf) => (
                <div key={pdf.id} className="pdf-card">
                  <div className="pdf-icon">📄</div>
                  <div className="pdf-info">
                    <h3>{pdf.file_name}</h3>
                    <p className="pdf-size">
                      {(pdf.file_size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="pdf-date">
                      {new Date(pdf.created_at).toLocaleDateString()}
                    </p>
                    <div className="pdf-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(pdf.status) }}
                      >
                        {pdf.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Home