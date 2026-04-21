# AutismConnect MVP Specification

## Project Overview

Build a web application called **AutismConnect** that helps parents of autistic children find resources (therapies, schools, doctors), connect with other parents, and receive AI-powered guidance tailored to autism education and support.

**MVP Goal:** A functional full-stack app where parents can join the waitlist, sign up, build profiles, access Georgia's autism resources, with other states coming soon, share in a community blog with messaging, and get AI-powered answers to autism-related questions.

---

## Tech Stack

- **Frontend:** React 18+ with TypeScript (Next.js 14+)
- **Backend:** Next.js API routes (serverless functions)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (email/password for MVP)
- **Hosting:** Vercel
- **Version Control:** GitHub
- **AI Integration:** Together AI API (for Q&A chatbot), that should also be able to generate links to the resources based on user queries, all links should be in house on the site 
- **Styling:** TailwindCSS
- **Payments:** Stripe (for future subscriptions)
- **Email:** Resend (for waitlist & notifications)

---

## Core MVP Features

### 0. Public Landing Page
- Marketing landing page (no auth required)
- Hero section with value prop: "All Autism Resources in One Place"
- Feature highlights: Resource Library, Parent Community, AI Guidance
- Geographic messaging: "Launching in Georgia • Coming to a state near you"
- Waitlist signup form (email)
- Feature cards showcasing main benefits
- Call-to-action buttons (Join Waitlist, Sign Up, Learn More)
- Footer with links, contact info
- Fully responsive (mobile-first design with TailwindCSS)

### 1. Waitlist Management
- Landing page waitlist form (email only)
- Waitlist data stored in Supabase
- Automatic welcome email via Resend (confirmation + coming soon message)
- Track state interested in (default: GA)
- No duplicate emails
- Redirect to dashboard if user already signed up

### 2. User Authentication & Onboarding
- Sign up / login with email via Supabase Auth
- Email verification
- Onboarding wizard that collects:
  - First name, last name
  - Profile photo (upload)
  - Bio (optional)
  - Location (city, state)
  - Child's details (optional: age, autism level, co-conditions)
- Password reset via email
- Auth redirects (logged out → sign up, logged in → dashboard)

### 3. Resource Library (Georgia Focused)
- Browse 40+ verified autism resources in Georgia:
  - Therapy centers (speech, OT, ABA, equine, etc.)
  - Schools with special ed programs
  - Diagnostic centers & pediatricians
  - Nonprofits & advocacy organizations
- Resource cards show:
  - Name, description, resource type
  - Address, phone, website, email
  - Accepts insurance (yes/no)
  - Specializations (autism, speech therapy, IEP support, etc.)
- Search & filter by:
  - Resource type (therapy, school, doctor, nonprofit)
  - City/location
  - Specialization
  - Insurance acceptance
- Individual resource detail pages with full info
- "Coming to a state near you" messaging (shows Georgia only for MVP)

### 4. Community - User Profiles
- Public user profiles show:
  - Profile photo
  - Name, location, bio
  - Number of posts
  - Join date
- Private profile editing:
  - Edit photo, bio, location, child details
  - Can see own messages & blog posts
- User discovery (find other parents)

### 5. Community - Blog
- Create blog post form:
  - Title, content (rich text)
  - Featured image upload
  - Category (education, therapy, community, legal, etc.)
  - Auto-save draft
- Blog post feed (paginated):
  - All posts sorted by newest first
  - Post card shows: title, excerpt, author photo, date, comment count, view count
  - Click to read full post
- Individual blog post pages:
  - Full post with featured image
  - Author info card (profile photo, name, location)
  - Comment section
  - Like/share buttons (optional)
- Comments on posts:
  - Comment form (appears for logged-in users)
  - List of all comments sorted by newest
  - Comment author, date, content
  - Can edit/delete own comments
- Blog post management:
  - Users can edit/delete their own posts
  - View their own posts in profile
  - Delete comments on their own posts

### 6. Community - Messaging
- Send direct messages to other users:
  - User search bar to find recipients
  - Message threads sorted by most recent
- View message thread:
  - List all messages with sender, date, content
  - Indicate read/unread status
  - Scroll to load more messages
- Send message UI:
  - Message input field
  - Send button
  - Auto-scroll to latest message
- Notification when new message received (email optional for MVP)
- Mark messages as read

