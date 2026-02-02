import { MessageSquare } from 'lucide-react'
import { Badge } from '@/component/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/component/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/component/ui/table'
import { Label } from '@/component/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/component/ui/select'
import { Input } from '@/component/ui/input'
import { formatDistanceToNow } from 'date-fns'
import type { Message } from '@/pages/otp/types'
import type { MessageProcessor } from '@/lib/message-processors'
import { messageProcessors } from '@/lib/message-processors'

interface MessagesTableProps {
  messages: Message[]
  rawMessages: Message[]
  selectedProcessor: MessageProcessor
  selectedProcessorId: string
  processorInput: string
  messageLimit: number
  onProcessorChange: (processorId: string) => void
  onProcessorInputChange: (input: string) => void
  onMessageLimitChange: (limit: number) => void
  formatMessageTimestamp: (timestamp: number) => string
}

/**
 * MessagesTable - Display messages in a table format
 */
export function MessagesTable({
  messages,
  rawMessages,
  selectedProcessor,
  selectedProcessorId,
  processorInput,
  messageLimit,
  onProcessorChange,
  onProcessorInputChange,
  onMessageLimitChange,
  formatMessageTimestamp,
}: MessagesTableProps) {
  const displayMessages = selectedProcessor.id !== 'no-processing' ? messages : rawMessages || messages

  return (
    <Card>
      <CardHeader className="p-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-4 w-4" />
              Messages ({displayMessages.length})
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedProcessor.id !== 'no-processing'
                ? `Messages with ${selectedProcessor.name} applied (limit: ${messageLimit})`
                : `All messages without processing (limit: ${messageLimit})`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="processor-select" className="text-sm whitespace-nowrap">
              SCRIPT:
            </Label>
            <Select value={selectedProcessorId} onValueChange={onProcessorChange}>
              <SelectTrigger id="processor-select" className="w-[140px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {messageProcessors.map(processor => (
                  <SelectItem key={processor.id} value={processor.id}>
                    {processor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProcessor.requiresInput && (
              <>
                <Label htmlFor="processor-input" className="text-sm whitespace-nowrap">
                  {selectedProcessor.inputLabel || 'Input:'}
                </Label>
                <Input
                  id="processor-input"
                  type="text"
                  placeholder={selectedProcessor.inputPlaceholder || ''}
                  value={processorInput}
                  onChange={e => onProcessorInputChange(e.target.value)}
                  className="w-20 h-9"
                  maxLength={2}
                />
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {displayMessages.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No messages found</p>
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Time</TableHead>
                  <TableHead className="w-[140px]">Direction</TableHead>
                  <TableHead className="w-32">Phone</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayMessages.map((msg, idx) => {
                  const now = Date.now()
                  const diffSeconds = Math.floor((now - msg.timestamp) / 1000)
                  const isOldMessage = diffSeconds > 120

                  const displayTime = isOldMessage
                    ? formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })
                    : formatMessageTimestamp(msg.timestamp)

                  return (
                    <TableRow
                      key={`${selectedProcessor.id !== 'no-processing' ? 'processed' : 'raw'}-${msg.timestamp}-${idx}`}
                      className={
                        idx % 2 === 0
                          ? 'bg-primary/5 border-l-2 border-primary/20'
                          : 'bg-card/50'
                      }
                    >
                      <TableCell className="text-xs text-muted-foreground">
                        {displayTime}
                      </TableCell>
                      <TableCell className="w-[140px] min-w-[140px]">
                        <div className="flex items-center gap-2 w-full">
                          {msg.type === 'sent' ? (
                            <Badge
                              variant="outline"
                              className="bg-primary/10 text-primary border-primary/20 whitespace-nowrap"
                            >
                              Sent
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className={
                                selectedProcessor.id === 'no-processing'
                                  ? 'bg-primary/10 text-primary border-primary/20 whitespace-nowrap'
                                  : 'bg-secondary/10 text-secondary border-secondary/20 whitespace-nowrap'
                              }
                            >
                              Received
                            </Badge>
                          )}
                          {(() => {
                            const mergeMatch = msg.body?.match(/\[Merged:\s*(\d+)\s*messages?\]/i)
                            if (mergeMatch && mergeMatch[1]) {
                              const mergeCount = parseInt(mergeMatch[1], 10)
                              return (
                                <span className="px-2 py-0.5 rounded text-xs bg-primary/20 text-primary border border-primary/30 whitespace-nowrap">
                                  {mergeCount}
                                </span>
                              )
                            }
                            return null
                          })()}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {msg.phone || 'N/A'}
                      </TableCell>
                      <TableCell className="max-w-md break-words">{msg.body}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
