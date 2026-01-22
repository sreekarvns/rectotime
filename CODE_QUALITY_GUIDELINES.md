# 📖 Productivity Dashboard - Code Quality Guidelines & Standards

**Version:** 2.0  
**Last Updated:** January 22, 2026  
**Status:** FAANG-Level Standard  

---

## 🎯 Core Principles

This codebase follows these non-negotiable principles:

### 1. **Type Safety First** 🛡️
```tsx
// ✅ GOOD: Full type safety
interface UserGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  category: 'leetcode' | 'applications' | 'learning' | 'other';
  completed: boolean;
}

// ❌ BAD: No type safety
const goal = {
  id: Math.random(),
  title: undefined,
  target: 'ten',
  // ...
}
```

### 2. **Single Responsibility Principle** 📦
```tsx
// ✅ GOOD: Component has one job
export const GoalCard: React.FC<{ goal: Goal }> = ({ goal }) => (
  <div>
    <h3>{goal.title}</h3>
    <ProgressBar value={goal.current / goal.target * 100} />
  </div>
);

// ❌ BAD: Component does too much
export const GoalDashboard: React.FC = () => {
  // 300+ lines including goals, timers, calendar, etc.
}
```

### 3. **DRY (Don't Repeat Yourself)** 🔄
```tsx
// ✅ GOOD: Extract repeated logic into hooks
const { goals, addGoal, updateGoal, deleteGoal } = useGoalManagement(initialGoals);

// ❌ BAD: Repeat the same logic in multiple components
const [goals, setGoals] = useState([]);
useEffect(() => {
  const stored = localStorage.getItem('goals');
  // ... repeat in every component
}, []);
```

### 4. **Clear Naming Conventions** 📝
```tsx
// ✅ GOOD: Self-documenting code
const handleGoalCompletion = (goalId: string) => { /* ... */ }
const isTimerRunning = isActive && timeRemaining > 0;
const formatTimerDisplay = (seconds: number): string => { /* ... */ }

// ❌ BAD: Cryptic names
const h = (g) => { /* ... */ }
const flag = true;
const fmt = (s) => { /* ... */ }
```

### 5. **Immutability in State** 🔒
```tsx
// ✅ GOOD: Create new state objects
setGoals(prevGoals => 
  prevGoals.map(g => 
    g.id === goalId ? { ...g, current: g.current + 1 } : g
  )
);

// ❌ BAD: Mutate state directly
goals[0].current += 1;
setGoals(goals); // React won't detect the change!
```

---

## 🏗️ Folder Structure Standards

```
src/
├── components/
│   ├── features/
│   │   ├── Calendar/          # Feature modules
│   │   ├── Timetable/
│   │   └── Settings/
│   ├── Dashboard/             # Dashboard-specific
│   ├── AICompanion/
│   ├── Onboarding/
│   ├── ui/                    # Reusable UI (Button, Card, etc.)
│   └── ErrorBoundary.tsx
│
├── hooks/                     # Custom React hooks
│   ├── useGoalManagement.ts
│   ├── useTimerPreset.ts
│   └── useSettings.ts
│
├── contexts/                  # React Context
│   └── ThemeContext.tsx
│
├── types/                     # TypeScript definitions
│   ├── index.ts
│   └── calendar.ts
│
├── utils/                     # Utility functions
│   ├── aiGuidance.ts
│   ├── aiService.ts
│   ├── accessibility.ts
│   ├── activityMonitor.ts
│   ├── storage.ts
│   └── validation.ts
│
├── constants/                 # Configuration
│   └── config.ts
│
├── App.tsx                    # Main component
├── main.tsx                   # Entry point
└── index.css                  # Global styles
```

### Folder Rules
- **features/** - Feature modules with related components
- **components/** - Reusable UI components
- **hooks/** - Shared stateful logic
- **utils/** - Stateless utility functions
- **types/** - TypeScript definitions (never import from here unnecessarily)

---

## 📋 Component Guidelines

### Component Size
- **Small:** < 100 lines (Presentational components)
- **Medium:** 100-300 lines (Components with logic)
- **Large:** 300-500 lines (Complex features)
- **Too Large:** > 500 lines (Split into smaller components!)

### Template
```tsx
import React from 'react';
import { SomeIcon } from 'lucide-react';
import type { SomeType } from '../types';
import { SomeComponent } from './SomeComponent';

interface MyComponentProps {
  title: string;
  onAction?: (id: string) => void;
}

/**
 * Brief description of what this component does
 * @param title - The title to display
 * @param onAction - Callback when action occurs
 */
