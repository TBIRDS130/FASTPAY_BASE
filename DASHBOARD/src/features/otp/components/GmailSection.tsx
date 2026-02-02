import { useState } from 'react'
import { Mail, LogIn, LogOut, RefreshCw, Loader, X, User, Calendar } from 'lucide-react'
import { Button } from '@/component/ui/button'
import { Badge } from '@/component/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/component/ui/card'
import { Skeleton } from '@/component/ui/skeleton'
import { getEmailHeader } from '@/lib/gmail-api'
import type { UseGmailReturn } from '@/hooks/otp'

interface GmailSectionProps {
  gmail: UseGmailReturn
}

/**
 * GmailSection - Gmail integration UI
 */
export function GmailSection({ gmail }: GmailSectionProps) {
  return (
    <Card>
      <CardHeader className="p-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mail className="h-4 w-4" />
              Gmail ({gmail.emails.length})
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {gmail.isAuthenticated
                ? `Connected to Gmail • Showing ${gmail.maxResults} emails`
                : 'Connect your Gmail account to view emails'}
            </p>
          </div>
          {gmail.isAuthenticated && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => gmail.loadEmails()}
                disabled={gmail.loading}
              >
                <RefreshCw className={`h-4 w-4 ${gmail.loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="outline" size="sm" onClick={gmail.logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {!gmail.isAuthenticated ? (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Connect to Gmail</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Sign in with your Google account to access your Gmail inbox
              </p>
            </div>
            <Button onClick={gmail.authenticate} disabled={gmail.loading} size="lg">
              {gmail.loading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Connect Gmail
                </>
              )}
            </Button>
          </div>
        ) : gmail.loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : gmail.emails.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No emails found</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {gmail.emails.map((email) => (
              <div
                key={email.id}
                onClick={() => gmail.selectEmail(email.id)}
                className="p-3 rounded-lg border hover:bg-muted cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{email.from}</div>
                    <div className="text-sm font-medium truncate">{email.subject}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {email.snippet}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                    {email.date ? new Date(email.date).toLocaleDateString('en-US') : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Gmail Email Detail View */}
      {gmail.selectedEmail && (
        <Card className="mt-4">
          <CardHeader className="p-4 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-4 w-4" />
                Email Details
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={gmail.clearSelectedEmail}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {gmail.loadingEmail ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold">
                      {getEmailHeader(gmail.selectedEmail.payload.headers, 'Subject') || '(No Subject)'}
                    </h3>
                    <Badge variant="outline">
                      {gmail.selectedEmail.labelIds.join(', ')}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>
                        <strong>From:</strong>{' '}
                        {getEmailHeader(gmail.selectedEmail.payload.headers, 'From')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(parseInt(gmail.selectedEmail.internalDate)).toLocaleString('en-US')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm font-mono">
                    {gmail.selectedEmail.snippet || '(No content)'}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </Card>
  )
}
