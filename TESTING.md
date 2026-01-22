# 🧪 Testing Guide - Productivity OS

## Overview
This document outlines the testing strategy for the productivity dashboard.

---

## Unit Tests

### Goal Management (`useGoalManagement.ts`)

```typescript
import { renderHook, act } from '@testing-library/react';
import { useGoalManagement } from '../hooks/useGoalManagement';

describe('useGoalManagement', () => {
  it('should initialize with provided goals', () => {
    const initialGoals = [
      { id: '1', title: 'Test Goal', current: 0, target: 5, ... }
    ];
    const { result } = renderHook(() => useGoalManagement(initialGoals));
    expect(result.current.goals).toEqual(initialGoals);
  });

  it('should add a new goal with unique ID', () => {
    const { result } = renderHook(() => useGoalManagement([]));
    act(() => {
      result.current.addGoal({
        title: 'New Goal',
        target: 10,
        current: 0,
        unit: 'tasks',
        ...
      });
    });
    expect(result.current.goals).toHaveLength(1);
    expect(result.current.goals[0].id).toBeDefined();
  });

  it('should update goal progress', () => {
    const goal = { id: '1', title: 'Goal', current: 0, target: 5, ... };
    const { result } = renderHook(() => useGoalManagement([goal]));
    
    act(() => {
      result.current.updateGoal('1', { current: 3 });
    });
    
    expect(result.current.goals[0].current).toBe(3);
  });

  it('should delete a goal', () => {
    const goals = [
      { id: '1', title: 'Goal 1', ... },
      { id: '2', title: 'Goal 2', ... }
    ];
    const { result } = renderHook(() => useGoalManagement(goals));
    
    act(() => {
      result.current.deleteGoal('1');
    });
    
    expect(result.current.goals).toHaveLength(1);
    expect(result.current.goals[0].id).toBe('2');
  });

  it('should persist goals to localStorage', () => {
    const { result } = renderHook(() => useGoalManagement([]));
    act(() => {
      result.current.addGoal({ title: 'Goal', target: 5, current: 0, ... });
    });
    
    const saved = JSON.parse(localStorage.getItem('productivity_goals') || '[]');
    expect(saved).toHaveLength(1);
  });
});
```

### Timer Preset (`useTimerPreset.ts`)

```typescript
describe('useTimerPreset', () => {
  it('should start a Pomodoro timer', () => {
    const { result } = renderHook(() => useTimerPreset());
    
    act(() => {
      result.current.startPresetTimer('pomodoro', 25);
    });
    
    expect(result.current.timerMode).toBe('pomodoro');
    expect(result.current.isActive).toBe(true);
  });

  it('should countdown every second', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useTimerPreset());
    
    act(() => {
      result.current.startPresetTimer('pomodoro', 25);
    });
    
    const initialTime = result.current.timeRemaining;
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    expect(result.current.timeRemaining).toBe(initialTime - 1);
    jest.useRealTimers();
  });

  it('should pause timer', () => {
    const { result } = renderHook(() => useTimerPreset());
    act(() => {
      result.current.startPresetTimer('pomodoro', 25);
      result.current.pauseTimer();
    });
    
    expect(result.current.isActive).toBe(false);
  });

  it('should stop and reset timer', () => {
    const { result } = renderHook(() => useTimerPreset());
    act(() => {
      result.current.startPresetTimer('pomodoro', 25);
      result.current.stopTimer();
    });
    
    expect(result.current.isActive).toBe(false);
    expect(result.current.timeRemaining).toBe(0);
    expect(result.current.timerMode).toBe('manual');
  });
});
```

---

## Component Tests

### GoalsWidget

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { GoalsWidget } from '../components/Dashboard/GoalsWidget';