### 7. AI Q&A Assistant (Popup)
- Floating button (bottom-right, always visible)
- Click to open chat popup
- Chat interface with:
  - Message history in conversation
  - User input field
  - Send button
- Questions can be about:
  - Autism education & diagnosis
  - IEP process & school rights
  - Therapies (ABA, speech, OT, etc.)
  - Financial aid & benefits
  - Finding resources
  - Parenting strategies
- AI responses via Together AI:
  - Model: Mixtral 8x7B or similar
  - Rate limited to 50 requests/hour per user (free tier)
  - Responses cached for 24 hours
- Conversation can be cleared or new chat started
- Mobile responsive

### 8. Admin Dashboard (Private)
- **Admin-only access:** Email: bmgaccident@gmail.com (hardcoded, can be changed in env)
- **Authentication:** Separate admin login route (different from regular user auth)
- **Metrics Overview:**
  - Total users registered
  - Total waitlist signups
  - Total blog posts
  - Total messages sent
  - Active users (last 7 days)
  - Total resources indexed
- **Subscription Analytics Dashboard:**
  - Total subscriptions (by tier: Free, Plus, Premium, Concierge)
  - Monthly recurring revenue (MRR)
  - Churn rate (% of users who canceled)
  - Churn by month (chart showing MRR trend)
  - Active vs. canceled subscriptions
  - Average subscription duration
  - Cohort analysis (signups by month, retention)
- **Waitlist Management:**
  - List all waitlist emails with signup date
  - Filter by state interested
  - Sort by date (newest first)
  - **CSV Export:** Download all waitlist data (email, state, date) as CSV
  - Mark as converted (when they sign up)
  - Delete entries
- **User Management:**
  - List all users with email, join date, subscription tier
  - Suspend/activate accounts
  - View user profile & activity
  - Search users by email
- **Subscription Management:**
  - List all active subscriptions
  - View subscription details (plan, start date, renewal date)
  - Manual subscription management (for testing)
  - Cancel/refund subscriptions (admin override)
- **Resources Management:**
  - Add/edit/remove resources
  - Bulk import resources
  - Track verification status
  - Resource usage stats
- **Analytics & Exports:**
  - Signups over time (chart)
  - Blog posts created (chart)
  - Most popular resources
  - Churn by month (line chart)
  - MRR trend (line chart)
  - **CSV Exports:**
    - Waitlist (all fields)
    - Users (email, join date, tier, churn status)
    - Subscriptions (user, tier, start date, status)
    - Analytics (monthly signups, churn, MRR)

---

## Database Schema (Supabase)

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  bio TEXT,
  location VARCHAR(255),
  state VARCHAR(2),
  profile_photo_url VARCHAR(500),
  child_age INTEGER,
  child_autism_level VARCHAR(50),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Waitlist Table
```sql
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  state_interested VARCHAR(50) DEFAULT 'GA',
  email_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Resources Table
```sql
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  resource_type VARCHAR(100),
  address VARCHAR(500),
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  phone VARCHAR(20),
  website VARCHAR(500),
  email VARCHAR(255),
  accepts_insurance BOOLEAN,
  specializations TEXT[],
  latitude FLOAT,
  longitude FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Blog Posts Table
```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  excerpt VARCHAR(500),
  featured_image_url VARCHAR(500),
  category VARCHAR(100),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Blog Comments Table
```sql
CREATE TABLE blog_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blog_post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL, -- 'free', 'plus', 'premium', 'concierge'
  stripe_subscription_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'canceled', 'past_due'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  canceled_at TIMESTAMP,
  cancellation_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Admin Users Table
```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin', -- 'admin', 'analyst'
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Waitlist Table (Updated)
```sql
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  state_interested VARCHAR(50) DEFAULT 'GA',
  email_sent BOOLEAN DEFAULT FALSE,
  converted BOOLEAN DEFAULT FALSE,
  converted_user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Enable Row-Level Security (Updated)
```sql
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Additional RLS Policies
CREATE POLICY "Users see own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Only admins see all subscriptions" ON subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users WHERE email = current_user_email())
);
CREATE POLICY "Admin auth only" ON admin_users FOR SELECT USING (
  email = current_user_email()
);
```

---

## User Flows

### Flow 1: Landing → Waitlist → Email
1. Non-logged-in user visits landing page
2. Enters email in waitlist form
3. Clicks "Join Waitlist"
4. Email added to database (no duplicates)
5. Receives confirmation email via Resend (welcome + coming soon message)
6. User can now sign up with same email

