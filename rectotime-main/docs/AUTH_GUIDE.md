# Authentication & Landing Pages

Complete authentication flow with smooth scroll animations for rectotime.

## Features

### 🏠 Landing Page (`/`)
- **Hero section** with animated background blobs
- **Features showcase** with 6 key features (Goal Tracking, Time Management, AI Companion, etc.)
- **Smooth scroll animations** using Framer Motion and `whileInView`
- **CTA sections** leading to signup
- **Responsive design** with dark mode support
- **Scroll indicator** with chevron animation

### 🔐 Login Page (`/login`)
- **Email/password authentication**
- **Form validation** with error messages
- **Loading states** with animated spinner
- **Glass morphism design** with backdrop blur
- **Animated background blobs**
- **Links** to signup and back to home

### 📝 Signup Page (`/signup`)
- **Registration form** (name, email, password, confirm password)
- **Password strength indicator** with real-time feedback
- **Password match validation** with checkmark icon
- **Form validation** with helpful error messages
- **Glass morphism design** matching login
- **Smooth animations** on all form interactions

### 🔒 Protected Routes
- **Dashboard** and main app features require authentication
- **Automatic redirect** to login if not authenticated
- **Loading state** while checking auth status

## Authentication Flow

```
Landing Page (/)
    ↓
Login (/login) or Signup (/signup)
    ↓
Dashboard (/dashboard) - Protected
```

## Tech Stack

- **React Router** v6 - Client-side routing
- **Framer Motion** - Smooth animations
- **Context API** - Auth state management
- **LocalStorage** - User persistence (development only)
- **TypeScript** - Type safety

## Smooth Scroll Features

### Global Smooth Scrolling
```css
html {
  scroll-behavior: smooth;
  scroll-padding-top: 80px;
}
```

### Scroll-triggered Animations
```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: '-100px' }}
  transition={{ duration: 0.6 }}
>
  Content
</motion.div>
```

### Parallax Effects
```tsx
const { scrollYProgress } = useScroll();
const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
```

## Usage

### Running the App

```bash
npm run dev
```

Visit `http://localhost:3001` (or whatever port Vite assigns)

### Creating an Account

1. Go to landing page
2. Click "Get Started Free" or "Sign Up"
3. Fill in the form:
   - Full name (min 2 characters)
   - Valid email address
   - Password (min 6 characters)
   - Confirm password
4. Click "Create Account"
5. You'll be automatically logged in and redirected to dashboard

### Logging In

1. Click "Sign In" from landing page
2. Enter email and password
3. Click "Sign In"
4. Redirected to dashboard

### Test Credentials

Since this uses localStorage, create your own account in the browser. The data persists across page reloads.

## File Structure

```
src/
├── contexts/
│   └── AuthContext.tsx       # Auth state and methods
├── pages/
│   ├── LandingPage.tsx       # Home page with features
│   ├── LoginPage.tsx         # Login form
│   └── SignupPage.tsx        # Registration form
├── components/
│   └── ProtectedRoute.tsx    # Route guard component
└── App.tsx                   # Routing setup
```

## Authentication Context API

```tsx
const { 
  user,              // Current user object or null
  isAuthenticated,   // Boolean auth status
  isLoading,         // Loading state
  login,             // (email, password) => Promise<boolean>
  signup,            // (name, email, password) => Promise<boolean>
  logout             // () => void
} = useAuth();
```

## Customization

### Change Landing Page Features

Edit the `features` array in `LandingPage.tsx`:

```tsx
const features = [
  {
    icon: <YourIcon />,
    title: 'Feature Name',
    description: 'Feature description'
  },
  // ...
];
```

### Modify Animations

All animations use Framer Motion. Adjust properties in the component files:

```tsx
<motion.div
  initial={{ opacity: 0, y: 30 }}    // Start state
  animate={{ opacity: 1, y: 0 }}      // End state
  transition={{ duration: 0.6 }}      // Timing
>
```

### Connect to Real Backend

Replace localStorage logic in `AuthContext.tsx` with API calls:

```tsx
const login = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  // Handle response...
};
```

## Performance

- **Code splitting** via React.lazy for heavy components
- **Optimized animations** using GPU-accelerated properties (transform, opacity)
- **Viewport intersection** for scroll animations (only animate when visible)
- **Memoization** where appropriate

## Security Notes

⚠️ **Current implementation is for development only!**

For production:
1. Use a real backend API
2. Hash passwords (bcrypt, argon2)
3. Implement JWT or session-based auth
4. Add HTTPS
5. Implement rate limiting
6. Add CSRF protection
7. Use secure, httpOnly cookies

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- All modern browsers with ES6+ support

## Troubleshooting

### "Cannot find module" errors
```bash
npm install
```

### Port already in use
Vite will automatically try another port, or specify manually:
```bash
npm run dev -- --port 3000
```

### Animations not smooth
- Check browser performance
- Reduce motion settings: prefers-reduced-motion
- Check for expensive render operations

## Next Steps

- [ ] Add password reset flow
- [ ] Add email verification
- [ ] Add OAuth providers (Google, GitHub)
- [ ] Add remember me functionality
- [ ] Add session timeout
- [ ] Add 2FA support

---

**Built with ❤️ for rectotime © 2026**
