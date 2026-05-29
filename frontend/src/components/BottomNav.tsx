import { Home, Search, Plus, User, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'dashboard', icon: Home, label: 'Home' },
  { id: 'progress', icon: BarChart, label: 'Progress' },
  { id: 'search', icon: Search, label: 'Search' },
  { id: 'add', icon: Plus, label: 'Add' },
  { id: 'profile', icon: User, label: 'Profile' },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border safe-bottom z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isAdd = tab.id === 'add';
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                //console.log("TAB CLICKED: ", tab.id);
                onTabChange(tab.id);
              }}
              className={cn(
                'flex flex-col items-center gap-0.5 transition-colors',
                isAdd
                  ? 'relative -mt-4'
                  : '',
                isActive && !isAdd ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {isAdd ? (
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-lg shadow-primary/30">
                  <Plus size={24} className="text-primary-foreground" />
                </div>
              ) : (
                <>
                  <tab.icon size={22} />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
