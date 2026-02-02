import { Battery, CreditCard, Loader, Smartphone, User } from 'lucide-react'
import { Badge } from '@/component/ui/badge'
import { Card, CardContent } from '@/component/ui/card'

interface BankCardSummary {
  bank_name?: string | null
  account_name?: string | null
  account_number?: string | null
  status?: 'active' | 'inactive' | 'blocked'
  mobile_number?: string | null
  email?: string | null
  kyc_name?: string | null
}

interface DeviceSummaryCardsProps {
  bankCard: BankCardSummary | null
  loadingBankCard: boolean
  deviceStatus: string
  deviceStatusLabel: string
  deviceBatteryValue: number | null
  deviceLastSeenValue: number
  currentUserCode?: string | null
  formatLastSeen: (timestamp: number) => string
  maskSensitiveData: (value: string | null, type: 'account') => string
  getStatusBadgeVariant: (status: string) => 'default' | 'secondary' | 'destructive'
}

export function DeviceSummaryCards({
  bankCard,
  loadingBankCard,
  deviceStatus,
  deviceStatusLabel,
  deviceBatteryValue,
  deviceLastSeenValue,
  currentUserCode,
  formatLastSeen,
  maskSensitiveData,
  getStatusBadgeVariant,
}: DeviceSummaryCardsProps) {
  return (
    <Card className="w-full border border-border/60 rounded-xl bg-card/95 backdrop-blur-sm shadow-sm">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
            <Smartphone className="h-4 w-4 text-primary" />
            Info Bar
          </div>
          <Badge
            variant={deviceStatus === 'online' ? 'default' : deviceStatus === 'offline' ? 'destructive' : 'secondary'}
            className="text-[10px]"
          >
            {deviceStatusLabel}
          </Badge>
        </div>

        <div className="grid gap-3">
          <section className="rounded-lg border border-border/40 bg-muted/30 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
                <CreditCard className="h-4 w-4 text-primary" />
                Bank
              </div>
              {bankCard?.status && (
                <Badge variant={getStatusBadgeVariant(bankCard.status)} className="text-[10px]">
                  {bankCard.status}
                </Badge>
              )}
            </div>
            {loadingBankCard ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader className="h-3 w-3 animate-spin" />
                Loading bank details...
              </div>
            ) : bankCard ? (
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Bank name</p>
                  <p className="font-medium">{bankCard.bank_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Acc name</p>
                  <p className="font-medium">{bankCard.account_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Account number</p>
                  <p className="font-mono font-medium">
                    {bankCard.account_number ? maskSensitiveData(bankCard.account_number, 'account') : 'N/A'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No bank details available</p>
            )}
          </section>

          <section className="rounded-lg border border-border/40 bg-muted/30 p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
              <User className="h-4 w-4 text-primary" />
              Contact
            </div>
            {loadingBankCard ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader className="h-3 w-3 animate-spin" />
                Loading contact details...
              </div>
            ) : bankCard ? (
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Mobile</p>
                  <p className="font-medium">{bankCard.mobile_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{bankCard.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">KYC name</p>
                  <p className="font-medium">{bankCard.kyc_name || 'N/A'}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No contact details available</p>
            )}
          </section>

          <section className="rounded-lg border border-border/40 bg-muted/30 p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
              <Smartphone className="h-4 w-4 text-primary" />
              Device
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Battery</p>
                  <p className="font-medium">{deviceBatteryValue !== null ? `${deviceBatteryValue}%` : 'N/A'}</p>
                </div>
                <Battery className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Code</p>
                <p className="font-mono font-medium">{currentUserCode || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last seen</p>
                <p className="font-medium">{deviceLastSeenValue ? formatLastSeen(deviceLastSeenValue) : 'N/A'}</p>
              </div>
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  )
}
