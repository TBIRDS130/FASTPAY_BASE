import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { getSession, clearSession } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/component/ui/card'
import { Skeleton } from '@/component/ui/skeleton'
import { Toaster } from '@/component/ui/toaster'
import { Smartphone, MessageSquare } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/component/ui/select'
import { Label } from '@/component/ui/label'
import { useNavigate } from 'react-router-dom'
import { UnifiedLayout } from '@/component/UnifiedLayout'
import { DeviceInfoCard } from '@/component/DeviceInfoCard'
import { useOTPDevices } from './otp/hooks/useOTPDevices'
import {
  formatLastSeen,
  formatMessageTimestamp,
  getTimeSinceLastHeartbeat,
  hasMissedHeartbeats,
} from './otp/utils/deviceUtils'
import {
  getProcessorById,
  getDefaultProcessor,
  type MessageProcessor,
  messageProcessors,
} from '@/lib/message-processors'
import { useGmail, useOTPSend, useDeviceAdd } from '@/hooks/otp'
import { MessagesTable, GmailSection, AddDeviceDialog } from '@/features/otp/components'
import type { Device } from './otp/types'

interface OTPProps {
  onLogout?: () => void
}

export default function OTP({ onLogout }: OTPProps) {
  const navigate = useNavigate()
  const [sessionEmail, setSessionEmail] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState<number>(Date.now())
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [messageLimit, setMessageLimit] = useState<number>(() => {
    const saved = localStorage.getItem('otpMessageLimit')
    const parsed = saved ? parseInt(saved, 10) : 50
    return [30, 50, 100, 200, 500].includes(parsed) ? parsed : 50
  })
  const [selectedProcessorId, setSelectedProcessorId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('otpMessageProcessorId')
      if (saved) return saved
      const defaultProcessor = getDefaultProcessor()
      return defaultProcessor?.id || 'neft-inr-merge'
    } catch (error) {
      console.error('Error initializing processor:', error)
      return 'neft-inr-merge'
    }
  })
  const [processorInput, setProcessorInput] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('otpProcessorInput')
      return saved || ''
    } catch (error) {
      return ''
    }
  })
  const [showCodeSettings, setShowCodeSettings] = useState(false)

  // Heartbeat constants
  const HEARTBEAT_INTERVAL_MS = 10 * 1000
  const MISSED_HEARTBEAT_THRESHOLD = 3

  // Selected processor
  const selectedProcessor = useMemo(() => {
    try {
      const processor = getProcessorById(selectedProcessorId)
      if (processor) return processor
      return getDefaultProcessor()
    } catch (error) {
      console.error('Error getting processor:', error)
      return getDefaultProcessor()
    }
  }, [selectedProcessorId])

  // Use hooks
  const { devices, loading, taglineMap } = useOTPDevices({
    sessionEmail,
    messageLimit,
    selectedProcessor,
    processorInput,
  })

  const gmail = useGmail({ maxResults: 10 })
  const { lastSentOTP, sendOTP } = useOTPSend()
  const deviceAdd = useDeviceAdd()

  // Filter devices
  const filterDevicesData = useCallback(
    (devicesData: Device[]): Device[] => {
      if (!devicesData || devicesData.length === 0) return devicesData

      return devicesData.map(device => {
        const sortedMessages = (device.messages || []).sort((a, b) => b.timestamp - a.timestamp)
        return {
          ...device,
          messages: sortedMessages,
          rawMessages: device.rawMessages || [],
        }
      })
    },
    [selectedProcessor]
  )

  const filteredDevices = useMemo(() => {
    return filterDevicesData(devices)
  }, [devices, filterDevicesData])

  // Get session email
  useEffect(() => {
    const session = getSession()
    if (session) {
      setSessionEmail(session.email)
    }
  }, [])

  // Handle logout
  const handleLogout = () => {
    clearSession()
    if (onLogout) {
      onLogout()
    }
    navigate('/')
  }

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('otpMessageLimit', messageLimit.toString())
  }, [messageLimit])

  useEffect(() => {
    localStorage.setItem('otpMessageProcessorId', selectedProcessorId)
  }, [selectedProcessorId])

  useEffect(() => {
    localStorage.setItem('otpProcessorInput', processorInput)
  }, [processorInput])

  // Update current time every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now())
    }, 10 * 1000)
    return () => clearInterval(interval)
  }, [])

  // Update selected device when filtered devices change
  useEffect(() => {
    if (!selectedDeviceId && filteredDevices.length > 0) {
      setSelectedDeviceId(filteredDevices[0].id)
    }
  }, [filteredDevices, selectedDeviceId])

  // Format functions (wrapped for currentTime dependency)
  const formatLastSeenWrapper = useCallback(
    (timestamp: number) => {
      return formatLastSeen(timestamp, currentTime)
    },
    [currentTime]
  )

  const formatMessageTimestampWrapper = useCallback(
    (timestamp: number) => {
      return formatMessageTimestamp(timestamp, currentTime)
    },
    [currentTime]
  )

  if (!sessionEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Session Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Your session has expired. Please log in again.
            </p>
            <button
              onClick={() => (window.location.href = '/')}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Go to Login
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (devices.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                My Devices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No devices assigned to your account</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <>
      <UnifiedLayout
        showAdminFeatures={false}
        selectedDeviceId={selectedDeviceId}
        devices={filteredDevices.map(device => ({
          id: device.id,
          name: device.metadata.name || device.metadata.code || device.id.substring(0, 8),
          code: device.metadata.code || undefined,
          phone: device.metadata.phone || device.metadata.currentPhone || undefined,
          currentPhone: device.metadata.currentPhone || device.metadata.phone || undefined,
          lastSeen: device.metadata.lastSeen || undefined,
          batteryPercentage: device.metadata.batteryPercentage || undefined,
          isActive: device.metadata.isActive || false,
          time: device.metadata.time || undefined,
        }))}
        onDeviceSelect={deviceId => setSelectedDeviceId(deviceId)}
        taglineMap={taglineMap}
        title="OTP Messages"
        description="Monitor and view OTP messages from your connected devices"
        userEmail={sessionEmail}
        onLogout={handleLogout}
        userAccessLevel={1}
        onCodeClick={() => setShowCodeSettings(true)}
      >
        {deviceId => {
          const currentDevice = filteredDevices.find(d => d.id === deviceId)
          if (!currentDevice) {
            return (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Please select a device</p>
                </CardContent>
              </Card>
            )
          }

          return (
            <div className="space-y-3">
              {/* Device Info Card */}
              <DeviceInfoCard
                device={{
                  id: currentDevice.id,
                  name: currentDevice.metadata.name || 'N/A',
                  phone:
                    currentDevice.metadata.phone ||
                    currentDevice.metadata.currentPhone ||
                    undefined,
                  currentPhone:
                    currentDevice.metadata.currentPhone ||
                    currentDevice.metadata.phone ||
                    undefined,
                  code: currentDevice.metadata.code || undefined,
                  lastSeen: currentDevice.metadata.lastSeen || undefined,
                  batteryPercentage: currentDevice.metadata.batteryPercentage || undefined,
                  isActive: currentDevice.metadata.isActive || false,
                  time: currentDevice.metadata.time || undefined,
                }}
                formatLastSeen={formatLastSeenWrapper}
                onSendSMS={sendOTP}
                lastSentOTP={lastSentOTP}
                isAdmin={false}
              />

              {/* Messages Table */}
              <MessagesTable
                messages={currentDevice.messages}
                rawMessages={currentDevice.rawMessages || currentDevice.messages}
                selectedProcessor={selectedProcessor}
                selectedProcessorId={selectedProcessorId}
                processorInput={processorInput}
                messageLimit={messageLimit}
                onProcessorChange={setSelectedProcessorId}
                onProcessorInputChange={setProcessorInput}
                onMessageLimitChange={setMessageLimit}
                formatMessageTimestamp={formatMessageTimestampWrapper}
              />

              {/* Message Limit Control */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Message Limit</Label>
                      <p className="text-sm text-muted-foreground">
                        Number of messages to display per device
                      </p>
                    </div>
                    <Select
                      value={messageLimit.toString()}
                      onValueChange={value => setMessageLimit(parseInt(value, 10))}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="200">200</SelectItem>
                        <SelectItem value="500">500</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Gmail Section */}
              <GmailSection gmail={gmail} />
            </div>
          )
        }}
      </UnifiedLayout>

      {/* Add Device Dialog */}
      <AddDeviceDialog
        open={showCodeSettings}
        onOpenChange={setShowCodeSettings}
        deviceAdd={deviceAdd}
      />

      <Toaster />
    </>
  )
}
