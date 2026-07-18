# 🕐 RectoTime Clock Theme Design System

## Design Philosophy: "Time as a Visual Language"

Every element in RectoTime echoes the mechanics and aesthetics of timekeeping devices—from analog watches to modern smartwatches. The design creates an intuitive connection between the user's productivity and the passage of time.

---

## 🎨 Color Palette

### Time-Based Colors
Colors represent different times of day, creating an emotional connection with productivity rhythms:

```css
--time-morning: #FFB84D  /* 6AM - Golden hour - Fresh start energy */
--time-noon: #FF6B35     /* 12PM - Peak sun - Maximum productivity */
--time-evening: #6B5CE8  /* 6PM - Dusk - Wind down, reflection */
--time-night: #2D3561    /* 12AM - Midnight - Deep focus, calm */
```

### Clock Elements
```css
--clock-face: Light: #FAFAFA / Dark: #1C1C1E
--clock-hand: Light: #1C1C1E / Dark: #FFFFFF
--hour-marker: #D1D1D6
--minute-marker: #E8E8ED
--clock-glow: rgba(0, 122, 255, 0.15/0.3)
```

---

## 🏗️ Component Architecture

### 1. **Logo Component** - Analog Clock
- **Real-time clock hands** that move with actual time
- **12 hour markers** around the perimeter
- **Gradient clock face** with subtle inner glow
- **Smooth animations** on hover and tap

```tsx
<Logo 
  size="md" 
  showText={true} 
  animated={true}  // Real-time clock
/>
```

### 2. **TimeDial Component** - Circular Progress
Perfect for tracking time, goals, or any metric with a clock-inspired circular design.

```tsx
<TimeDial
  progress={75}              // 0-100
  size="lg"                  // sm | md | lg | xl
  color="morning"            // primary | morning | noon | evening | night
  label="Focus Time"
  value="45min"
  showMarkers={true}         // Display 12 hour markers
/>
```

**Use Cases:**
- Pomodoro timer progress
- Daily goal completion
- Focus score visualization
- Activity time tracking
- Stress level indicators

### 3. **Card Component** - Clock Variants

```tsx
{/* Default card */}
<Card variant="default">Content</Card>

{/* Clock-themed card with glow effect on hover */}
<Card variant="clock">Content</Card>

{/* Glassmorphic card */}
<Card variant="glass">Content</Card>
```

### 4. **Button Component** - Circular & Time Variants

```tsx
{/* Time-gradient button */}
<Button variant="time">Start Timer</Button>

{/* Circular button (perfect for play/pause) */}
<Button shape="circular" size="md" icon={<Play />} />

{/* Accent gradient */}
<Button variant="accent">Save Goal</Button>
```

---

## 🎬 Animation System

### Clock Rotations
```css
.rotate-minute-hand  /* Full rotation: 60 minutes */
.rotate-hour-hand    /* Full rotation: 12 hours */
.rotate-clockwise    /* General clockwise: 60 seconds */
```

### Glow Effects
```css
.pulse-clock         /* Pulsing glow effect for active states */
.clock-glow          /* Static glow for emphasis */
```

### Example Usage:
```tsx
<motion.div 
  className="clock-face rotate-clockwise"
  whileHover={{ scale: 1.05 }}
>
  {/* Clock content */}
</motion.div>
```

---

## 📐 Layout Patterns

### Dashboard Grid with Clock Theme
```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Time Tracking Widget */}
  <Card variant="clock" className="p-6">
    <TimeDial
      progress={timeProgress}
      color="noon"
      size="xl"
      label="Active Session"
      value={formatTime(activeTime)}
    />
  </Card>

  {/* Goal Progress */}
  <Card variant="clock" className="p-6">
    <TimeDial
      progress={goalProgress}
      color="evening"
      size="xl"
      label="Daily Goal"
      value={`${goalProgress}%`}
    />
  </Card>

  {/* Focus Score */}
  <Card variant="clock" className="p-6">
    <TimeDial
      progress={focusScore}
      color="morning"
      size="xl"
      label="Focus Score"
      value={focusScore}
    />
  </Card>
</div>
```

---

## 🎯 Design Principles

### 1. **Circular First**
- Primary controls are circular (play, pause, stop)
- Progress indicators are clockfaces
- Hour markers guide the eye

### 2. **Time-Conscious Colors**
- Morning colors for starting tasks
- Noon colors for peak productivity
- Evening colors for winding down
- Night colors for focus mode

### 3. **Subtle Motion**
- Clock hands move smoothly
- Progress circles animate on load
- Hover states create gentle lifts and glows

### 4. **Hierarchical Timing**
- Seconds: Fast animations (0.3s)
- Minutes: Medium animations (1s)
- Hours: Slow, contemplative (2-3s)