describe('GoalsWidget', () => {
  const mockProps = {
    goals: [],
    onAddGoal: jest.fn(),
    onUpdateGoal: jest.fn(),
    onDeleteGoal: jest.fn(),
  };

  it('should render add goal button', () => {
    render(<GoalsWidget {...mockProps} />);
    const button = screen.getByText(/Add Goal/i);
    expect(button).toBeInTheDocument();
  });

  it('should show form when add goal is clicked', () => {
    render(<GoalsWidget {...mockProps} />);
    fireEvent.click(screen.getByText(/Add Goal/i));
    expect(screen.getByPlaceholderText(/Goal title/i)).toBeInTheDocument();
  });

  it('should display goals', () => {
    const goals = [
      { 
        id: '1', 
        title: 'Test Goal', 
        current: 2, 
        target: 10, 
        unit: 'tasks',
        completed: false,
        ...
      }
    ];
    render(<GoalsWidget {...mockProps} goals={goals} />);
    expect(screen.getByText('Test Goal')).toBeInTheDocument();
    expect(screen.getByText(/2\/10/)).toBeInTheDocument();
  });

  it('should call onAddGoal when form is submitted', () => {
    render(<GoalsWidget {...mockProps} />);
    fireEvent.click(screen.getByText(/Add Goal/i));
    
    fireEvent.change(screen.getByPlaceholderText(/Goal title/i), {
      target: { value: 'New Goal' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Description/i), {
      target: { value: 'Do something' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Target/i), {
      target: { value: '10' }
    });
    
    fireEvent.click(screen.getByText(/Add Goal$/i)); // Add Goal button in form
    
    expect(mockProps.onAddGoal).toHaveBeenCalled();
  });

  it('should increment goal progress', () => {
    const goals = [
      { id: '1', title: 'Goal', current: 0, target: 5, completed: false, ... }
    ];
    render(<GoalsWidget {...mockProps} goals={goals} />);
    
    fireEvent.click(screen.getByTitle(/Increase progress/i));
    expect(mockProps.onUpdateGoal).toHaveBeenCalledWith('1', { current: 1, completed: false });
  });

  it('should mark goal as complete when target reached', () => {
    render(<GoalsWidget {...mockProps} />);
    
    // Increment until target reached
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByTitle(/Increase progress/i));
    }
    
    expect(mockProps.onUpdateGoal).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ completed: true })
    );
  });
});
```

### TimeTrackingWidget

```typescript
describe('TimeTrackingWidget', () => {
  const mockProps = {
    currentStatus: {
      activity: null,
      timeSpent: 0,
      focusScore: { value: 0, trend: 'stable', factors: [] },
      isIdle: false,
    },
    onStart: jest.fn(),
    onPause: jest.fn(),
    onStop: jest.fn(),
  };

  it('should display manual timer by default', () => {
    render(<TimeTrackingWidget {...mockProps} />);
    expect(screen.getByText(/0:00/)).toBeInTheDocument();
  });

  it('should start preset timer', () => {
    render(<TimeTrackingWidget {...mockProps} />);
    fireEvent.click(screen.getByText(/Pomodoro/i));
    expect(screen.getByText(/25m/)).toBeInTheDocument();
  });

  it('should display timer presets', () => {
    render(<TimeTrackingWidget {...mockProps} />);
    expect(screen.getByText(/Pomodoro/i)).toBeInTheDocument();
    expect(screen.getByText(/Short Break/i)).toBeInTheDocument();
    expect(screen.getByText(/Long Break/i)).toBeInTheDocument();
  });

  it('should allow custom timer', () => {
    render(<TimeTrackingWidget {...mockProps} />);
    const input = screen.getByPlaceholderText(/Minutes/i);
    
    fireEvent.change(input, { target: { value: '45' } });
    fireEvent.click(screen.getByText(/Custom/i));
    
    // Verify custom timer is set
    expect(screen.getByDisplayValue('45')).toBeInTheDocument();
  });
});
```

---

## Integration Tests

### User Goal Workflow

```typescript
describe('Goal Workflow Integration', () => {
  it('should allow user to add, update, and complete a goal', () => {
    const { getByText, getByPlaceholderText } = render(
      <App />
    );

    // Add goal
    fireEvent.click(getByText(/Add Goal/i));
    fireEvent.change(getByPlaceholderText(/Goal title/i), {
      target: { value: 'Solve 10 LeetCode problems' }
    });
    fireEvent.change(getByPlaceholderText(/Target/i), {
      target: { value: '10' }
    });
    fireEvent.click(getByText(/Add Goal$/i));

    // Verify goal added
    expect(getByText(/Solve 10 LeetCode problems/i)).toBeInTheDocument();

    // Increment progress
    for (let i = 0; i < 10; i++) {
      fireEvent.click(getByTitle(/Increase progress/i));
    }

    // Verify goal marked complete
    expect(getByText(/All goals completed/i)).toBeInTheDocument();
  });
});
```

### User Timer Workflow

```typescript
describe('Timer Workflow Integration', () => {
  it('should allow user to start, pause, and stop timer', () => {
    const { getByText } = render(<App />);

    // Start manual timer
    fireEvent.click(getByText(/Start/i));
    expect(getByText(/Manual Timer/i)).toBeInTheDocument();

    // Pause timer
    fireEvent.click(getByText(/Pause/i));

    // Stop timer
    fireEvent.click(getByText(/Stop/i));
    expect(getByText(/0:00/)).toBeInTheDocument();
  });

  it('should countdown Pomodoro timer', async () => {
    jest.useFakeTimers();
    const { getByText } = render(<App />);

    fireEvent.click(getByText(/Pomodoro/i));
    expect(getByText(/25:00/)).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(60000); // 1 minute
    });

    expect(getByText(/24:00/)).toBeInTheDocument();
    jest.useRealTimers();
  });
});
```

---

## E2E Tests (Cypress)

```typescript
describe('Productivity Dashboard E2E', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3001');
  });

  it('should display dashboard on load', () => {
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Goals').should('exist');
    cy.contains('Time Tracker').should('exist');
  });

  it('should navigate between views', () => {
    cy.contains('Goals').click();
    cy.contains('Track and manage your objectives').should('be.visible');

    cy.contains('Activity').click();
    cy.contains("Monitor your productivity patterns").should('be.visible');

    cy.contains('Settings').click();
    cy.contains('Configure your productivity dashboard').should('be.visible');
  });

  it('should add and track a goal', () => {
    cy.contains('Add Goal').click();
    cy.get('input[placeholder="Goal title"]').type('Test Goal');
    cy.get('input[placeholder="Target"]').type('5');
    cy.contains('Add Goal').click();

    cy.contains('Test Goal').should('be.visible');
    cy.contains('0/5').should('be.visible');
  });

  it('should use Pomodoro timer', () => {
    cy.contains('Pomodoro').click();
    cy.contains('25:00').should('be.visible');
    cy.contains('Pause').should('be.visible');
  });

  it('should toggle theme', () => {
    cy.get('body').should('have.class', 'light');
    cy.contains('Theme').parent().find('button').click();
    cy.get('body').should('have.class', 'dark');
  });
});
```

---

## Running Tests

```bash
# Unit & Component tests
npm run test

