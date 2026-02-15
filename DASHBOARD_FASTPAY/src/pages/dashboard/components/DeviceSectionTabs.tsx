import { MessageSquare, Mail, Terminal, FileText, Shield } from 'lucide-react'
import { Button } from '@/component/ui/button'
import { cn } from '@/lib/utils'

export type DeviceSectionTab = 'message' | 'google' | 'command' | 'instruction' | 'permission'

interface DeviceSectionTabsProps {
  activeTab: DeviceSectionTab
  onTabChange: (tab: DeviceSectionTab) => void
  deviceId: string | null
  isAdmin?: boolean
}

export function DeviceSectionTabs({ activeTab, onTabChange, deviceId, isAdmin }: DeviceSectionTabsProps) {
  if (!deviceId) return null

  const tabs: Array<{ id: DeviceSectionTab; label: string; icon: React.ElementType; adminOnly?: boolean }> = [
    { id: 'message' as const, label: 'Message', icon: MessageSquare },
    { id: 'google' as const, label: 'Gmail', icon: Mail },
    { id: 'command' as const, label: 'Command', icon: Terminal, adminOnly: true },
    { id: 'instruction' as const, label: 'Instruction', icon: FileText },
    { id: 'permission' as const, label: 'Permission', icon: Shield, adminOnly: true },
  ]

  const filteredTabs = tabs.filter(tab => isAdmin || !tab.adminOnly)

  return (
    <div id="device-section-tabs" className="flex items-center gap-2 px-4 py-3 border border-border rounded-xl bg-transparent">
      {filteredTabs.map(tab => {
        const Icon = tab.icon as React.ElementType
        const isActive = activeTab === tab.id
        return (
          <Button
            key={tab.id}
            id={`device-section-tab-${tab.id}`}
            data-testid={`device-section-tab-${tab.id}`}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "py-2.5 px-4 text-sm whitespace-nowrap relative z-[100] transition-all rounded-xl",
              isActive
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground shadow-sm"
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
