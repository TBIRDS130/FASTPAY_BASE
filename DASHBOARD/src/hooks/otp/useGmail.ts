import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/lib/use-toast'
import {
  initGmailAuth,
  getGmailToken,
  clearGmailToken,
  isGmailTokenExpired,
  fetchGmailMessages,
  fetchGmailMessage,
  getEmailHeader,
} from '@/lib/gmail-api'

export interface GmailEmail {
  id: string
  threadId: string
  subject: string
  from: string
  snippet: string
  date: string
  labels?: string[]
}

export interface UseGmailParams {
  maxResults?: number
}

export interface UseGmailReturn {
  isAuthenticated: boolean
  emails: GmailEmail[]
  selectedEmail: Awaited<ReturnType<typeof fetchGmailMessage>> | null
  loading: boolean
  loadingEmail: boolean
  maxResults: number
  setMaxResults: (value: number) => void
  authenticate: () => void
  logout: () => void
  loadEmails: () => Promise<void>
  selectEmail: (emailId: string) => Promise<void>
  clearSelectedEmail: () => void
}

/**
 * Custom hook for Gmail integration
 * Handles authentication, email fetching, and email selection
 */
export function useGmail({ maxResults: initialMaxResults = 10 }: UseGmailParams = {}): UseGmailReturn {
  const { toast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [emails, setEmails] = useState<GmailEmail[]>([])
  const [selectedEmail, setSelectedEmail] = useState<Awaited<ReturnType<typeof fetchGmailMessage>> | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingEmail, setLoadingEmail] = useState(false)
  const [maxResults, setMaxResults] = useState(initialMaxResults)

  // Check Gmail authentication status
  useEffect(() => {
    const checkGmailAuth = () => {
      const token = getGmailToken()
      const expired = isGmailTokenExpired()
      setIsAuthenticated(!!token && !expired)
    }

    checkGmailAuth()

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'gmail_access_token') {
        checkGmailAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    const interval = setInterval(checkGmailAuth, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  // Load Gmail emails
  const loadEmails = useCallback(async () => {
    if (!isAuthenticated) return

    setLoading(true)
    try {
      const response = await fetchGmailMessages(maxResults)
      
      // Fetch full details for each message
      const emailPromises = response.messages.map(async (msg) => {
        try {
          const fullMessage = await fetchGmailMessage(msg.id)
          const headers = fullMessage.payload.headers
          
          return {
            id: fullMessage.id,
            threadId: fullMessage.threadId,
            subject: getEmailHeader(headers, 'Subject') || '(No Subject)',
            from: getEmailHeader(headers, 'From') || 'Unknown',
            snippet: fullMessage.snippet || '',
            date: getEmailHeader(headers, 'Date') || '',
            labels: fullMessage.labelIds,
          }
        } catch (error) {
          console.error(`Failed to fetch message ${msg.id}:`, error)
          return null
        }
      })

      const emailList = (await Promise.all(emailPromises)).filter(
        (email): email is NonNullable<typeof email> => email !== null
      )

      setEmails(emailList)
    } catch (error) {
      console.error('Failed to load Gmail emails:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load Gmail emails',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, maxResults, toast])

  // Load emails when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadEmails()
    }
  }, [isAuthenticated, maxResults, loadEmails])

  // Authenticate
  const authenticate = useCallback(() => {
    try {
      initGmailAuth()
    } catch (error) {
      console.error('Gmail authentication failed:', error)
      toast({
        title: 'Authentication Failed',
        description: error instanceof Error ? error.message : 'Failed to start Gmail authentication',
        variant: 'destructive',
      })
    }
  }, [toast])

  // Logout
  const logout = useCallback(() => {
    clearGmailToken()
    setIsAuthenticated(false)
    setEmails([])
    setSelectedEmail(null)
    toast({
      title: 'Logged Out',
      description: 'Disconnected from Gmail',
    })
  }, [toast])

  // Select email
  const selectEmail = useCallback(async (emailId: string) => {
    if (!emailId) {
      setSelectedEmail(null)
      return
    }
    setLoadingEmail(true)
    try {
      const message = await fetchGmailMessage(emailId)
      setSelectedEmail(message)
    } catch (error) {
      console.error('Failed to load email:', error)
      toast({
        title: 'Error',
        description: 'Failed to load email',
        variant: 'destructive',
      })
    } finally {
      setLoadingEmail(false)
    }
  }, [toast])

  // Clear selected email
  const clearSelectedEmail = useCallback(() => {
    setSelectedEmail(null)
  }, [])

  return {
    isAuthenticated,
    emails,
    selectedEmail,
    loading,
    loadingEmail,
    maxResults,
    setMaxResults,
    authenticate,
    logout,
    loadEmails,
    selectEmail,
    clearSelectedEmail: () => setSelectedEmail(null),
  }
}