### Flow 2: Signup & Onboarding
1. User clicks "Sign Up" on landing page
2. Enters email & password
3. Supabase sends verification email
4. User verifies email
5. Onboarding wizard:
   - Asks for name, location, bio
   - Profile photo upload
   - Child details (optional)
6. Redirected to dashboard with welcome message

### Flow 3: Browse Resources
1. Logged-in user navigates to Resources
2. Sees all Georgia resources in card format
3. Uses filters (type, city, specialization, insurance)
4. Clicks on resource card
5. Views full details & contact info
6. Can call, email, or visit website directly

### Flow 4: Create Blog Post
1. User clicks "Write a Post"
2. Form opens with title, content editor, image upload
3. User writes post and selects category
4. Clicks "Publish"
5. Post appears on feed
6. Other users see post and can comment

### Flow 5: Message Another Parent
1. User searches for another user by name/location
2. Clicks on user profile
3. Clicks "Send Message"
4. Writes message and sends
5. Message thread opens (conversation history)
6. Recipient sees unread indicator
7. Can reply in thread

### Flow 6: Get AI Guidance
1. User clicks floating chat button (bottom-right)
2. Chat popup opens
3. Types question about autism, IEP, therapy, etc.
4. Clicks send
5. AI generates response via Together AI
6. Response appears in chat
7. User can ask follow-up questions
8. Chat history remains in session

---

## API Routes (Next.js)

```
Authentication
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/user
POST   /api/auth/logout

Admin Authentication
POST   /api/admin/auth/login
GET    /api/admin/auth/user
POST   /api/admin/auth/logout

Waitlist
POST   /api/waitlist
GET    /api/waitlist (admin only)
POST   /api/waitlist/[id]/convert (admin only)

User Profile
GET    /api/user/profile
PUT    /api/user/profile
GET    /api/user/profile/[id]
GET    /api/users/search (search by name)

Resources
GET    /api/resources (with filters: type, city, specialization)
GET    /api/resources/[id]
POST   /api/resources (admin only)
PUT    /api/resources/[id] (admin only)
DELETE /api/resources/[id] (admin only)

Blog Posts
GET    /api/blog
POST   /api/blog
GET    /api/blog/[id]
PUT    /api/blog/[id]
DELETE /api/blog/[id]

Blog Comments
POST   /api/blog/[id]/comments
GET    /api/blog/[id]/comments
DELETE /api/blog/comments/[id]

Messages
GET    /api/messages (list threads)
GET    /api/messages/thread/[userId]
POST   /api/messages

AI Chat
POST   /api/ai-chat (send question, get response)

Subscriptions
GET    /api/subscriptions (current user)
POST   /api/subscriptions (create via Stripe)
PUT    /api/subscriptions/[id] (update)
POST   /api/subscriptions/[id]/cancel

Admin Dashboard
GET    /api/admin/metrics
GET    /api/admin/subscriptions
GET    /api/admin/churn-analytics
GET    /api/admin/users
GET    /api/admin/waitlist
POST   /api/admin/users/[id]/suspend
POST   /api/admin/analytics

CSV Exports (Admin Only)
GET    /api/admin/export/waitlist (returns CSV)
GET    /api/admin/export/users (returns CSV)
GET    /api/admin/export/subscriptions (returns CSV)
GET    /api/admin/export/analytics (returns CSV)

Admin Resources
POST   /api/admin/resources
PUT    /api/admin/resources/[id]
DELETE /api/admin/resources/[id]
GET    /api/admin/resources/stats
```

---

## AI Integration (Together AI API)

### Autism Q&A System Prompt

```
You are a compassionate and knowledgeable autism education advisor. 
You help parents navigate:
- Autism diagnosis and what it means
- IEP (Individualized Education Plan) processes
- School rights and advocacy
- Therapy options (ABA, speech therapy, occupational therapy, etc.)
- Finding resources and services
- Managing autism in home, school, and community settings
- Financial assistance and benefits
- Parenting strategies and support

When a parent asks a question:
1. Be empathetic and non-judgmental
2. Provide practical, actionable advice
3. Reference resources and organizations when relevant
4. Acknowledge complexity and individual differences in autism
5. If you don't know, say so and suggest they consult a professional
6. Keep responses 1-2 paragraphs (concise but helpful)

Always prioritize safety, accuracy, and support for families.
```

