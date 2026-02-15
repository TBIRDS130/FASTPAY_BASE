import { useState } from 'react'
import { BankcardSubTabs, type BankcardSubTab } from '@/pages/dashboard/components/BankcardSubTabs'
import { BankCardSidebar } from '@/component/BankCardSidebar'
import { UtilitySectionView } from '@/pages/dashboard/views/UtilitySectionView'
import { Card, CardContent } from '@/component/ui/card'
import { Wrench, Settings, Smartphone, Database, FileText, Download } from 'lucide-react'

export interface DeviceSectionRightSidebarProps {
  deviceId: string | null
  sessionEmail?: string | null
  isAdmin?: boolean
}

export function DeviceSectionRightSidebar({
  deviceId,
  sessionEmail = null,
  isAdmin = false,
}: DeviceSectionRightSidebarProps) {
  const [rightSubTab, setRightSubTab] = useState<BankcardSubTab>('bankcard')

  if (!deviceId) {
    return (
      <div className="text-sm text-muted-foreground p-4">
        Select a device to view bank cards
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 mb-3">
        <BankcardSubTabs activeTab={rightSubTab} onTabChange={setRightSubTab} />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        {rightSubTab === 'bankcard' && (
          <BankCardSidebar deviceId={deviceId} className="flex-1" />
        )}
        {rightSubTab === 'utilities' && (
          <UtilitySectionView
            deviceId={deviceId}
            sessionEmail={sessionEmail}
            isAdmin={isAdmin}
          />
        )}

        {/* Placeholder utilities content for demonstration */}
        {rightSubTab === 'utilities' && !deviceId && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="text-center text-muted-foreground">
                <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">Utilities</p>
                <p className="text-xs mt-1">Select a device to view utilities</p>
                <div className="mt-4 space-y-2 text-left">
                  <div className="flex items-center gap-2 text-xs">
                    <Settings className="h-3 w-3" />
                    <span>Device Settings</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Smartphone className="h-3 w-3" />
                    <span>Device Diagnostics</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Database className="h-3 w-3" />
                    <span>Data Management</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <FileText className="h-3 w-3" />
                    <span>System Logs</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Download className="h-3 w-3" />
                    <span>Export Tools</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
