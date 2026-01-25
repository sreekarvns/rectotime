import React, { useState, useEffect, memo } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  BarChart3,
  Settings,
  Menu,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Logo } from '../ui/Logo';

type ViewType = 'dashboard' | 'calendar' | 'timetable' | 'analytics' | 'settings';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isVideoBackground?: boolean;
}

/**
 * Main navigation sidebar for the productivity dashboard
 * Responsive: Collapsible on desktop, drawer on mobile
 */
const Sidebar: React.FC<SidebarProps> = memo(({ currentView, onViewChange, isVideoBackground = false }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu on view change
  const handleViewChange = (view: ViewType) => {
    onViewChange(view);
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobileOpen]);

  const menuItems: Array<{
    id: ViewType;
    label: string;
    icon: React.ReactNode;
    description: string;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      description: 'Overview & quick actions',
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: <Calendar className="w-5 h-5" />,
      description: 'Schedule & events',
    },
    {
      id: 'timetable',
      label: 'Timetable',
      icon: <Clock className="w-5 h-5" />,
      description: 'Hourly schedule',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Productivity insights',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
      description: 'Preferences',
    },
  ];

  // Mobile hamburger button (visible only on mobile)
  const MobileMenuButton = () => (
    <button
      onClick={() => setIsMobileOpen(true)}
      className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg shadow-lg ${
        isVideoBackground
          ? 'bg-black/40 backdrop-blur text-white'
          : 'bg-white dark:bg-background-darkSecondary text-primary-dark dark:text-white'
      }`}
      aria-label="Open navigation menu"
    >
      <Menu className="w-6 h-6" />
    </button>
  );

  // Mobile overlay
  const MobileOverlay = () => (
    <AnimatePresence>
      {isMobileOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </AnimatePresence>
  );

  // Collapsed sidebar for desktop
  if (!isMobile && isCollapsed) {
    return (
      <>
        <motion.aside
          className={`fixed left-0 top-0 h-full w-16 backdrop-blur border-r z-40 flex flex-col items-center py-4 ${
            isVideoBackground 
              ? 'bg-black/40 border-white/10' 
              : 'bg-white/95 dark:bg-background-darkSecondary/95 border-secondary-light dark:border-gray-700'
          }`}
          initial={{ width: 0 }}
          animate={{ width: 64 }}
          transition={{ duration: 0.2 }}
        >
          <button
            onClick={() => setIsCollapsed(false)}
            className={`mb-6 p-2 rounded-lg transition-colors ${
              isVideoBackground 
                ? 'hover:bg-white/10 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 space-y-2 flex flex-col items-center">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleViewChange(item.id)}
                className={`p-3 rounded-lg transition-all ${
                  currentView === item.id
                    ? 'bg-accent-blue text-white shadow-lg'
                    : isVideoBackground
                    ? 'text-white/80 hover:bg-white/10'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={item.label}
                aria-label={item.label}
                aria-current={currentView === item.id ? 'page' : undefined}
              >
                {item.icon}
              </button>
            ))}
          </div>

          <ThemeToggle />
        </motion.aside>
      </>
    );
  }

  // Full sidebar content
  const SidebarContent = () => (
    <>
      {/* Header */}
      <div className={`p-6 border-b flex items-center justify-between ${
        isVideoBackground ? 'border-white/10' : 'border-secondary-light dark:border-gray-700'
      }`}>
        <Logo />
        <button
          onClick={() => isMobile ? setIsMobileOpen(false) : setIsCollapsed(true)}
          className={`p-1 rounded transition-colors ${
            isVideoBackground 
              ? 'hover:bg-white/10 text-white' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title={isMobile ? "Close menu" : "Collapse sidebar"}
          aria-label={isMobile ? "Close menu" : "Collapse sidebar"}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto" role="navigation" aria-label="Main navigation">
        {menuItems.map(item => (
          <motion.button
            key={item.id}
            onClick={() => handleViewChange(item.id)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
              currentView === item.id
                ? 'bg-accent-blue text-white shadow-lg'
                : isVideoBackground
                ? 'text-white hover:bg-white/10'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            aria-current={currentView === item.id ? 'page' : undefined}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <div>
                <p className="font-medium">{item.label}</p>
                <p
                  className={`text-xs ${
                    currentView === item.id
                      ? 'text-blue-100'
                      : isVideoBackground
                      ? 'text-white/60'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {item.description}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </nav>

      {/* Footer */}
      <div className={`p-4 border-t space-y-4 ${
        isVideoBackground ? 'border-white/10' : 'border-secondary-light dark:border-gray-700'
      }`}>
        <ThemeToggle />
        <div className={`text-xs text-center ${
          isVideoBackground ? 'text-white/60' : 'text-gray-500 dark:text-gray-400'
        }`}>
          <p>Productivity Dashboard</p>
          <p>v1.0.0</p>
        </div>
      </div>
    </>
  );

  // Mobile: Drawer
  if (isMobile) {
    return (
      <>
        <MobileMenuButton />
        <MobileOverlay />
        <AnimatePresence>
          {isMobileOpen && (
            <motion.aside
              className={`fixed left-0 top-0 h-full w-72 backdrop-blur z-50 flex flex-col ${
                isVideoBackground 
                  ? 'bg-black/90 border-white/10' 
                  : 'bg-white dark:bg-background-darkSecondary'
              }`}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <SidebarContent />
            </motion.aside>
          )}
        </AnimatePresence>
      </>
    );
  }

  // Desktop: Full sidebar
  return (
    <motion.aside
      className={`fixed left-0 top-0 h-full w-64 backdrop-blur border-r z-40 flex flex-col ${
        isVideoBackground 
          ? 'bg-black/40 border-white/10' 
          : 'bg-white/95 dark:bg-background-darkSecondary/95 border-secondary-light dark:border-gray-700'
      }`}
      initial={{ width: 0 }}
      animate={{ width: 256 }}
      transition={{ duration: 0.2 }}
    >
      <SidebarContent />
    </motion.aside>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