---

## 🖼️ Figma Design Tokens

### Spacing (Clock-Inspired)
```
12px  → 12 hours
60px  → 60 minutes
360px → 360 degrees
```

### Sizes
```
sm: 80px   → Wrist watch
md: 128px  → Desk clock
lg: 192px  → Wall clock
xl: 256px  → Statement piece
```

### Border Radius
```
clock: 50%        → Perfect circles
card: 20px        → Softly rounded
button: 12px      → Gentle curves
```

---

## 💡 Implementation Examples

### Pomodoro Timer Widget
```tsx
<Card variant="clock" className="p-8">
  <div className="flex flex-col items-center gap-6">
    <TimeDial
      progress={(timeElapsed / totalTime) * 100}
      color={isWorkSession ? 'noon' : 'evening'}
      size="xl"
      value={formatTime(timeRemaining)}
      label={isWorkSession ? 'Focus Time' : 'Break Time'}
      showMarkers={true}
    />
    
    <div className="flex gap-3">
      <Button shape="circular" size="lg" onClick={toggleTimer}>
        {isRunning ? <Pause /> : <Play />}
      </Button>
      <Button shape="circular" size="lg" onClick={resetTimer}>
        <RotateCcw />
      </Button>
    </div>
  </div>
</Card>
```

### Activity Stats with Time Colors
```tsx
<div className="grid grid-cols-4 gap-4">
  {[
    { time: 'morning', label: 'Morning', hours: 3 },
    { time: 'noon', label: 'Afternoon', hours: 5 },
    { time: 'evening', label: 'Evening', hours: 2 },
    { time: 'night', label: 'Night', hours: 1 },
  ].map(period => (
    <Card key={period.time} variant="clock" className="p-4">
      <TimeDial
        progress={(period.hours / 8) * 100}
        color={period.time}
        size="md"
        value={`${period.hours}h`}
        label={period.label}
      />
    </Card>
  ))}
</div>
```

### Clock-Face Progress Bar
```tsx
<Card variant="clock" className="p-6">
  <div className="relative w-48 h-48 mx-auto">
    {/* Background clock face */}
    <div className="clock-face w-full h-full" />
    
    {/* Multiple progress rings */}
    <div className="absolute inset-0 flex items-center justify-center">
      <TimeDial progress={productivity} color="noon" size="lg" />
    </div>
    
    <div className="absolute inset-8 flex items-center justify-center">
      <TimeDial progress={focus} color="evening" size="md" />
    </div>
    
    <div className="absolute inset-16 flex items-center justify-center">
      <TimeDial progress={energy} color="morning" size="sm" />
    </div>
  </div>
</Card>
```

---

## 🚀 Quick Start Checklist

- [x] Install clock theme CSS variables
- [x] Update Tailwind config with time colors
- [x] Import `Logo`, `TimeDial`, `Card`, `Button` components
- [ ] Replace rectangular progress bars with `TimeDial`
- [ ] Add clock markers to circular elements
- [ ] Use time-based colors for different periods
- [ ] Implement circular buttons for primary actions
- [ ] Add subtle rotation animations

---

## 🎨 Figma Component Library Structure

```
RectoTime Design System
├── 🕐 Foundations
│   ├── Colors / Time Palette
│   ├── Typography / SF Pro
│   └── Effects / Clock Shadows & Glows
├── ⚙️ Components
│   ├── Logo / Analog Clock
│   ├── TimeDial / Progress Circles
│   ├── Cards / Clock Variants
│   ├── Buttons / Circular & Time
│   └── Icons / Clock Markers
└── 📱 Patterns
    ├── Dashboard Grid
    ├── Timer Widgets
    └── Stats Displays
```

---

## 📊 Usage Guidelines

### When to Use Clock Theme:
✅ Timer-related features  
✅ Progress tracking  
✅ Time-based statistics  
✅ Focus/productivity metrics  
✅ Daily/weekly goals  

### When to Use Subtle Variants:
⚠️ Settings and configuration  
⚠️ Text-heavy content  
⚠️ Forms and inputs  
⚠️ Data tables  

---

## 🔮 Future Enhancements

1. **Time-of-day Auto-theming**: Automatically adjust color schemes based on current time
2. **Analog Time Picker**: Clock-face interface for setting durations
3. **Chronological Animations**: Elements that sync with real-time
4. **Watch Face Variants**: Multiple clock styles (minimal, classic, modern)
5. **Sound Design**: Ticking sounds for timers (optional)

---

**Design Status**: ✅ Core System Implemented  
**Version**: 1.0.0  
**Last Updated**: March 6, 2026
