import { MessageSquare, Mail, Database, Wrench, Terminal, FileText, Shield } from 'lucide-react'
import { Button } from '@/component/ui/button'
import { cn } from '@/lib/utils'

export type DeviceSubTab = 'message' | 'google' | 'data' | 'utility' | 'command' | 'instruction' | 'permission'

interface DeviceSubTabsProps {
  activeTab: DeviceSubTab
  onTabChange: (tab: DeviceSubTab) => void
  deviceId: string | null
}

export function DeviceSubTabs({ activeTab, onTabChange, deviceId }: DeviceSubTabsProps) {
  if (!deviceId) return null

  const tabs: Array<{ id: DeviceSubTab; label: string; icon: React.ElementType }> = [
    { id: 'message', label: 'Message', icon: MessageSquare },
    { id: 'google', label: 'Gmail / Drive', icon: Mail },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'utility', label: 'Utility', icon: Wrench },
    { id: 'command', label: 'Command', icon: Terminal },
    { id: 'instruction', label: 'Instruction', icon: FileText },
    { id: 'permission', label: 'Permission', icon: Shield },
  ]

  return (
    <div id="device-sub-tabs" className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-card/50 backdrop-blur-sm">
      {tabs.map(tab => {
        const Icon = tab.icon
        return (
          <Button
            key={tab.id}
            id={`device-sub-tab-${tab.id}`}
            data-testid={`device-sub-tab-${tab.id}`}
            variant={activeTab === tab.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "text-xs sm:text-sm whitespace-nowrap relative z-[100] transition-all",
              activeTab === tab.id 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
            )}
            type="button"
          >
            <Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            {tab.label}
          </Button>
        )
      })}
    </div>
  )
}