export const MyComponent: React.FC<MyComponentProps> = ({ 
  title, 
  onAction 
}) => {
  // Hooks
  const [isOpen, setIsOpen] = React.useState(false);

  // Handlers
  const handleClick = () => {
    setIsOpen(!isOpen);
    onAction?.(title);
  };

  // Render
  return (
    <div className="space-y-4">
      <h2>{title}</h2>
      <button onClick={handleClick}>
        {isOpen ? 'Close' : 'Open'}
      </button>
    </div>
  );
};

export default MyComponent;
```

### Do's ✅
- Use functional components with hooks
- Destructure props with TypeScript
- Add JSDoc comments for public components
- Use explicit return types
- Handle all error cases
- Memoize expensive computations
- Use useCallback for callbacks
- Implement proper key prop in lists

### Don'ts ❌
- Don't use `any` type
- Don't mutate state directly
- Don't create new functions in render
- Don't pass new objects as default props
- Don't leave console.log in production
- Don't hardcode values (use constants)
- Don't create huge components
- Don't forget error handling

---

## 🎨 Styling Standards

### Tailwind CSS Only
```tsx
// ✅ GOOD: Use Tailwind classes
<div className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-gray-900">
  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Title</h3>
</div>

// ❌ BAD: Inline styles or CSS modules (use Tailwind)
<div style={{ display: 'flex', justifyContent: 'space-between' }}>
```

### Color Palette
- **Primary:** `text-primary-dark`, `bg-primary-dark`
- **Secondary:** `text-secondary-light`, `bg-secondary-light`
- **Accent:** `bg-accent-blue`, `text-accent-blue`
- **Dark Mode:** Use `dark:` prefix for all dark mode styles
- **Gray Scale:** `gray-50` to `gray-900`

### Responsive Design
```tsx
// ✅ GOOD: Mobile-first responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Stacks on mobile, 2 cols on tablet, 4 cols on desktop */}
</div>

// ❌ BAD: Only desktop sizes
<div className="grid grid-cols-4 gap-4">
```

### Animations
```tsx
// ✅ GOOD: Smooth transitions
className="transition-all duration-300 hover:shadow-lg"

// ❌ BAD: Abrupt changes
// No transition at all
```

---

## 🧪 State Management Standards

### Local State (useState)
Use for component-specific state:
```tsx
const [isOpen, setIsOpen] = useState(false);
const [activeTab, setActiveTab] = useState('goals');
```

### Custom Hooks
Use for shared stateful logic:
```tsx
const { goals, addGoal, updateGoal } = useGoalManagement(initialGoals);
const { timerMode, timeRemaining, isActive } = useTimerPreset();
```

### Context API
Use for global app state:
```tsx
const { isDarkMode, toggleTheme } = useTheme();
```

### localStorage
Use for persistence:
```tsx
useEffect(() => {
  localStorage.setItem('key', JSON.stringify(value));
}, [value]);
```

### Rules
- Never mutate state directly
- Always use updater functions in useState
- Manage effects with useEffect dependencies
- Extract custom hooks for complex logic
- Use Context for global state only

---

## 🛡️ Error Handling Standards

### Validation
```tsx
// ✅ GOOD: Validate before operations
const handleAddGoal = (goal: GoalInput) => {
  if (!goal.title?.trim()) {
    showError('Title is required');
    return;
  }
  if (goal.target <= 0) {
    showError('Target must be positive');
    return;
  }
  addGoal(goal);
};

// ❌ BAD: No validation
const handleAddGoal = (goal: any) => {
  addGoal(goal); // May crash!
};
```

### Try-Catch
```tsx
// ✅ GOOD: Handle async errors
const loadData = async () => {
  try {
    const data = await fetchData();
    setData(data);
  } catch (error) {
    console.error('Failed to load data:', error);
    showError('Could not load data');
  }
};
```

### Error Boundary
```tsx
// ✅ GOOD: Wrap components that may crash
<ErrorBoundary>
  <GoalCard goal={goal} />
</ErrorBoundary>
```

---

## 📚 Documentation Standards

### JSDoc Comments
```tsx
/**
 * Formats seconds into HH:MM:SS display format
 * @param seconds - The duration in seconds
 * @returns Formatted string like "02:45:30"
 * @example
 * formatTime(165) // returns "00:02:45"
 */
export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};
```

### Inline Comments
```tsx
// Use for "why", not "what"

// ✅ GOOD
// Reset to midnight to compare dates without time component
const today = new Date();
today.setHours(0, 0, 0, 0);

// ❌ BAD
// Set hours to 0
today.setHours(0, 0, 0, 0);
```

### File Headers
```tsx
/**
 * Goal Management Hook
 * 
 * Handles CRUD operations for goals with localStorage persistence.
 * 
 * Features:
 * - Add/update/delete goals
 * - Auto-save to localStorage
 * - Memoized callbacks to prevent unnecessary renders
 * 
 * @example
 * const { goals, addGoal } = useGoalManagement(initialGoals);
 */