**Implementation Details:**
- Model: `mistralai/Mixtral-8x7B-Instruct-v0.1` (or similar on Together AI)
- Max tokens: 500
- Temperature: 0.7
- Rate limit: 50 requests/hour per user (free tier)
- Response caching: 24 hours (same question = cached response)

---

## Admin Authentication & Dashboard

### Admin Login
- **Admin Email:** bmgaccident@gmail.com (hardcoded for MVP, can be updated in database)
- **Separate Auth Route:** `/api/admin/auth/login` (different from user auth)
- **Password:** Generated during initial setup (sent via email or set manually)
- **Session:** JWT token stored in secure HttpOnly cookie
- **Protected Routes:** All `/admin/*` routes redirect to login if not authenticated

### Admin Credentials Setup
During deployment, run this SQL to create admin user:
```sql
INSERT INTO admin_users (email, password_hash, name, role)
VALUES (
  'bmgaccident@gmail.com',
  'bcrypt_hash_of_password_here', -- Generate using bcrypt
  'Admin',
  'admin'
);
```

### Admin Dashboard Features
1. **Subscription Analytics:**
   - Total active subscriptions (by tier)
   - Monthly recurring revenue (MRR) 
   - Churn rate (% of canceled subscriptions)
   - Churn trend (chart showing MRR over time)
   - Cohort analysis (retention by signup month)
   - Average subscription lifetime

2. **Waitlist Management:**
   - Display all waitlist entries
   - Columns: Email, State, Signup Date, Converted (Yes/No)
   - Search by email
   - Filter by state
   - Mark as converted (links to user)
   - Delete entries
   - **CSV Export Button:** Downloads all waitlist data

3. **User Management:**
   - List all users
   - Filter by subscription tier
   - Suspend/reactivate accounts
   - View user activity

4. **CSV Export Functionality:**
   - Waitlist: email, state_interested, created_at, converted, converted_user_id
   - Users: email, first_name, last_name, subscription_tier, created_at
   - Subscriptions: user_email, plan_type, status, current_period_start, current_period_end, canceled_at
   - Analytics: month, signups, churn_count, churn_rate, mrr
   - All CSVs include timestamp in filename (waitlist-2024-01-15.csv)
   - Files download automatically when button clicked

---

## Authentication & Authorization

- **Supabase Auth:** Email/password for regular users; separate admin authentication
- **Admin Auth:** Email (bmgaccident@gmail.com) + password via `/api/admin/auth/login`
- **Row-Level Security (RLS):** Enabled on all tables
  - Users can only modify their own data
  - Users can only delete their own posts/comments
  - All users can read blog posts and resources
  - Admins have full access (managed via admin_users table)
- **JWT:** Supabase provides JWT for users; custom JWT for admin
- **Protected Routes:** Middleware redirects to login if not authenticated
- **Environment Variables:**
  ```
  # Supabase (User Database)
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  SUPABASE_SERVICE_ROLE_KEY=
  
  # Admin Authentication
  ADMIN_EMAIL=bmgaccident@gmail.com
  ADMIN_PASSWORD_HASH= (bcrypt hash, generated during setup)
  ADMIN_JWT_SECRET= (random secret for admin JWT signing)
  
  # AI & External APIs
  TOGETHER_AI_API_KEY=
  
  # Payments (Stripe - for future subscriptions)
  STRIPE_PUBLIC_KEY=
  STRIPE_SECRET_KEY=
  STRIPE_WEBHOOK_SECRET=
  
  # Email
  RESEND_API_KEY=
  
  # Next.js
  NEXTAUTH_SECRET= (if using NextAuth)
  NEXTAUTH_URL=
  NODE_ENV=production
  ```

---

## Resources Data (MVP)

Pre-seed database with 40+ verified Georgia autism resources:

**Therapy Centers:**
- Runnymede Therapeutic Riding Center (equine therapy)
- Behavioral Therapy Associates (ABA)
- Communication Therapy Services (speech)
- Georgia Institute of Professional Psychology (diagnostic)
- [+20 more from real Georgia providers]

**Schools:**
- Georgia School for Innovation and the Classics
- DeKalb County Special Education Programs
- [+10 more schools with special ed]

**Diagnostic Centers:**
- Emory Autism Center
- Children's Healthcare of Atlanta
- [+5 more pediatric diagnostic centers]

**Support Organizations:**
- Autism Society of Georgia
- Georgia Advocacy Office
- Georgia Vocational Rehabilitation Agency
- [+5 more nonprofits]

