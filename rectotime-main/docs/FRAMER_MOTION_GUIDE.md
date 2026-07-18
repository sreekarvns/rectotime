# Framer Motion Integration Guide

## Overview

Framer Motion is now integrated into the rectotime frontend! This provides smooth animations, fluid transitions, and delightful micro-interactions throughout the app.

## Installed Version

- **framer-motion**: ^10.18.0

## Components with Animations

### 1. **AnimatedPage Components** ([src/components/ui/AnimatedPage.tsx](src/components/ui/AnimatedPage.tsx))

#### AnimatedPage
Wraps entire views with fade and slide transitions:
```tsx
import { AnimatedPage } from './components/ui/AnimatedPage';

<AnimatedPage>
  <YourViewContent />
</AnimatedPage>
```

#### StaggeredContainer & StaggeredItem
Creates beautiful sequential animations for lists/grids:
```tsx
import { StaggeredContainer, StaggeredItem } from './components/ui/AnimatedPage';

<StaggeredContainer>
  {items.map(item => (
    <StaggeredItem key={item.id}>
      <Card>{item.content}</Card>
    </StaggeredItem>
  ))}
</StaggeredContainer>
```

#### ModalBackdrop
Animated modal with backdrop blur:
```tsx
import { ModalBackdrop } from './components/ui/AnimatedPage';

<ModalBackdrop onClose={handleClose}>
  <div className="bg-white p-6 rounded-lg">
    Modal Content
  </div>
</ModalBackdrop>
```

#### SlideIn
Sidebar/panel animations from left or right:
```tsx
import { SlideIn } from './components/ui/AnimatedPage';

<SlideIn direction="left">
  <Sidebar />
</SlideIn>
```

#### AnimatedProgress
Smooth progress bar with gradient:
```tsx
import { AnimatedProgress } from './components/ui/AnimatedPage';

<AnimatedProgress value={75} className="my-4" />
```

#### TypingIndicator
Chat typing animation:
```tsx
import { TypingIndicator } from './components/ui/AnimatedPage';

{isTyping && <TypingIndicator />}
```

#### AnimatedCounter
Number animations with pulse:
```tsx
import { AnimatedCounter } from './components/ui/AnimatedPage';

<AnimatedCounter value={goalScore} duration={1} />
```

### 2. **Card Component** ([src/components/ui/Card.tsx](src/components/ui/Card.tsx))

Card with hover lift effect:
```tsx
<Card hover={true} onClick={handleClick}>
  <h3>Interactive Card</h3>
</Card>
```

### 3. **Button Component** ([src/components/ui/Button.tsx](src/components/ui/Button.tsx))

Buttons with press and hover effects:
```tsx
<Button variant="primary" size="md">
  Click Me
</Button>
```

### 4. **AI Companion** ([src/components/AICompanion/index.tsx](src/components/AICompanion/index.tsx))

Slide-in panel with smooth collapse animation

### 5. **Dashboard** ([src/components/Dashboard/index.tsx](src/components/Dashboard/index.tsx))

Staggered widget loading animations

## Animation Variants

### Common Patterns

#### Fade In
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

#### Slide Up
```tsx
<motion.div
  initial={{ y: 20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.4 }}
>
  Content
</motion.div>
```

#### Scale Pop
```tsx
<motion.div
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: 'spring', damping: 20 }}
>
  Content
</motion.div>
```

#### Hover Effects
```tsx
<motion.div
  whileHover={{ scale: 1.05, y: -4 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.2 }}
>
  Interactive Element
</motion.div>
```

## Layout Animations

Auto-animate layout changes:
```tsx
<motion.div layout>
  Content that changes size/position
</motion.div>
```

## Gesture Animations

```tsx
<motion.div
  drag
  dragConstraints={{ left: 0, right: 300 }}
  dragElastic={0.1}
>
  Draggable Element
</motion.div>
```

## Exit Animations with AnimatePresence

```tsx
import { AnimatePresence } from 'framer-motion';

<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Conditional Content
    </motion.div>
  )}
</AnimatePresence>
```

## Performance Tips

1. **Use `will-change` sparingly** - Framer Motion handles this automatically
2. **Prefer `transform` and `opacity`** - They're GPU-accelerated
3. **Use `layout` animations** instead of animating width/height directly
4. **Memoize components** when using heavy animations
5. **Avoid animating `filter` or `backdrop-filter`** for 60fps

## Advanced: Custom Variants

```tsx
const variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    transition: { duration: 0.3 }
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 }
  }
};

<motion.div
  variants={variants}
  initial="hidden"
  animate="visible"
  exit="exit"
>
  Content
</motion.div>
```

## Stagger Animations

```tsx
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
};

<motion.ul variants={container} initial="hidden" animate="visible">
  {items.map(item => (
    <motion.li key={item.id} variants={item}>
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

## Scroll Animations

```tsx
import { useScroll, useTransform } from 'framer-motion';

const { scrollYProgress } = useScroll();
const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

<motion.div style={{ opacity }}>
  Fades out on scroll
</motion.div>
```

## Current Implementation Status

✅ **Implemented:**
- Card hover animations
- Button press effects
- AI Companion slide-in
- Dashboard staggered loading
- Modal animations (via AnimatedPage utilities)

🚧 **Recommended Additions:**
- Page transition animations in App.tsx
- Goal completion animations
- Timer countdown animations
- Notification toast animations
- Calendar event drag animations

## Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Examples](https://www.framer.com/motion/examples/)
- [Animation Controls](https://www.framer.com/motion/animation/)
- [Gestures](https://www.framer.com/motion/gestures/)

## Example: Complete Animated Component

```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export const AnimatedGoalCard = ({ goal }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div
      layout
      className="p-4 bg-white rounded-lg shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ y: -4, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <motion.h3 layout="position">
        {goal.title}
      </motion.h3>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p>{goal.description}</p>
            <motion.div
              className="progress-bar"
              initial={{ width: 0 }}
              animate={{ width: `${goal.progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
```

---

**Enjoy smooth, delightful animations throughout rectotime! 🎨✨**
