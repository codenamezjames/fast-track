# Fast Track - Complete Rewrite Specification

**Version:** 2.0
**Target Stack:** AdonisJS v6 + Vue 3 + PostgreSQL
**Current Stack:** React 19 + Express + MongoDB

---

## Table of Contents

1. [Features](#1-features)
2. [New Stack Architecture](#2-new-stack-architecture)

---

# 1. Features

This section documents all user-facing features of the Fast Track fitness tracking application. All features are described as fully complete, focusing on **what** the app does and **why** it works this way.

---

## 1.1 Authentication & Account Management

### User Registration
- Users create accounts with email and password
- Email validation ensures unique accounts
- Passwords securely hashed and stored
- Minimum 6-character requirement

**Why:** Simple email/password auth keeps onboarding friction-free for a personal-use app. No social login needed for single-user fitness tracking.

### User Login
- Email and password authentication
- JWT-based session with access and refresh tokens
- Automatic token refresh on expiration
- Persistent login across sessions

**Why:** JWT tokens enable stateless API authentication, allowing the PWA to work offline and sync when online. Dual-token system (access + refresh) balances security with user experience.

### Session Management
- Automatic session restoration on app reload
- Seamless token refresh before expiration
- Redirect to login when unauthorized

**Why:** Users shouldn't have to log in every time they open the app. Auto-restoration maintains continuity while refresh tokens handle security.

---

## 1.2 Dashboard (Home Page)

### Motivational Greeting
- Dynamic greeting adapts to:
  - Time of day
  - Current streak status (cold → warm → hot → fire → inferno)
  - Active fasting status
  - Progress towards daily goals
  - Recent achievements

**Why:** Personalized motivation increases engagement. The greeting acknowledges user effort and creates emotional connection with the app.

### Quick Stats Overview
- **Today's Calories**: Intake vs goal with progress bar
- **This Week's Workouts**: Count of completed workouts
- **Current Weight**: Latest measurement with trend arrow
- **This Week's Distance**: Total km from all activities

**Why:** At-a-glance metrics answer "How am I doing today?" without requiring navigation. Weekly totals show progress patterns.

### Active Fasting Display
- Shows current fast with:
  - Elapsed time progress bar
  - Time remaining until goal
  - Percentage complete (0-100%)
  - Quick "End Fast" button
- Start fast button when no active fast

**Why:** Fasting requires continuous awareness of time. Prominent display keeps users motivated and informed. Quick actions reduce friction.

### Weekly Activity Calendar
- 7-day grid showing daily status:
  - Streak maintained (2+ activities: green)
  - Partial activity (1 activity: yellow)
  - No activity (gray)
  - Today highlighted
- Tap any day for detailed breakdown

**Why:** Visual patterns reveal consistency trends. Users see at-a-glance if they're building habits or falling off. Color-coding makes patterns immediately obvious.

### Streak Display
- Current streak count with intensity visualization
- Intensity levels:
  - **Cold** (0-6 days): Blue flame, just starting
  - **Warm** (7-29 days): Orange flame, building momentum
  - **Hot** (30-99 days): Red flame, strong habit
  - **Fire** (100-364 days): Multi-color, unstoppable
  - **Inferno** (365+ days): Rainbow, legendary
- Longest streak record
- Available freeze count with 🧊 indicator

**Why:** Gamification drives habit formation. Visual intensity progression creates aspiration. Seeing "fire" streak makes users not want to lose it. Freeze indicator shows safety net available.

### Quick Action Buttons
- Add Meal, Log Workout, Record Activity, Start Fast

**Why:** Reduce tap count to common actions. Users shouldn't have to navigate menus to log basic activities.

### Next Action Suggestion
- Intelligent recommendation based on:
  - Time of day
  - User habits
  - Incomplete activities
  - Examples: "Log breakfast", "Complete workout", "End fast", "Start your fast"

**Why:** Reduces decision fatigue. The app tells users what they should do next based on context and patterns.

### Celebration Modals
- **Milestone Celebrations** (3, 7, 14, 30, 50, 100, 150, 200, 365, 500, 1000 days):
  - Full-screen confetti animation
  - Milestone badge
  - Encouragement message
  - Freeze awards at 7, 30, 100, 365 days
- **Daily Goal Celebrations**:
  - Success animation
  - Achievement summary
  - Streak confirmation

**Why:** Dopamine hits from celebrations reinforce positive behavior. Milestone celebrations create memorable moments that users work toward.

---

## 1.3 Meal Tracking

### Meal Types
- Breakfast, Lunch, Dinner, Snack
- Each meal contains multiple food items
- Orange theme color-coding

**Why:** Four meal types match common eating patterns. Multiple foods per meal reflect real eating (breakfast isn't just one item). Color coding (orange) creates visual consistency.

### Food Search & Database
- **OpenFoodFacts Integration**:
  - 2M+ food products
  - Real-time search with autocomplete
  - Shows: name, brand, serving, nutrition
  - One-tap add to meal

**Why:** Manual entry is tedious. OpenFoodFacts has comprehensive data for packaged foods globally. Autocomplete speeds up logging. Users eat the same foods repeatedly, so search history becomes valuable.

### Barcode Scanning
- Camera-based scanner
- Instant product lookup in OpenFoodFacts
- Auto-fills nutrition
- Fallback to manual entry if not found

**Why:** Barcode scanning is fastest input method for packaged foods. No typing required. Fallback ensures users aren't blocked when product not found.

### Manual Food Entry
- Custom foods with manual nutrition data
- Required: Name, calories
- Optional: Protein, carbs, fat, serving size
- Metric and imperial support

**Why:** Not all foods are packaged (homemade meals, restaurant food). Users need flexibility to log anything. Calories-only option lowers barrier while detailed macros support advanced tracking.

### AI Food Analysis (Vision API)
- Camera capture of meal
- Google Cloud Vision detects food items
- Estimates nutrition
- User reviews and adjusts before adding

**Why:** Photos are fastest for homemade meals. AI eliminates manual searching. Review step maintains accuracy while speeding up logging.

### Meal Management
- Add, Edit, Delete meals
- View meals by date
- Real-time macro and calorie totals
- Meal-by-meal contribution breakdown

**Why:** Flexibility to correct mistakes. Date navigation lets users log retroactively or plan ahead. Real-time totals show immediate impact of food choices.

### Daily Nutrition Summary
- Total calories vs goal with progress bar
- Macro breakdown (protein/carbs/fat) vs targets
- Percentage completion for each macro
- Meal-by-meal contribution

**Why:** Progress bars create visual feedback on daily goals. Macro percentages help users balance nutrition. Meal breakdown shows which meals dominate calorie intake.

### Streak Integration
- Logging any meal marks "meals logged" for the day
- Contributes to daily streak (2 of 3 activities required)
- Visual feedback when meal helps maintain streak

**Why:** Meal logging is the easiest of the 3 streak activities, lowering barrier to streak maintenance. Immediate feedback reinforces the connection between logging and streak.

---

## 1.4 Workout Tracking

### Workout Routines (Templates)
- Create named routines (e.g., "Push Day", "Leg Day")
- Add exercises with sets, reps, weight (optional)
- Edit and delete routines
- Reusable templates

**Why:** Most users repeat the same workouts. Templates eliminate re-entering exercises each session. Named routines create structure and progression tracking.

### Exercise Management
- Multiple exercises per routine
- Drag-and-drop reordering
- Sets × reps format (e.g., "3 × 12 @ 50kg")

**Why:** Exercise order matters for workout flow. Weight tracking enables progressive overload. Clean format makes routines scannable.

### Workout Logging
- Select routine and start timer
- Real-time elapsed time display
- Pause/resume during workout
- On completion:
  - Auto-calculated duration
  - Mark complete/incomplete
  - Enter exercises completed count

**Why:** Timer creates workout duration data without manual entry. Pause handles rest periods or interruptions. Completion status and count enable partial workout tracking (started but didn't finish).

### Workout History
- Last 30 days of logged workouts
- Shows: routine name, date/time, duration, exercises completed, status
- Edit and delete logs

**Why:** 30 days shows recent patterns without overwhelming. Edit handles mistakes. Completion tracking shows consistency vs starting-but-not-finishing patterns.

### Streak Integration
- Completing a workout marks "workout completed" for the day
- Contributes to daily streak maintenance

**Why:** Workout completion is harder than meal logging, making it a meaningful streak activity. Streak incentive encourages finishing workouts even when motivation is low.

---

## 1.5 Activity Tracking (Run/Walk/Bike)

### Activity Types
- Run (10 cal/min), Walk (4 cal/min), Bike (8 cal/min), Other (5 cal/min)

**Why:** Four types cover common cardio activities. Calorie rates based on average MET values. "Other" handles edge cases without cluttering UI.

### Start Activity Session
- Select type and start timer
- Real-time elapsed time (M:SS or H:MM:SS)
- GPS-ready (future enhancement)

**Why:** Timer creates duration data automatically. Different calorie rates per activity type enable accurate calorie tracking. GPS prep ensures future expansion path.

### End Activity Session
- Stop timer
- Manual distance entry modal
- Auto-calculates calories from type + duration
- Optional manual calorie override

**Why:** Manual distance entry is simpler than GPS integration initially. Auto-calculation removes mental math. Override handles cases where user has better data (fitness watch).

### Activity Management
- Edit distance, duration, type
- Calories auto-recalculate on changes
- Delete activities
- 30-day history

**Why:** Flexibility to correct data. Type changes (realized walk was actually run) recalculate calories automatically. 30 days balances history with performance.

### Daily & Weekly Summaries
- Today's distance total
- This week's activity count and distance
- Dashboard cards

**Why:** Daily total shows immediate progress. Weekly totals reveal patterns (am I active consistently?). Dashboard visibility increases awareness.

---

## 1.6 Intermittent Fasting

### Fasting Presets
- **16:8** - 16hr fast, 8hr eating window
- **18:6** - 18hr fast, 6hr window
- **20:4** - 20hr fast, 4hr window (Warrior)
- **OMAD** - 23hr fast, 1hr window (One Meal A Day)

**Why:** Presets match popular IF protocols. Users don't need to understand fasting math, just select their protocol. Preset buttons are faster than manual hour entry.

### Active Fast Display
- Circular progress indicator (0-100%)
- Elapsed time (e.g., "14h 32m")
- Time remaining (e.g., "1h 28m remaining")
- Target completion time (e.g., "Ends at 2:30 PM")
- Color intensity increases with progress

**Why:** Multiple time formats serve different needs: elapsed shows accomplishment, remaining shows what's left, completion time helps planning. Progress bar creates visual motivation.

### Fasting Timeline Visualization
- Visual timeline with fast start, current position, end time
- Color-coded segments (fasting vs eating windows)

**Why:** Timeline helps users visualize the fasting cycle and plan meals around their eating window. Visual representation is clearer than numbers alone.

### Fasting History
- All past sessions with date, duration, goal, completion status, notes
- Delete individual logs

**Why:** History reveals patterns (completing 16:8 consistently but failing OMAD). Notes capture context ("felt great" vs "very hungry"). Deletion handles test fasts or mistakes.

### Web Push Notifications
- **80% Alert**: "Almost there! 3h 12m to go!"
- **Completion Alert**: "Congratulations! Fast complete"
- Sent once per fast
- Configurable in settings

**Why:** 80% notification provides motivational boost during the hardest final hours. Completion notification celebrates achievement and allows users to plan meal timing.

### Streak Integration
- Completing a fast (100% of goal) marks "fast completed" for the day
- Contributes to streak maintenance

**Why:** Fast completion is the hardest of 3 streak activities. Requiring 100% prevents gaming the system. Streak incentive helps users push through final hours.

---

## 1.7 Body Measurements & BMI

### Add Measurement
- Record weight (kg/lbs), height (cm/in), body fat %
- Date selector (defaults to today)
- All fields optional but minimum one required

**Why:** Flexibility to log what users measure. Not everyone tracks body fat. Date selector handles retroactive logging or recording from old notes.

### Weight Trend Chart
- Line chart showing weight over time
- Trend line for trajectory
- Interactive hover for exact values
- Zoom controls for time ranges

**Why:** Weight fluctuates daily. Trend line shows actual progress despite noise. Visual chart more motivating than numbers. Zoom reveals short-term vs long-term patterns.

### BMI Calculation & Display
- Auto-calculated from latest weight and height
- Color-coded categories:
  - Underweight (<18.5): Blue
  - Normal (18.5-24.9): Green
  - Overweight (25-29.9): Yellow
  - Obese (30+): Red
- Interpretation text
- Historical BMI trend

**Why:** BMI gives context to weight numbers. Auto-calculation eliminates manual math. Color coding makes categories immediately clear. Historical trend shows BMI progress as weight changes.

### Latest Stats Display
- Current weight with trend arrow (↑↓→)
- Current height and BMI with category
- Last measurement date
- Weight change since last measurement

**Why:** Trend arrows provide instant feedback (gaining/losing/maintaining). Date context shows recency. Change since last gives short-term progress snapshot.

### Auto-Calorie Recalculation
- When weight changes (and auto-calories enabled):
  - Recalculates BMR (Basal Metabolic Rate)
  - Recalculates TDEE (Total Daily Energy Expenditure)
  - Adjusts daily calorie goal for weight loss target
  - Updates macro targets
- Shows notification of updated goals
- Can be disabled

**Why:** As weight changes, calorie needs change. Manual recalculation burdens users with math and remembering to update. Auto-adjustment keeps goals accurate with zero user effort.

---

## 1.8 Streak & Gamification System

### Streak Mechanics
- Consecutive days with activity completed
- Activity requirement: **2 out of 3** daily activities:
  1. Log at least one meal
  2. Complete a workout
  3. Complete a fast (100% of goal)
- Automatic midnight check
- Streak freeze protection

**Why:** 2-of-3 requirement balances achievability with meaningful effort. Too easy (1-of-3) feels hollow. Too hard (3-of-3) leads to frustration and abandonment. Rest days or schedule changes shouldn't break streaks.

### Streak Freezes
- Save your streak when you miss 1 day
- Earned at milestones: 7, 30, 100, 365 days
- Automatically used on miss
- Can accumulate multiple freezes
- Display shows count (e.g., "2 🧊 available")

**Why:** Life happens. Freezes prevent all-or-nothing thinking where one miss destroys months of effort. Earning freezes via milestones creates additional rewards and demonstrates commitment. Auto-use removes decision burden.

### Streak Reset Rules
- Miss 1 day with freeze: Use freeze, keep streak
- Miss 1 day without freeze: Reset to 0
- Miss 2+ days: Always reset to 0

**Why:** Single miss is forgivable (freeze system). Multiple consecutive misses indicate disengagement, so reset forces fresh start. Clear rules prevent confusion.

### Streak Intensity Levels
- **Cold** (0-6 days): Blue, just starting
- **Warm** (7-29 days): Orange, building momentum
- **Hot** (30-99 days): Red, strong habit
- **Fire** (100-364 days): Multi-color, unstoppable
- **Inferno** (365+ days): Rainbow, legendary

**Why:** Visual progression creates aspiration and status. Each tier feels like leveling up. Color/temperature metaphor is intuitive (cold start → burning fire). Rainbow inferno creates ultimate prestige.

### Milestone System
- Celebrations at: 3, 7, 14, 30, 50, 100, 150, 200, 365, 500, 1000 days
- Freeze awards at: 7, 30, 100, 365 days

**Why:** Early milestones (3, 7, 14) provide frequent wins for beginners. Later milestones become special events. Freeze rewards tie progression to practical benefits, not just vanity.

### Milestone Celebrations
- Full-screen modal with confetti animation
- Milestone badge display
- Personalized encouragement
- Share option (future)

**Why:** Celebrations create dopamine hits and memorable moments. Full-screen emphasis signals importance. Personal messages feel more rewarding than generic "Achievement unlocked."

### Weekly Activity Calendar
- 7-day grid with activity status per day
- Activity icons (🍽️ meal, 💪 workout, ⏱️ fast)
- Streak maintained checkmark
- Today highlighted

**Why:** Week view reveals recent patterns without overwhelming. Icons show which activities were done. Checkmark emphasizes what matters (streak maintenance).

### Monthly Heatmap
- Calendar grid with color intensity by activity level
- Dark green (streak maintained), light green (partial), gray (none), blue (freeze used)
- Month navigation

**Why:** GitHub-style heatmap leverages familiar pattern. Month view reveals weekly cycles (busy Mondays? lazy Sundays?). Color intensity makes patterns pop visually.

### Consistency Statistics
- Total active days
- Current and longest streak
- Completion rate percentage
- Best day of week
- Activity breakdown (meals X days, workouts Y days, fasts Z days)

**Why:** Stats provide insights beyond streaks. "I'm 85% consistent" feels better than "I have a 12-day streak." Day-of-week analysis reveals schedule patterns. Activity breakdown shows user's preferred streak activities.

### Daily Activity Tracking
- Behind-the-scenes tracking:
  - `fastCompleted`: Boolean
  - `mealsLogged`: Boolean
  - `workoutCompleted`: Boolean
  - `streakMaintained`: Boolean (auto-calculated: 2 of 3)

**Why:** Granular tracking enables detailed analytics. Auto-calculation of `streakMaintained` removes user burden of understanding 2-of-3 rule.

---

## 1.9 Goals & Settings

### Daily Calorie Goal
- Set target daily calorie intake
- Default from profile setup wizard
- Manual override available
- Progress bar on dashboard
- Visual warnings if significantly over/under

**Why:** Calories are primary weight management metric. Default from wizard removes setup burden. Override handles special diets or expert users. Progress bar creates immediate feedback.

### Macro Goals
- Protein (30% of calories by default)
- Carbs (40% of calories)
- Fat (30% of calories)
- Independent adjustment

**Why:** 30/40/30 macro split balances protein for satiety, carbs for energy, fat for hormones. Defaults serve most users while customization enables specific diets (keto, high-protein, etc.).

### Profile Setup Wizard
5-step onboarding for new users:

**Step 1: Basic Info** - Age, gender
**Step 2: Body Stats** - Height, current weight
**Step 3: Activity Level** - Sedentary (1.2×), Moderate (1.55×), Active (1.725×)
**Step 4: Goals** - Target weight, target date
**Step 5: Review** - Calculated BMR, TDEE, daily calories, macro breakdown, weekly weight change

**Why:** Wizard front-loads setup to provide accurate goals immediately. Progressive disclosure (5 steps) prevents overwhelming new users. Final review builds trust by showing calculations transparently.

### Calorie Calculation Engine
- **BMR**: Mifflin-St Jeor equation
  - Male: `(10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5`
  - Female: `(10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161`
- **TDEE**: `BMR × Activity Multiplier`
- **Daily Deficit**: `(weight_to_lose_kg × 7700 cal) / days_to_goal`
- **Daily Goal**: `TDEE - daily_deficit`
- **Macros**: 30/40/30 split with 4 cal/g (protein/carbs), 9 cal/g (fat)

**Why:** Mifflin-St Jeor is most accurate BMR equation for general population. Activity multipliers from peer-reviewed research. 7700 cal/kg is standard fat energy density. Math transparency builds user trust.

### Auto-Calorie Adjustment
- Toggle auto-recalculation on weight changes
- When enabled: recalculates on new weight measurement or profile update
- Notification shows new goals

**Why:** Weight loss changes calorie needs. Auto-adjustment maintains appropriate deficit without requiring users to understand complex recalculations. Opt-out preserves user control.

### Settings Panel
- Profile info (age, gender, height, weight, activity level)
- Goals (calories, macros)
- Auto-calories toggle
- Notification preferences
- Units (metric/imperial) - future
- Theme (light/dark) - future

**Why:** Centralized settings for discoverability. Logical grouping (profile, goals, preferences). Future toggles create expansion path.

---

## 1.10 Push Notifications

### Notification Types

#### Fasting Progress Notifications
- **80% Alert**: "Almost there! [time] to go!"
- **100% Alert**: "Congratulations! Fast complete"
- Sent once per fast
- Configurable per alert type

**Why:** 80% is psychologically difficult moment (most of fasting is done, but still hungry). Notification provides motivation boost. Completion alert celebrates achievement and signals meal planning.

#### Meal Reminder Notifications
- Breakfast, lunch, dinner reminders at user-set times
- Only sent if meal type not yet logged
- Default times: 8 AM, 12 PM, 6 PM

**Why:** Meal reminders build logging habit. Checking if logged prevents annoying reminders when already done. User-set times accommodate varied schedules.

#### Daily Goal Nudge Notifications
- Sent at user-set reminder time (default 8 PM)
- Only if daily goal not yet complete
- Lists incomplete items: "You still need to: Log a meal, Complete a workout"

**Why:** Evening reminder catches users before day ends. Specific list (what's incomplete) is actionable vs vague "check your goals." Opt-out respects users who find reminders stressful.

### Notification Preferences
- Master toggle (enable/disable all)
- Per-category toggles (fasting, meals, daily goal)
- Time pickers for meal reminders and daily nudge
- Individual alert toggles (80% vs completion for fasting)

**Why:** Granular control respects different user preferences. Some want aggressive reminders, others find them annoying. Time customization handles varied schedules (shift workers, time zones).

### Test Notification
- "Send Test Notification" button in settings
- Immediate test push
- Verifies subscription working

**Why:** Push notification setup is finicky (permissions, service workers). Test button provides immediate feedback that setup succeeded, reducing support burden.

---

## 1.11 PWA Features

### Progressive Web App
- Installable on mobile and desktop
- Offline functionality with cached assets
- App-like experience (no browser chrome)
- Fast load times via service worker

**Why:** PWA avoids app store friction (submissions, fees, updates). Works across all platforms from single codebase. Offline support critical for fitness tracking (log workout at gym with bad signal).

### Install Prompt
- Native install prompt after user engagement
- Custom prompt with app icon, "Install Fast Track" message, install/dismiss buttons
- Appears on desktop (Chrome, Edge) and mobile (Android, iOS)

**Why:** Progressive enhancement: works in browser, better when installed. Custom prompt provides context (why install?) before native prompt. Install unlocks offline capabilities.

### Update Prompt
- Detects new version available
- Banner notification with "Update" and "Dismiss" buttons
- Ensures latest features

**Why:** Service worker updates are invisible by default. Prompt gives users control over when to update (not mid-workout). Ensures security fixes reach users.

### Offline Indicator
- Banner when connection lost
- "You're offline" message
- Hides when restored

**Why:** Users need to know why actions might fail. Offline indicator sets expectations and prevents confusion when data doesn't save.

### Service Worker Strategies
- **Precaching**: Critical assets cached on install
- **Network First**: API calls try network, fallback to cache
- **Cache First**: Images, fonts from cache immediately
- **Stale While Revalidate**: Serve cached, fetch fresh in background

**Why:** Different content types need different strategies. API data should be fresh (network first). Static assets can be cached (cache first). Balanced approach optimizes speed and freshness.

### Offline Data Access
- View previously loaded meals, workouts, activities
- Access streak data and stats
- Browse history and trends
- Cannot create new data without connection
- Sync pending when restored (future)

**Why:** Read-only offline access maintains functionality when signal lost. Creating data offline requires conflict resolution (complexity), so defer to future enhancement.

---

## 1.12 Bottom Navigation (Mobile-First)

### Navigation Tabs
1. **Home** (house icon)
2. **Meals** (utensils icon, orange)
3. **Workouts** (dumbbell icon, red)
4. **Activity** (running icon, blue)
5. **Profile** (user icon, primary blue)

**Why:** Five tabs cover all primary features without scrolling. Icons are universally recognizable. Color coding matches feature themes. Bottom placement optimized for thumb reach on mobile.

### Navigation Behavior
- Fixed bottom bar
- Active tab highlighted with color and filled icon
- Smooth page transitions
- Scroll position maintained per page

**Why:** Fixed position ensures navigation always accessible. Active state shows location. Preserved scroll prevents re-finding content when switching tabs.

---

## 1.13 Animations & Visual Polish

### Page Transitions
- Fade-in-up animation (300ms, ease-out)

**Why:** Smooth transitions feel polished. Fade-in-up has directional logic (new content appears from below). 300ms is perceptible but not slow.

### List Animations
- Staggered entrance with 50ms delay per item
- Slide-in from bottom with fade

**Why:** Staggered animations draw attention to list contents. Too fast is jarring, too slow is annoying. 50ms creates rhythm without delay.

### Button Micro-Interactions
- Hover: Scale 1.02× (subtle lift)
- Press: Scale 0.98× (subtle press)
- Disabled: Reduced opacity, no interactions

**Why:** Micro-interactions provide tactile feedback. Hover lift creates affordance (this is clickable). Press depression confirms action. 2% scale is noticeable but not cartoonish.

### Success Celebrations
- Milestone: Full-screen confetti, particles float up and fade (3 seconds)
- Daily goal: Similar with checkmark, encouraging message (2 seconds)

**Why:** Celebrations trigger dopamine release. Full-screen emphasis signals importance. Particle effects are visually satisfying. Limited duration prevents annoyance.

### Progress Indicators
- **Circular**: Animated stroke, color intensity by progress, percentage in center
- **Linear**: Animated fill left-to-right, color-coded

**Why:** Multiple indicator types suit different contexts (circular for fasting timer, linear for calorie progress). Animation draws attention to progress.

### Loading States
- Skeleton screens for data
- Shimmer effect on placeholders
- Spinner for long operations

**Why:** Skeleton screens prevent layout shift and show content structure. Shimmer indicates activity. Spinner for operations with unknown duration.

---

## 1.14 Color Scheme & Theming

### Feature-Based Colors
- **Meals**: Orange (#f97316) - Warm, appetizing
- **Workouts**: Red (#ef4444) - Energy, intensity
- **Activity**: Blue (#3b82f6) - Movement, freshness
- **Fasting**: Purple (#8b5cf6) - Discipline, transformation
- **General**: Primary blue (#1976d2) - Trust, stability

**Why:** Color coding creates visual consistency and helps users mentally map features. Colors chosen for psychological associations (orange = food, red = workout intensity).

### Dark Theme (Default)
- Dark navy background (#0f172a)
- Dark gray surfaces (#1e293b)
- High contrast text (#f1f5f9)
- Vibrant accent colors
- Optimized for OLED

**Why:** Dark theme reduces eye strain in varied lighting. Battery savings on OLED screens (most modern phones). Vibrant accents pop against dark background.

### Component Styling
- Glass card effect with blur backdrop
- Consistent 12px border radius
- Subtle elevation shadows
- 1px borders with opacity

**Why:** Glassmorphism creates depth without heavy shadows. Consistent radius creates visual harmony. Subtle elevation guides hierarchy.

---

# 2. New Stack Architecture

This section explains the architectural decisions for the Fast Track rewrite using **AdonisJS v6**, **Vue 3**, and **PostgreSQL**, focusing on **why** these choices were made and **what** benefits they provide.

---

## 2.1 Why This Stack?

### AdonisJS v6 (Backend)

**Why AdonisJS over Express?**

**Convention over Configuration**
Express requires manual setup for every concern (database, validation, auth, jobs). AdonisJS provides an opinionated structure out of the box. This reduces decision fatigue and ensures consistency.

**Built-in Features**
- **ORM (Lucid)**: Type-safe database queries with relationships, migrations, and seeders. No need for separate libraries.
- **Authentication**: JWT and session support built-in, eliminating boilerplate.
- **Validation**: Schema-based validators catch errors before they reach the database.
- **Background Jobs**: Bull/Redis integration for scheduled tasks (fasting notifications, meal reminders).
- **Dependency Injection**: Clean separation of concerns, easier testing.

**Why this matters**: Express forces you to research, choose, and integrate separate libraries for each concern. AdonisJS provides tested, integrated solutions.

**TypeScript First**
AdonisJS is built with TypeScript from the ground up. Type safety catches errors at compile time, not runtime. IDE autocomplete improves developer experience.

**Why this matters**: Current Express setup adds TypeScript as an afterthought. AdonisJS treats it as a first-class citizen, generating types from database schema automatically.

**MVC Architecture**
Clear separation: Models (data), Controllers (HTTP handling), Services (business logic). Enforced structure prevents spaghetti code.

**Why this matters**: Express leaves structure up to developers. Inconsistent patterns emerge over time, making maintenance harder.

**Testing**
Built-in test runner (Japa) with database transactions for fast, isolated tests. No need to clean up test data manually.

**Why this matters**: Testing setup in Express requires configuring Jest, Supertest, database cleanup. AdonisJS provides this out of the box.

---

### Vue 3 (Frontend)

**Why Vue 3 over React?**

**Performance**
- **41% faster rendering** than React (per Vue.js benchmarks)
- **13.5kb bundle size** vs React's 42kb (3× smaller)
- **Proxy-based reactivity** eliminates virtual DOM diffing overhead for many operations

**Why this matters**: Faster renders mean smoother animations, better mobile performance, and reduced battery drain. Smaller bundle = faster initial load.

**Composition API**
Vue's Composition API organizes logic by feature instead of lifecycle. React Hooks have confusing rules (dependency arrays, closure traps). Vue's `ref` and `reactive` are more intuitive.

**Why this matters**: Less time debugging "why didn't this re-render?" More time building features.

**Template Syntax**
Vue templates separate HTML structure from JavaScript logic. React's JSX mixes them, leading to "JavaScript fatigue" (writing HTML in JS with ternaries and maps).

**Why this matters**: Templates are easier for designers to read. Logic stays in `<script>`, presentation in `<template>`.

**State Management**
Pinia (Vue's official state manager) is simpler than Redux:
- No boilerplate actions/reducers
- TypeScript support out of the box
- DevTools integration
- Setup stores pattern (composition-style) or options (Vue 2-style)

**Why this matters**: Zustand (current React state manager) is better than Redux but still requires manual setup. Pinia is officially maintained and integrated.

**Developer Experience**
- **Single File Components**: HTML, JS, CSS in one file. Related code stays together.
- **Better error messages**: Vue's compiler provides actionable errors.
- **Faster HMR**: Vite's Vue plugin has instant hot module replacement.

**Why this matters**: Less time fighting the framework, more time building features.

---

### PostgreSQL (Database)

**Why PostgreSQL over MongoDB?**

**Data Integrity**
- **ACID compliance**: Transactions guarantee all-or-nothing operations (no partial saves).
- **Foreign keys**: Database prevents orphaned data (meals without users, workouts without routines).
- **Constraints**: Unique emails, non-null required fields enforced at database level.

**Why this matters**: MongoDB requires application-level validation. If code has a bug, bad data gets saved. PostgreSQL enforces rules at the database level.

**Relational Data**
Fast Track's data is highly relational:
- Users have meals, workouts, activities, streaks
- Routines have workout logs
- Meals have foods (nested JSON)

**Why this matters**: MongoDB's aggregation pipelines are verbose and slow for joins. PostgreSQL's JOIN queries are optimized and fast.

**Performance**
- **Query optimizer**: PostgreSQL analyzes queries and uses optimal execution plans.
- **Better indexing**: B-tree, GiST, GIN indexes for different use cases.
- **Materialized views**: Pre-compute complex queries (e.g., streak statistics).

**Why this matters**: As data grows, MongoDB's document scans slow down. PostgreSQL's indexes keep queries fast.

**Features**
- **JSONB support**: Best of both worlds. Structured tables for relational data, JSONB for flexible data (foods array, notification preferences).
- **Full-text search**: No need for Elasticsearch for basic search.
- **Enum types**: Meal types (`breakfast`, `lunch`, `dinner`, `snack`) enforced at database level.
- **Array types**: Milestones achieved stored as `INTEGER[]`.

**Why this matters**: PostgreSQL combines relational rigor with NoSQL flexibility. MongoDB forces everything into documents even when tables are better.

**Migrations**
- **Schema versioning**: Each migration is numbered and timestamped.
- **Rollback**: Easily undo schema changes (`down()` migration).
- **Collaboration**: Team members see exact schema state.

**Why this matters**: MongoDB has no schema migrations. Changes are applied manually or via migration scripts. PostgreSQL migrations are first-class.

**Scaling**
- **Read replicas**: Scale reads horizontally.
- **Partitioning**: Split large tables (e.g., `daily_activities` by month).
- **Better tooling**: pgAdmin, DataGrip, robust backup/restore tools.

**Why this matters**: MongoDB scales horizontally but requires sharding complexity. PostgreSQL scales vertically (bigger server) and horizontally (read replicas) with simpler tooling.

**Type Safety**
Lucid ORM generates TypeScript types from database schema. Compile-time type checking for queries.

**Why this matters**: Mongoose (MongoDB ODM) requires manual TypeScript types. Lucid auto-generates them, eliminating sync errors.

---

## 2.2 Data Model Design

### Core Entities

**Users**
- Email, password, notification preferences (JSONB)
- One user has many: meals, routines, workout logs, activities, measurements, fasts
- One user has one: streak

**Why JSONB for preferences**: Notification preferences are hierarchical (fasting.alertAt80Percent, meals.breakfastTime). JSONB allows flexible structure without separate tables.

**Meals**
- Belongs to user
- Has: date, type (enum), foods (JSONB array), total calories
- Composite index on `(user_id, date DESC)` for fast date-range queries

**Why JSONB for foods**: Each meal has different foods with different nutritional data. JSONB avoids creating separate `foods` and `meal_foods` join tables.

**Routines & Workout Logs**
- Routine: Template with exercises (JSONB array)
- Workout Log: References routine (nullable), has duration, completion status
- Routine deletion sets `routine_id` to NULL but keeps workout log (keeps history)

**Why nullable foreign key**: Users should be able to delete routines without losing workout history.

**Activities**
- Type (enum: run, walk, bike, other)
- Start time, end time, duration, distance, calories
- Composite index on `(user_id, start_time DESC)` for fast chronological queries

**Why separate start/end times**: Supports future enhancements (pause/resume, real-time tracking).

**Fasts**
- Start time, end time (nullable for active fasts), goal hours, completed
- Notification flags: `notified_80_percent`, `notified_complete` (prevent duplicate notifications)

**Why notification flags**: Background job runs every minute. Flags ensure 80% alert sent only once per fast.

**Streaks & Daily Activities**
- Streak: One per user, has current/longest streak, freezes, milestones (array)
- Daily Activity: One per user per date, tracks meals/workout/fast completion
- Daily Activity has `streak_maintained` (auto-calculated: 2 of 3 activities)

**Why separate daily_activities table**: Enables querying specific dates for history view. Separating from streak enables analytics (which days are most active?).

**Push Subscriptions**
- Endpoint (unique), encryption keys, user agent
- One user can have multiple subscriptions (phone, desktop)

**Why user_agent**: Debugging (which device has issues?). Future: send notifications to specific device.

---

## 2.3 API Design Philosophy

### RESTful Resources
- Resources: `meals`, `routines`, `workout-logs`, `activities`, `measurements`, `fasts`, `streaks`
- Standard methods: `GET` (list/show), `POST` (create), `PUT` (update), `DELETE` (destroy)
- Nested routes where logical: `GET /streaks/daily-activities`, `PUT /streaks/daily-activities/:date`

**Why REST**: Consistent, predictable API structure. Frontend developers know what to expect.

### Request Validation
- Schema-based validators run before controller logic
- Catch invalid data early with clear error messages
- Type coercion (strings to numbers, date strings to Date objects)

**Why validators**: Prevents bad data from reaching business logic. Clear error messages improve frontend debugging.

### Automatic Relationships
- Meals automatically link to user via `auth.user.id`
- Deleting user cascades to all related data (`ON DELETE CASCADE`)
- Deleting routine sets workout log's `routine_id` to NULL (`ON DELETE SET NULL`)

**Why cascading deletes**: Orphaned data is confusing and wastes space. Cascades ensure cleanup.

### Business Logic in Services
- Controllers handle HTTP (request/response)
- Services handle business logic (CalorieCalculatorService, StreakService)
- Models handle data persistence

**Why separation**: Controllers become thin and testable. Business logic reusable across controllers, jobs, CLI commands.

---

## 2.4 Frontend Architecture Philosophy

### Component Organization
- **Layout**: MainLayout, BottomNav (shared structure)
- **UI**: Button, Modal, ProgressBar (reusable primitives)
- **Feature**: Meals, Workouts, Fasting components (feature-specific)
- **Views**: Page-level components (DashboardView, MealsView)

**Why hierarchical structure**: Clear separation. UI components are reusable. Feature components encapsulate domain logic.

### State Management with Pinia
- One store per domain: `auth`, `meals`, `workouts`, `activities`, `fasting`, `measurements`, `streaks`, `settings`, `notifications`
- Stores handle: state, getters (computed), actions (mutations + async)
- Composition API pattern (setup function with `ref`, `computed`)

**Why Pinia over Vuex**: Simpler API, better TypeScript support, no mutations vs actions confusion. Setup pattern feels natural with Composition API.

### Composables for Reusable Logic
- `useFasting`: Timer management, progress calculations
- `useListForm`: Generic add/remove/edit for arrays
- `useCelebration`: Phase-based animation state (enter → show → exit)

**Why composables**: Extract logic from components. Reusable across features. Easier to test.

### API Service Layer
- Axios instance with base URL from environment
- Request interceptor: Attach JWT token to every request
- Response interceptor: Auto-refresh token on 401, retry original request
- Error handling: User-friendly messages

**Why interceptors**: Centralized auth and error handling. Components don't repeat token logic.

### Router Guards
- `beforeEach` guard checks authentication
- Redirect to login if route requires auth and user not authenticated
- Redirect to dashboard if visiting login while authenticated

**Why guards**: Centralized auth logic. Components don't check authentication individually.

---

## 2.5 Background Jobs Design

### Scheduled Jobs with Bull/Redis

**Fasting Notification Job** (every minute)
- Query active fasts (`end_time IS NULL`)
- Calculate progress (elapsed / goal * 100)
- Send 80% alert if progress ≥ 80 and not already notified
- Send completion alert if progress ≥ 100 and not already notified
- Update notification flags

**Why every minute**: Fasting notifications need reasonable precision. Every second is overkill. Every 5 minutes misses small windows.

**Meal Reminder Job** (every 5 minutes)
- Check if current time matches breakfast/lunch/dinner time (±5 min window)
- Query if meal type already logged today
- Send reminder if not logged and user preferences enabled

**Why 5-minute window**: Exact-minute matching is fragile (job delay, clock skew). Window ensures delivery.

**Daily Goal Checker Job** (55th minute of each hour)
- Query user's daily activity for today
- Calculate incomplete activities (meals not logged, workout not completed, fast not completed)
- Send notification listing incomplete items if configured reminder time matches

**Why 55th minute**: Catches hourly times (8:00 PM reminder) with buffer before hour boundary.

---

## 2.6 Why These Architectural Patterns Matter

### Type Safety End-to-End
- **Database**: PostgreSQL schema defines types (INTEGER, VARCHAR, JSONB, ENUM)
- **Backend**: Lucid ORM generates TypeScript types from schema
- **API**: Controllers return typed responses
- **Frontend**: Pinia stores use TypeScript interfaces

**Benefit**: Catch errors at compile time. Change database schema → TypeScript errors reveal everywhere that needs updating.

### Single Source of Truth
- **Database schema**: Defines data structure
- **Migrations**: Version control for schema
- **Validators**: Enforce schema rules at API boundary
- **Frontend types**: Generated from API responses

**Benefit**: No drift between frontend expectations and backend reality.

### Separation of Concerns
- **Controllers**: HTTP handling
- **Services**: Business logic
- **Models**: Data persistence
- **Validators**: Input validation
- **Jobs**: Background processing

**Benefit**: Each piece has one responsibility. Easy to test, easy to change.

### Progressive Enhancement
- **Works in browser**: Full functionality without installation
- **Better when installed**: Offline support, push notifications, home screen icon
- **Future enhancements ready**: GPS tracking, real-time sync, social features

**Benefit**: Users get value immediately. Installation unlocks additional capabilities.

---

## 2.7 Testing Philosophy

### Backend Testing (Japa)
- **Unit tests**: Services (CalorieCalculator, StreakService) in isolation
- **Functional tests**: Controllers with database transactions (rollback after each test)
- **Integration tests**: Full request/response cycle

**Why database transactions**: Tests are fast (in-memory), isolated (no shared state), deterministic (no cleanup needed).

### Frontend Testing (Vitest + Vue Test Utils)
- **Component tests**: UI components in isolation (Button, Modal, StreakBadge)
- **Composable tests**: Logic functions (useFasting, useListForm)
- **Store tests**: Pinia stores with mock API
- **E2E tests**: Playwright for critical user flows

**Why component tests over E2E**: Faster feedback, easier debugging, better coverage. E2E for smoke tests only.

---

## 2.8 Deployment Strategy

### Docker Compose Services
- **PostgreSQL**: Database with persistent volume
- **Redis**: Queue backend for Bull
- **API**: AdonisJS server
- **Web**: Nginx serving Vue build

**Why Docker**: Consistent environments (dev, staging, prod). Easy setup for new developers. Production-like local development.

### Environment Variables
- **API**: Database credentials, JWT secrets, VAPID keys
- **Web**: API URL, Google Vision API key

**Why environment variables**: Secrets not committed to version control. Different config per environment (dev uses localhost, prod uses production URL).

---

## 2.9 Migration Path from Current Stack

### Phase 1: Backend (2-3 weeks)
1. Setup AdonisJS project, PostgreSQL, Redis
2. Write migrations for 10 tables
3. Define Lucid models with relationships
4. Implement controllers (same API contracts as Express)
5. Write services (port CalorieCalculator, StreakService)
6. Implement background jobs (fasting notifications, meal reminders)
7. Write tests

**Why this order**: Database first (foundation). Models next (data layer). Controllers after (API layer). Services and jobs last (business logic).

### Phase 2: Frontend (2-3 weeks)
1. Setup Vite + Vue 3 + Pinia + Vue Router
2. Convert Zustand stores to Pinia (same API)
3. Port React components to Vue SFC (maintain same props/events)
4. Port pages to Vue Router views
5. Port API client (Axios interceptors for auth)
6. Setup PWA (vite-plugin-pwa, service worker, manifest)
7. Write tests

**Why this order**: Infrastructure first (Vite, router, stores). Components next (building blocks). Pages after (composition). PWA last (enhancement).

### Phase 3: Data Migration (1 week)
1. Export MongoDB data to JSON
2. Transform to PostgreSQL format (relationships, foreign keys)
3. Import via migrations or seeder
4. Validate data integrity (counts match, relationships intact)

**Why JSON export**: Portable, inspectable, version-controllable. Seeder script enables repeatable imports (dev, staging, prod).

### Phase 4: Deployment & Testing (1 week)
1. Deploy to staging environment
2. Run full test suite (unit, functional, E2E)
3. User acceptance testing
4. Deploy to production
5. Monitor performance, fix bugs

**Why staging first**: Catch deployment issues before production. UAT ensures features work in real environment.

---

## 2.10 Benefits Summary

### Performance
- **Vue 3**: 41% faster rendering, 3× smaller bundle
- **PostgreSQL**: 2-3× faster queries for relational data
- **AdonisJS**: Optimized middleware pipeline, clustering support

**Impact**: Faster page loads, smoother animations, better mobile experience.

### Developer Experience
- **Type Safety**: Compile-time error catching
- **Better Tooling**: Ace CLI scaffolding, Vue DevTools, Pinia DevTools
- **Faster HMR**: Instant feedback in development
- **Less Boilerplate**: AdonisJS conventions eliminate setup

**Impact**: Faster development, fewer bugs, easier onboarding for new developers.

### Maintainability
- **Convention over Configuration**: Consistent structure
- **Single File Components**: Related code stays together
- **Better Migrations**: Schema versioning with rollback
- **Built-in Testing**: Test runners integrated

**Impact**: Easier to modify features, easier to debug, easier to onboard developers.

### Scalability
- **PostgreSQL**: Read replicas, partitioning, materialized views
- **Bull/Redis**: Background jobs handle heavy workloads
- **Caching**: Redis integration for hot data
- **Horizontal Scaling**: Multiple API instances behind load balancer

**Impact**: Handles growth from personal app to multi-user platform.

### Data Integrity
- **ACID Compliance**: No partial saves
- **Foreign Keys**: No orphaned data
- **Transactions**: All-or-nothing operations
- **Constraints**: Database-level validation

**Impact**: Trust your data. No corruption from partial updates or bugs.

---

## End of Specification

This document provides a complete blueprint for understanding and rebuilding Fast Track. All features are documented with their purpose and design rationale. The new stack architecture explains **why** each technology was chosen and **what** benefits it provides, without diving into implementation details that will evolve during development.