**Data Format (JSON to seed):**
```json
{
  "name": "Runnymede Therapeutic Riding Center",
  "description": "Equine therapy for children with autism and developmental disabilities",
  "resource_type": "therapy",
  "address": "1500 Millstead Road",
  "city": "Warner Robins",
  "state": "GA",
  "zip_code": "31093",
  "phone": "(478) 923-2474",
  "website": "https://www.runnymedetrc.org",
  "email": "info@runnymedetrc.org",
  "accepts_insurance": true,
  "specializations": ["equine_therapy", "autism"],
  "latitude": 32.6,
  "longitude": -83.6
}
```

---

## Deployment Instructions

### Step 1: GitHub Setup
```bash
cd ~/projects
npx create-next-app@latest autism-connect --typescript --tailwind
cd autism-connect
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/[username]/autism-connect.git
git push -u origin main
```

### Step 2: Supabase Setup
1. Create account at https://supabase.com
2. Create new project (region closest to you)
3. Copy `SUPABASE_URL` and `SUPABASE_ANON_KEY`
4. Go to SQL Editor → run all database schema queries (provided above)
5. Enable RLS on all tables (run RLS policy queries)
6. Create seed data script to insert 40+ Georgia resources
7. Set service role key in environment

### Step 2b: Admin User Setup
1. Generate bcrypt hash of admin password:
   ```bash
   npm install bcrypt
   node -e "require('bcrypt').hash('YourPasswordHere', 10, (err, hash) => console.log(hash))"
   ```
2. Copy the hash
3. In Supabase SQL Editor, run:
   ```sql
   INSERT INTO admin_users (email, password_hash, name, role)
   VALUES (
     'bmgaccident@gmail.com',
     '$2b$10$xxxxx...xxxxx', -- paste the hash from step 1
     'Admin',
     'admin'
   );
   ```
4. Admin can now log in at `/admin/login` with email and password

### Step 3: Together AI Setup
1. Create account at https://together.ai
2. Generate API key in dashboard
3. Keep key private (add to .env.local)

### Step 4: Resend Setup
1. Create account at https://resend.com
2. Generate API key
3. Verify sender email domain
4. Add to environment variables

### Step 5: Vercel Deployment
1. Go to https://vercel.com
2. Connect GitHub repository
3. Click "Deploy" (auto-detects Next.js)
4. Add all environment variables in project settings:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - ADMIN_EMAIL=bmgaccident@gmail.com
   - ADMIN_PASSWORD_HASH=(bcrypt hash from step 2b)
   - ADMIN_JWT_SECRET=(generate: `openssl rand -base64 32`)
   - TOGETHER_AI_API_KEY
   - RESEND_API_KEY
   - STRIPE_PUBLIC_KEY (if doing payments)
   - STRIPE_SECRET_KEY (if doing payments)
   - STRIPE_WEBHOOK_SECRET (if doing payments)
5. Click "Deploy"
6. Test live site at your-domain.vercel.app
7. Test admin login at your-domain.vercel.app/admin/login

---

## CSV Export Implementation

### CSV Export Routes

**GET /api/admin/export/waitlist**
- Returns waitlist data as CSV
- Columns: Email, State, Signup Date, Converted, Converted User ID
- Filename: `autism-connect-waitlist-${date}.csv`
- Headers: `application/csv`, `Content-Disposition: attachment`

**GET /api/admin/export/users**
- Returns user data as CSV
- Columns: Email, First Name, Last Name, Location, State, Subscription Tier, Signup Date
- Filename: `autism-connect-users-${date}.csv`

**GET /api/admin/export/subscriptions**
- Returns subscription data as CSV
- Columns: User Email, Plan Type, Status, Start Date, End Date, Canceled Date
- Filename: `autism-connect-subscriptions-${date}.csv`

**GET /api/admin/export/analytics**
- Returns monthly analytics as CSV
- Columns: Month, Signups, Churn Count, Churn Rate, MRR
- Filename: `autism-connect-analytics-${date}.csv`

### Implementation Details
```javascript
// Example: export waitlist as CSV
const stringify = (row) => row.map(cell => `"${cell}"`).join(',');

const rows = waitlistData.map(item => [
  item.email,
  item.state_interested,
  item.created_at,
  item.converted ? 'Yes' : 'No',
  item.converted_user_id || ''
]);

const csv = [
  ['Email', 'State', 'Signup Date', 'Converted', 'User ID'],
  ...rows
].map(stringify).join('\n');

// Send as attachment
res.setHeader('Content-Type', 'text/csv');
res.setHeader('Content-Disposition', `attachment; filename="waitlist-${new Date().toISOString().split('T')[0]}.csv"`);
res.send(csv);
```

