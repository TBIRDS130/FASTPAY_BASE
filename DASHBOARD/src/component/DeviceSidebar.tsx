import { useState, useMemo, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/component/ui/card'
import { Input } from '@/component/ui/input'
import { Button } from '@/component/ui/button'
import { Badge } from '@/component/ui/badge'
import { Label } from '@/component/ui/label'
import { Search, Smartphone, Activity, Battery, RefreshCw, Settings2, Wifi, WifiOff, Circle, MessageSquare, Eye, Filter, ArrowUpDown, X, Menu, X as XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getDeviceListPath } from '@/lib/firebase-helpers'
import { get } from 'firebase/database'
import { StatusBadge } from './StatusBadge'
import { BatteryIndicator } from './BatteryIndicator'
import { EmptyState } from './EmptyState'
import { SkeletonCard } from './SkeletonLoader'
import { useKeyboardShortcuts } from '@/lib/useKeyboardShortcuts'
import { getApiUrl } from '@/lib/api-client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/component/ui/select'

interface Device {
  id: string
  name?: string
  code?: string
  phone?: string
  currentPhone?: string
  lastSeen?: number
  batteryPercentage?: number
  isActive?: boolean
  isOnline?: boolean
  time?: number
}

interface BankInfo {
  bank_name?: string
  company_name?: string
  other_info?: string
  bank_code?: string
}

interface BankCardInfo {
  bank_code?: string
  bank_name?: string
}

interface DeviceSidebarProps {
  devices: Device[]
  selectedDeviceId?: string | null
  onDeviceSelect?: (deviceId: string) => void
  onRefresh?: () => void
  onCodeClick?: () => void
}

export function DeviceSidebar({
  devices,
  selectedDeviceId,
  onDeviceSelect,
  onRefresh,
  onCodeClick,
}: DeviceSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showOnlineOnly, setShowOnlineOnly] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'testing' | 'running'>('all')
  const [bankInfoMap, setBankInfoMap] = useState<Record<string, BankInfo>>({})
  const [bankCardMap, setBankCardMap] = useState<Record<string, BankCardInfo | null>>({})
  const [batteryFilter, setBatteryFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'lastSeen' | 'battery' | 'code'>('lastSeen')
  const [showFilters, setShowFilters] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'k',
      ctrlKey: true,
      callback: () => {
        searchInputRef.current?.focus()
      },
    },
  ])

  // Filter and sort devices
  const filteredDevices = useMemo(() => {
    const devicesArray = Array.isArray(devices) ? devices : []
    let filtered = devicesArray

    // Filter by online status (last seen in last 5 minutes)
    const now = Date.now()
    const fiveMinutesAgo = now - 300000 // 5 minutes in milliseconds
    if (showOnlineOnly) {
      filtered = filtered.filter(device => {
        const lastSeen = device.lastSeen || device.time
        if (!lastSeen) return false
        return lastSeen >= fiveMinutesAgo
      })
    }

    // Filter by testing/running status (based on online state)
    if (statusFilter !== 'all') {
      filtered = filtered.filter(device => {
        const lastSeen = device.lastSeen || device.time
        const isConnected = !!lastSeen && lastSeen >= fiveMinutesAgo
        return statusFilter === 'running' ? isConnected : !isConnected
      })
    }

    // Filter by battery level
    if (batteryFilter !== 'all') {
      filtered = filtered.filter(device => {
        const battery = device.batteryPercentage ?? 0
        if (batteryFilter === 'low') return battery < 20
        if (batteryFilter === 'medium') return battery >= 20 && battery < 50
        if (batteryFilter === 'high') return battery >= 50
        return true
      })
    }

    // Filter by search query (code, bank name, number)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(device => {
        const code = device.code?.toLowerCase() || ''
        const phone = (device.phone || device.currentPhone || '').toLowerCase()
        const bankInfo = bankInfoMap[device.code || '']
        const bankName = bankInfo?.bank_name?.toLowerCase() || ''

        return code.includes(query) || phone.includes(query) || bankName.includes(query)
      })
    }

    // Sort devices
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || a.id).localeCompare(b.name || b.id)
        case 'lastSeen':
          const aTime = a.lastSeen || a.time || 0
          const bTime = b.lastSeen || b.time || 0
          return bTime - aTime // Most recent first
        case 'battery':
          const aBattery = a.batteryPercentage ?? 0
          const bBattery = b.batteryPercentage ?? 0
          return bBattery - aBattery // Highest first
        case 'code':
          return (a.code || '').localeCompare(b.code || '')
        default:
          return 0
      }
    })

    return filtered
  }, [devices, searchQuery, showOnlineOnly, batteryFilter, sortBy, bankInfoMap, statusFilter])

  // Fetch bank information for all devices (from Firebase - for backward compatibility)
  useEffect(() => {
    const fetchBankInfoForDevices = async () => {
      const codes = devices
        .map(d => d.code)
        .filter((code): code is string => !!code && !bankInfoMap[code])

      if (codes.length === 0) return

      const bankInfoPromises = codes.map(async code => {
        try {
          const bankRef = getDeviceListPath(code, 'BANK')
          const bankSnapshot = await get(bankRef)

          if (bankSnapshot.exists()) {
            const data = bankSnapshot.val()
            return {
              code,
              bankInfo: {
                bank_name: data?.bank_name || '',
                company_name: data?.company_name || '',
                other_info: data?.other_info || '',
                bank_code: data?.bank_code || '',
              },
            }
          }
          return { code, bankInfo: {} }
        } catch (error) {
          console.error(`Error fetching bank info for code ${code}:`, error)
          return { code, bankInfo: {} }
        }
      })

      const results = await Promise.all(bankInfoPromises)
      const newBankInfoMap: Record<string, BankInfo> = {}

      results.forEach(({ code, bankInfo }) => {
        newBankInfoMap[code] = bankInfo
      })

      setBankInfoMap(prev => ({ ...prev, ...newBankInfoMap }))
    }

    fetchBankInfoForDevices()
  }, [devices, bankInfoMap])

  // Fetch bank cards from Django API in a single batch
  useEffect(() => {
    const fetchBankCardsForDevices = async () => {
      const deviceIds = devices
        .map(d => d.id)
        .filter((id): id is string => !!id && !(id in bankCardMap))

      if (deviceIds.length === 0) return

      try {
        const response = await fetch(getApiUrl('/bank-cards/batch/'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ device_ids: deviceIds }),
        })

        if (!response.ok) {
          console.warn(`Failed to fetch bank cards batch: ${response.status} ${response.statusText}`)
          return
        }

        const data = await response.json()
        const results = data?.results || {}
        setBankCardMap(prev => ({ ...prev, ...results }))
      } catch (error) {
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.warn('Network error fetching bank cards batch:', error)
        }
      }
    }

    fetchBankCardsForDevices()
  }, [devices, bankCardMap])

  const formatLastSeen = (timestamp?: number): string => {
    if (!timestamp) return 'Never'

    try {
      const now = Date.now()
      const lastSeenTime = timestamp
      const diffMs = now - lastSeenTime
      const diffSeconds = Math.floor(diffMs / 1000)

      // Handle future timestamps (clock sync issues) - treat as just connected
      if (diffSeconds < 0) {
        return 'Connected'
      }

      // If less than 20 seconds, show "Connected"
      if (diffSeconds >= 0 && diffSeconds < 20) {
        return 'Connected'
      }

      // For times 20-59 seconds old, show exact second count
      if (diffSeconds >= 20 && diffSeconds < 60) {
        return `${diffSeconds} seconds ago`
      }

      // For times 60 seconds to 120 seconds, show exact seconds
      if (diffSeconds >= 60 && diffSeconds <= 120) {
        return `${diffSeconds} seconds ago`
      }

      // For times older than 120 seconds, calculate minutes/hours manually
      const diffMinutes = Math.floor(diffSeconds / 60)
      const diffHours = Math.floor(diffMinutes / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
      } else if (diffMinutes > 0) {
        return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
      }

      return `${diffSeconds} seconds ago`
    } catch {
      return 'Never'
    }
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-background/80 backdrop-blur-sm"
        >
          {isMobileOpen ? <XIcon className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <Card
        className={cn(
          'h-full flex flex-col transition-all duration-300 ease-in-out',
          'lg:relative lg:translate-x-0',
          'border-r border-border/50',
          'bg-card/95 backdrop-blur-sm',
          'shadow-lg lg:shadow-none',
          isMobileOpen
            ? 'fixed left-0 top-0 z-50 w-80 h-full translate-x-0'
            : 'fixed -translate-x-full lg:translate-x-0'
        )}
      >
      <CardHeader className="p-4 sm:p-5 pb-3 sm:pb-4 border-b border-border/50 bg-gradient-to-r from-muted/30 to-muted/10">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-primary/10 ring-1 ring-primary/20">
              <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 text-primary" />
            </div>
            <span className="truncate font-semibold">Devices</span>
          </CardTitle>
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {onCodeClick && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCodeClick}
                className="h-7 sm:h-8 px-2 sm:px-3 border-border/50 hover:bg-muted/50"
                title="Device Code"
              >
                <Settings2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Code</span>
              </Button>
            )}
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="h-7 sm:h-8 w-7 sm:w-8 p-0 hover:bg-muted/50"
                title="Refresh devices"
              >
                <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-4 flex flex-col flex-1 min-h-0">
        {/* Status Filter Tabs */}
        <div className="mb-3 flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={statusFilter === 'testing' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('testing')}
            className="h-7 px-3 text-[11px]"
          >
            TESTING
          </Button>
          <Button
            type="button"
            size="sm"
            variant={statusFilter === 'running' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('running')}
            className="h-7 px-3 text-[11px]"
          >
            RUNNING
          </Button>
          {statusFilter !== 'all' && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setStatusFilter('all')}
              className="h-7 px-2 text-[11px]"
              title="Show all"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Search Box */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search devices... (Ctrl+K)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 h-9 text-sm rounded-lg border-border/50 bg-background/60 backdrop-blur-sm focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all shadow-sm"
              onKeyDown={e => {
                if (e.key === 'Escape') {
                  searchInputRef.current?.blur()
                  setSearchQuery('')
                }
              }}
            />
          </div>
        </div>

        {/* Device List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {/* Device List Bar - Connection Summary (scrolls with list) */}
          {(() => {
            const now = Date.now()
            const fiveMinutesAgo = now - 300000
            const devicesArray = Array.isArray(devices) ? devices : []
            const connectedCount = devicesArray.filter(d => {
              const lastSeen = d.lastSeen || d.time
              return lastSeen && lastSeen >= fiveMinutesAgo
            }).length
            const totalCount = devicesArray.length
            const disconnectedCount = totalCount - connectedCount
            const showingCount = filteredDevices.length
            const isFiltered = showingCount !== totalCount

            return (
              <div className="rounded-lg border border-border/50 bg-gradient-to-r from-muted/40 via-muted/25 to-muted/10 px-3 py-2 shadow-sm">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1">
                      <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-bold text-foreground">{totalCount}</span>
                      <span className="text-[10px] text-muted-foreground">Total</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-md bg-green-500/10 px-2 py-1">
                      <Wifi className="h-3.5 w-3.5 text-green-500" />
                      <span className="font-bold text-green-600 dark:text-green-400">{connectedCount}</span>
                      <span className="text-[10px] text-muted-foreground">Online</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-md bg-red-500/10 px-2 py-1">
                      <WifiOff className="h-3.5 w-3.5 text-red-500" />
                      <span className="font-bold text-red-600 dark:text-red-400">{disconnectedCount}</span>
                      <span className="text-[10px] text-muted-foreground">Offline</span>
                    </div>
                  </div>
                  {isFiltered && (
                    <div className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground">
                      Showing
                      <span className="font-semibold text-foreground">{showingCount}</span>
                      of {totalCount}
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
          {filteredDevices.length === 0 ? (
            <EmptyState
              icon={Smartphone}
              title={searchQuery ? 'No devices found' : 'No devices available'}
              description={
                searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'Add devices to start monitoring'
              }
              action={
                onRefresh
                  ? {
                      label: 'Refresh',
                      onClick: onRefresh,
                    }
                  : undefined
              }
            />
          ) : (
            filteredDevices.map(device => {
              const isSelected = device.id === selectedDeviceId
              
              // Calculate connection status - GREEN if connected, RED otherwise
              const lastSeenTimestamp = device.lastSeen || device.time
              const now = Date.now()
              const diffMs = lastSeenTimestamp ? now - lastSeenTimestamp : Infinity
              const diffSeconds = Math.floor(diffMs / 1000)
              // Connected = within 5 minutes, otherwise disconnected (RED)
              const isConnected = diffSeconds < 300 // 5 minutes
              const connectionStatus = isConnected ? 'connected' : 'disconnected'

              // Get battery icon based on percentage
              const getBatteryIcon = (percentage?: number) => {
                if (percentage === undefined || percentage === null) {
                  return <Battery className="h-4 w-4 text-muted-foreground" />
                }
                if (percentage > 50) {
                  return <Battery className="h-4 w-4 text-green-500" />
                }
                if (percentage > 20) {
                  return <Battery className="h-4 w-4 text-yellow-500" />
                }
                return <Battery className="h-4 w-4 text-red-500" />
              }

              return (
                <div
                  key={device.id}
                  onClick={() => {
                    onDeviceSelect?.(device.id)
                    setIsMobileOpen(false) // Close mobile sidebar on selection
                  }}
                  className={cn(
                    'group relative p-2.5 rounded-lg border cursor-pointer transition-all duration-200',
                    // Base background
                    isSelected
                      ? 'bg-primary/10 border-primary/50 shadow-md ring-2 ring-primary/20'
                      : 'bg-card/60 border-border/50',
                    // Connection status border - GREEN if connected, RED otherwise
                    connectionStatus === 'connected' 
                      ? 'border-l-4 border-l-green-500'
                      : 'border-l-4 border-l-red-500'
                  )}
                >
              <div className="space-y-2">
                {/* Header Row: CODE + Status + Online/Battery */}
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-0.5">
                      CODE
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="font-mono font-bold text-sm text-foreground truncate">
                        {device.code || 'N/A'}
                      </div>
                      <span
                        className={cn(
                          'text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded',
                          isConnected
                            ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                            : 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400'
                        )}
                      >
                        {isConnected ? 'RUNNING' : 'TESTING'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1" title={isConnected ? 'Online' : 'Offline'}>
                      {connectionStatus === 'connected' ? (
                        <Wifi className="h-4 w-4 text-green-500" />
                      ) : (
                        <WifiOff className="h-4 w-4 text-red-500" />
                      )}
                      <span
                        className={cn(
                          'text-[10px] font-semibold',
                          isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {isConnected ? 'ONLINE' : 'OFFLINE'}
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-1"
                      title={device.batteryPercentage !== undefined ? `${device.batteryPercentage}%` : 'Battery N/A'}
                    >
                      <Battery
                        className={cn(
                          'h-4 w-4',
                          device.batteryPercentage === undefined || device.batteryPercentage === null
                            ? 'text-muted-foreground'
                            : device.batteryPercentage > 50
                              ? 'text-green-500'
                              : device.batteryPercentage > 20
                                ? 'text-yellow-500'
                                : 'text-red-500'
                        )}
                      />
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {device.batteryPercentage !== undefined ? `${device.batteryPercentage}%` : '--%'}
                      </span>
                    </div>
                    {isSelected && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                  </div>
                </div>

                {/* Expandable Details */}
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300 ease-in-out',
                    isSelected ? 'max-h-[240px] opacity-100' : 'max-h-0 opacity-0'
                  )}
                >
                  <div className={cn('space-y-2', isSelected && 'pt-2')}>
                    {/* Company + Bankcode (Bank Card fields) */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-0.5">
                          COMPANY NAME
                        </div>
                        <div className="text-sm font-medium text-foreground truncate">
                          {bankInfoMap[device.code || '']?.company_name || bankCardMap[device.id]?.bank_name || 'N/A'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-0.5">
                          BANKCODE
                        </div>
                        <div className="font-mono font-bold text-sm text-foreground">
                          {bankCardMap[device.id]?.bank_code || bankInfoMap[device.code || '']?.bank_code || 'XXXX1111'}
                        </div>
                      </div>
                    </div>

                    {/* Number */}
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-0.5">
                        NUMBER
                      </div>
                      <div className="font-mono font-bold text-sm text-foreground break-all">
                        {device.phone || device.currentPhone || 'N/A'}
                      </div>
                    </div>

                    {/* Last Seen */}
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mb-0.5">
                        LAST SEEN
                      </div>
                      <div className="text-xs font-medium text-muted-foreground">
                        {formatLastSeen(lastSeenTimestamp || undefined)}
                      </div>
                    </div>

                    {/* Device ID - right side at bottom */}
                    <div className="flex justify-end">
                      <div className="text-right">
                        <div className="text-[9px] text-muted-foreground uppercase font-semibold tracking-wider mb-0.5">
                          DEVICE ID
                        </div>
                        <div className="font-mono text-[10px] text-muted-foreground break-all max-w-[180px]">
                          {device.id}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
    </>
  )
}