```

---

## 🚀 Performance Standards

### Memoization
```tsx
// ✅ GOOD: Memoize expensive computations
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data);
}, [data]);

// ✅ GOOD: Memoize callbacks
const handleChange = useCallback((value: string) => {
  // Only recreated if deps change
}, [dependency]);

// ❌ BAD: No memoization for expensive operations
const value = calculateExpensiveValue(data); // Runs every render!
```

### Component Memoization
```tsx
// ✅ GOOD: Memoize pure components that receive same props
export const GoalCard = React.memo(({ goal }: Props) => (
  <div>{goal.title}</div>
));

// ✅ GOOD: Memoize with custom comparison
export const GoalCard = React.memo(
  ({ goal }: Props) => <div>{goal.title}</div>,
  (prev, next) => prev.goal.id === next.goal.id
);
```

### useEffect Dependencies
```tsx
// ✅ GOOD: Proper dependencies
useEffect(() => {
  const handler = () => console.log('Event');
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []); // Empty = runs once on mount

// ❌ BAD: Missing dependencies (stale closures)
useEffect(() => {
  const handler = () => console.log(data);
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
  // Missing [data] dependency!
}, []);
```

---

## 🔐 Security Standards

### Never
```tsx
// ❌ Never hardcode secrets
const API_KEY = 'sk-1234567890abcdef';

// ❌ Never use eval()
eval(userInput);

// ❌ Never trust user input without validation
localStorage.setItem(userInput, value);
```

### Always
```tsx
// ✅ Always use environment variables
const API_KEY = import.meta.env.VITE_API_KEY;

// ✅ Always validate input
if (!isValidEmail(email)) {
  return error('Invalid email');
}

// ✅ Always escape output (React does this by default)
<div>{userContent}</div> // Safe from XSS
```

---

## 🧪 Testing Standards

### Unit Test Structure
```tsx
describe('formatTime', () => {
  it('should format seconds to HH:MM:SS', () => {
    expect(formatTime(3661)).toBe('01:01:01');
  });

  it('should handle zero seconds', () => {
    expect(formatTime(0)).toBe('00:00:00');
  });
});
```

### Component Test Template
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { GoalCard } from './GoalCard';

describe('<GoalCard />', () => {
  it('should render goal title', () => {
    const goal = { id: '1', title: 'Learn React', current: 0, target: 10 };
    render(<GoalCard goal={goal} />);
    expect(screen.getByText('Learn React')).toBeInTheDocument();
  });

  it('should call onUpdate when progress button clicked', () => {
    const onUpdate = jest.fn();
    render(<GoalCard goal={goal} onUpdate={onUpdate} />);
    fireEvent.click(screen.getByText('+'));
    expect(onUpdate).toHaveBeenCalled();
  });
});
```

---

## 📋 Code Review Checklist

Before submitting code, verify:

### Functionality ✅
- [ ] Feature works as intended
- [ ] All edge cases handled
- [ ] No console errors/warnings
- [ ] Responsive design verified
- [ ] Mobile tested

### Code Quality ✅
- [ ] TypeScript strict mode passes
- [ ] No `any` types
- [ ] Meaningful variable names
- [ ] Functions are pure (no side effects)
- [ ] DRY principle applied

### Performance ✅
- [ ] No unnecessary re-renders
- [ ] useCallback used for callbacks
- [ ] useMemo used for expensive computations
- [ ] Large lists have keys
- [ ] No memory leaks

### Accessibility ✅
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation works
- [ ] Color contrast adequate
- [ ] Screen reader friendly
- [ ] Focus visible

### Documentation ✅
- [ ] JSDoc comments added
- [ ] Complex logic explained
- [ ] File headers present
- [ ] Examples provided where helpful

---

## 🎓 Learning Resources

### Official Documentation
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Best Practices
- [FAANG Architecture Patterns](https://github.com/goldbergyoni/javascript-patterns)
- [React Design Patterns](https://patterns.dev/posts/react-patterns)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)

---

## 🎯 Summary

Follow these guidelines to maintain **FAANG-level code quality**:

1. **Type Safety:** Use TypeScript strictly
2. **Clean Code:** Follow naming and structure conventions
3. **Performance:** Optimize renders and computations
4. **Accessibility:** WCAG AA compliant
5. **Security:** Validate input, never hardcode secrets
6. **Testing:** Write testable code
7. **Documentation:** Comment the why, not the what
8. **Code Review:** Verify quality before merging

---

**Remember:** Code is read 10x more than it's written. Write for future maintainers!