---

```
/components
  /landing
    HeroSection.tsx
    FeaturesSection.tsx
    GeographicMessaging.tsx
    WaitlistForm.tsx
    Footer.tsx
  /auth
    SignupForm.tsx
    LoginForm.tsx
  /dashboard
    DashboardLayout.tsx
    WelcomeCard.tsx
  /resources
    ResourceLibrary.tsx
    ResourceCard.tsx
    ResourceFilter.tsx
    ResourceDetail.tsx
  /blog
    BlogFeed.tsx
    BlogCard.tsx
    BlogPostForm.tsx
    BlogPostPage.tsx
    CommentSection.tsx
  /messaging
    MessageThreadList.tsx
    MessageThread.tsx
    MessageInput.tsx
  /ai
    AIChatPopup.tsx
    ChatMessage.tsx
  /profile
    UserProfile.tsx
    ProfileCard.tsx
    ProfileEdit.tsx
  /admin
    AdminLogin.tsx
    AdminDashboard.tsx
    SubscriptionAnalytics.tsx
    ChurnChart.tsx
    MRRChart.tsx
    WaitlistManager.tsx
    WaitlistCSVExport.tsx
    UserManagement.tsx
    ResourceManagement.tsx
    AnalyticsDashboard.tsx
    AdminSidebar.tsx
  /common
    Header.tsx
    Navigation.tsx
    Footer.tsx
    LoadingSpinner.tsx
    ErrorBoundary.tsx
```

---

## Non-Functional Requirements

- **Performance:** Page load < 2 seconds
- **Security:** 
  - All passwords hashed (Supabase handles via bcrypt)
  - HTTPS only (Vercel enforces)
  - RLS on all database tables
  - API rate limiting (esp. on AI endpoints)
  - No sensitive data in logs
- **Scalability:** Support 1,000+ concurrent users on Vercel
- **Uptime:** 99.5% (Vercel + Supabase SLAs)
- **Mobile:** Responsive design (mobile-first, tested on iOS/Android)
- **Accessibility:** WCAG 2.1 AA standard (alt text, semantic HTML, keyboard nav)
- **Browser Support:** Chrome, Firefox, Safari, Edge (last 2 versions)

---

## Success Criteria (MVP Launch)

- [ ] Landing page displays with hero, features, waitlist form
- [ ] Waitlist form saves emails to database
- [ ] Confirmation email sent via Resend
- [ ] Users can sign up with email/password
- [ ] Email verification works
- [ ] Onboarding wizard collects profile data
- [ ] User profiles display correctly (public + editable)
- [ ] Resource library displays 40+ Georgia resources
- [ ] Resource filters work (type, city, specialization)
- [ ] Blog post creation works (title, content, image, category)
- [ ] Blog feed displays posts (paginated)
- [ ] Comments on posts work
- [ ] Messaging between users works
- [ ] Message threads display conversation history
- [ ] AI chat popup works (question → response)
- [ ] Together AI responses are helpful and on-topic
- [ ] Admin login works with email: bmgaccident@gmail.com
- [ ] Admin dashboard displays subscription metrics (active, tier breakdown)
- [ ] Churn analytics display (churn rate, monthly trend chart)
- [ ] Waitlist displayed in admin panel (all entries with dates)
- [ ] CSV export works for waitlist (email, state, date, converted)
- [ ] CSV export works for users
- [ ] CSV export works for subscriptions
- [ ] CSV export works for analytics
- [ ] Admin can mark waitlist entries as converted
- [ ] Admin can view user management
- [ ] Admin can manage resources
- [ ] Admin can view all metrics
- [ ] Stripe placeholder ready (not fully implemented for MVP)
- [ ] All API routes documented
- [ ] Database backups enabled

---

## Post-MVP Roadmap (v2 & Beyond)

**Immediate (Week 2-4):**
- Expand to 3-5 more states (collect resources)
- Add more Georgia resources (100+)
- Payment integration (Stripe subscriptions)
- Email notifications (new messages, comments, new posts)

**Month 2:**
- Advanced search & filters
- Resource reviews & ratings
- Resource recommendations based on user profile
- Blog post categories & better search
- User follow system

