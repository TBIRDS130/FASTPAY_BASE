import { CreditCard, Wrench } from 'lucide-react'
import { Button } from '@/component/ui/button'
import { cn } from '@/lib/utils'
import { SectionAnimator } from '@/component/SectionAnimator'

export type BankSectionTab = 'bankcard' | 'utilities'

interface BankSectionTabsProps {
  activeTab: BankSectionTab
  onTabChange: (tab: BankSectionTab) => void
}

const TABS: Array<{ id: BankSectionTab; label: string; icon: React.ElementType }> = [
  { id: 'bankcard', label: 'Bank Card', icon: CreditCard },
  { id: 'utilities', label: 'Utilities', icon: Wrench },
]

export function BankSectionTabs({ activeTab, onTabChange }: BankSectionTabsProps) {
  return (
    <SectionAnimator 
      sectionKey="bank-section-tabs" 
      delay={0} 
      animation="slideUp"
      className="w-full"
    >
      <div
        id="bank-section-tabs"
        className="flex items-center gap-2 px-4 py-3 border border-border rounded-xl bg-transparent"
      >
        {TABS.map((tab, index) => {
          const Icon = tab.icon as React.ElementType
          const isActive = activeTab === tab.id
          return (
            <SectionAnimator 
              key={tab.id}
              sectionKey={`bank-section-tab-${tab.id}`}
              delay={index * 100}
              animation="slideInLeft"
              className="inline-block"
            >
              <Button
                id={`bank-section-tab-${tab.id}`}
                data-testid={`bank-section-tab-${tab.id}`}
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
            </SectionAnimator>
          )
        })}
      </div>
    </SectionAnimator>
  )
}