# Watch mode
npm run test --watch

# Coverage report
npm run test --coverage

# E2E tests
npm run cypress:open

# E2E headless
npm run cypress:run
```

---

## Coverage Goals

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

---

## Accessibility Testing

```bash
# Install axe DevTools
npm install --save-dev jest-axe

# Run accessibility tests
npm run test:a11y
```

---

## Performance Testing

```bash
# Lighthouse CI
npm install --save-dev @lhci/cli@^0.9.0

# Run tests
lhci autorun
```

---

## Manual Testing Checklist

- [ ] Add goal with all fields
- [ ] Update goal progress (+ and -)
- [ ] Delete goal
- [ ] Mark goal as complete
- [ ] Start manual timer
- [ ] Start Pomodoro timer
- [ ] Pause/resume timer
- [ ] Stop timer
- [ ] Custom timer
- [ ] Toggle theme (light/dark)
- [ ] View analytics
- [ ] Check responsive on mobile/tablet
- [ ] Keyboard navigation
- [ ] Error handling (clear localStorage and reload)

---

## Debugging Tips

```typescript
// Log component state
console.log('Goals:', goals);
console.log('Timer:', { timerMode, timeRemaining, isActive });

// Debug localStorage
localStorage.getItem('productivity_goals')

// React DevTools
// 1. Install React DevTools browser extension
// 2. Inspect components, view props and state
```

---

**Last Updated**: January 2026