**Month 3+:**
- IEP coaching (1:1 video calls with coaches)
- Therapist booking integration
- Parent mentor matching
- Content library (guides, videos, webinars)
- Mobile app (React Native)
- White-label for nonprofits

---

## Notes for Developer

1. **Keep it simple:** MVP = minimal, functional, deployable. Don't over-engineer.
2. **Test thoroughly:** 
   - Auth flows (signup, login, email verification)
   - RLS (users can't see others' private data)
   - Blog & messaging (CRUD operations)
   - AI chat (rate limiting, response quality)
3. **Error handling:** 
   - Graceful failures for Supabase, Together AI, Resend
   - Show user-friendly error messages
   - Log errors to console for debugging
4. **Performance:** 
   - Optimize images (next/image component)
   - Lazy load components
   - Cache API responses where possible
5. **Database:** 
   - Enable automated backups in Supabase
   - Test RLS policies thoroughly
   - Use migrations for schema changes
6. **Monitoring:** 
   - Track errors in Vercel dashboard
   - Monitor Together AI API costs
   - Check Supabase database usage
7. **Documentation:**
   - Document all API routes
   - Keep environment variables documented
   - Add comments to complex functions

---

## File Structure

```
autism-connect/
├── .env.local (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── public/
│   ├── logo.svg
│   ├── hero-image.jpg
│   └── favicon.ico
├── app/
│   ├── layout.tsx
│   ├── page.tsx (landing page)
│   ├── dashboard/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   ├── resources/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── blog/
│   │   ├── page.tsx
│   │   ├── [id]/page.tsx
│   │   └── create/page.tsx
│   ├── messages/
│   │   ├── page.tsx
│   │   └── [userId]/page.tsx
│   ├── profile/
│   │   ├── [id]/page.tsx
│   │   └── edit/page.tsx
│   ├── admin/
│   │   ├── page.tsx (dashboard)
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── users/page.tsx
│   │   ├── resources/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── waitlist/page.tsx
│   │   └── subscriptions/page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── signup.ts
│   │   │   ├── login.ts
│   │   │   └── logout.ts
│   │   ├── user/
│   │   │   ├── profile.ts
│   │   │   └── search.ts
│   │   ├── resources/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── blog/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── [id]/comments/route.ts
│   │   ├── messages/
│   │   │   ├── route.ts
│   │   │   └── thread/[userId]/route.ts
│   │   ├── ai-chat/
│   │   │   └── route.ts
│   │   ├── waitlist/
│   │   │   └── route.ts
│   │   └── admin/
│   │       ├── auth/
│   │       │   ├── login.ts
│   │       │   ├── logout.ts
│   │       │   └── user.ts
│   │       ├── metrics/route.ts
│   │       ├── subscriptions/route.ts
│   │       ├── churn-analytics/route.ts
│   │       ├── waitlist/route.ts
│   │       ├── analytics/route.ts
│   │       ├── users/route.ts
│   │       └── export/
│   │           ├── waitlist/route.ts
│   │           ├── users/route.ts
│   │           ├── subscriptions/route.ts
│   │           └── analytics/route.ts
│   └── lib/
│       ├── supabase.ts
│       ├── together-ai.ts
│       ├── resend.ts
│       └── auth.ts
├── components/
│   ├── landing/
│   ├── auth/
│   ├── dashboard/
│   ├── resources/
│   ├── blog/
│   ├── messaging/
│   ├── ai/
│   ├── profile/
│   ├── admin/
│   └── common/
├── styles/
│   ├── globals.css (TailwindCSS directives)
│   └── variables.css
└── middleware.ts (NextAuth or custom auth)
```

---

## Summary

This MVP is a **lean, deployable product** that solves a real problem parents of autistic children face daily:
- **Problem:** Parents spend 100+ hours finding scattered autism resources
- **Solution:** Centralized hub (resources) + community support (blog + messaging) + AI guidance

**Strategy:**
1. Launch in Georgia with real resources
2. Get user feedback (first 100 users)
3. Iterate on features based on feedback
4. Expand to other states
5. Add premium features (coaching, advanced resources, etc.)

**Focus on:**
- User experience (mobile-first)
- Data privacy (RLS on all tables)
- Community engagement (make blog/messaging delightful)
- AI quality (meaningful answers to real questions)

**Build this, launch, iterate. Don't chase perfection.**

Good luck! 🚀
