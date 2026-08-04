# WEB322 Project Explanation

## 1. Project Overview
This is a Node.js + Express web application for a meal-kit service. It supports:
- Public pages (home, menu, sign-up, log-in)
- User registration and authentication
- Session-based role access control (Customer vs Data Clerk)
- Meal-kit catalog browsing and category grouping
- MongoDB user persistence with password hashing
- Welcome email sending through Mailgun after registration

Main technologies:
- Express 5
- EJS + express-ejs-layouts
- MongoDB + Mongoose
- express-session
- bcryptjs
- Mailgun API
- Tailwind CSS + DaisyUI

## 2. High-Level Flow
1. The app starts in `server.js`.
2. Environment variables are loaded from `config/.env`.
3. Global middleware sets session and EJS locals.
4. Controllers are mounted:
   - `/` -> general routes
   - `/mealkits` -> meal-kit routes
5. MongoDB connection is established before the HTTP server starts.
6. Requests render EJS views with server-side data.

## 3. Folder Responsibilities
- `server.js`: app bootstrap, middleware, controller mounting, error handling, DB startup.
- `controllers/`: route handlers.
- `modules/`: reusable business/auth/data/email logic.
- `views/`: EJS templates and partials.
- `public/`: static files (images, CSS, fonts).
- `config/.env`: runtime configuration and secrets.

## 4. Method and Route Functionality

### 4.1 `server.js`

#### `connectToMongo()`
- Purpose: Connects to MongoDB using `MONGODB_CONNECTION_STRING`.
- Behavior:
  - Tries normal Mongoose connection.
  - If DNS SRV lookup fails with `ECONNREFUSED` + `querySrv`, switches DNS resolvers to Google/Cloudflare (`8.8.8.8`, `1.1.1.1`) and retries.
  - Throws the error for any other failure.

#### `onHttpStart()`
- Purpose: Logs the local server URL after Express starts listening.

#### App-level middleware callbacks
- Session middleware: persists user session data.
- Locals middleware:
  - Stores `req.session.user` in `res.locals.user` so views can access logged-in user info.
  - Exposes role constants from environment variables to templates.
- 404 handler (`app.use((req, res) => ...)`): renders `error.ejs` for unknown routes.
- 500 error handler (`app.use((err, req, res, next) => ...)`): logs stack and renders `error.ejs`.

---

### 4.2 `controllers/generalController.js`

#### `GET /`
- Loads all meal kits, filters featured kits, renders `general/home`.

#### `GET /home`
- Same behavior as `/` (home page alias).

#### `GET /sign-up`
- Renders sign-up page (`users/sign-up`).

#### `GET /log-in`
- Renders log-in page (`users/log-in`).

#### `GET /welcome`
- Renders welcome page shown after successful registration.

#### `GET /cart` (protected by `auth.logInCustomer`)
- Only logged-in users with customer role can access.
- Renders `mealkits/cart`.

#### `POST /log-in`
- Steps:
  1. Validates form fields via `auth.validateAndLogIn(req.body)`.
  2. If validation errors exist, re-renders log-in with errors and entered values.
  3. If valid, finds user by email in MongoDB.
  4. Compares plaintext password with hashed password via `bcryptjs.compare`.
  5. On success, stores user data in `req.session.user` and redirects by selected role:
     - Data Clerk -> `/mealkits/list`
     - Customer -> `/cart`
  6. On mismatch or query issues, re-renders log-in with appropriate messages.

#### `GET /log-out`
- Destroys session and redirects to `/log-in`.

#### `POST /sign-up`
- Steps:
  1. Validates form fields via `auth.validateAndSignUp`.
  2. If errors exist, re-renders sign-up with errors + submitted values.
  3. Checks duplicate email via `auth.checkUserExists`.
  4. Creates and saves new `Users` document (password hash handled by model hook).
  5. Sends welcome message through `mailgun.sendSimpleMessage`.
  6. Redirects to `/welcome` on success.

---

### 4.3 `controllers/mealkitsController.js`

#### `GET /mealkits/on-the-menu`
- Loads all meal kits.
- Groups kits by category via `mealKitUtil.getMealKitsByCategory`.
- Renders `mealkits/on-the-menu` with grouped data.

#### `GET /mealkits/list` (protected by `auth.logInDataClerk`)
- Allows only data-clerk role users.
- Renders `mealkits/list`.

---

### 4.4 `modules/auth.js`

#### `validateAndSignUp(formData)`
- Validates sign-up payload (`firstName`, `lastName`, `email`, `password`).
- Enforces:
  - Non-empty required fields
  - Email regex format
  - Password complexity and length (8-12, upper, lower, number, special)
- Returns an `errors` object keyed by field name.

#### `validateAndLogIn(formData)`
- Validates log-in payload (`email`, `password`, `role`).
- Checks role against allowed values from environment variables.
- Returns an `errors` object.

#### `renderUnauthorized(res)`
- Helper that returns a rendered 401 Unauthorized error page.

#### `checkUserExists(email, errors = {})`
- Queries MongoDB for an existing user by email.
- If found or if DB query fails, sets an email error and returns `true`.
- Returns `false` only when no matching user exists.

#### `logInStatus(req, res, next)`
- Middleware requiring any authenticated session user.

#### `logInCustomer(req, res, next)`
- Middleware allowing only users whose role equals `CUSTOMER_ROLE`.

#### `logInDataClerk(req, res, next)`
- Middleware allowing only users whose role equals `DATA_CLERK_ROLE`.

---

### 4.5 `modules/mealkit-util.js`

#### `getAllMealKits()`
- Returns the in-memory `mealkits` array.

#### `getFeaturedMealKits(mealkits)`
- Filters meal kits where `featuredMealKit === true`.
- Returns a new array of featured items.

#### `getMealKitsByCategory(mealkits)`
- Groups meal kits by `category`.
- Returns an array shaped like:
  - `{ categoryName, mealkits: [...] }`
- Used by the menu page to render sections per category.

---

### 4.6 `modules/mailmessage.js`

#### `sendSimpleMessage(formData)`
- Builds a Mailgun client with `MAILGUN_API_KEY`.
- Sends an HTML welcome-style email to the newly registered user.
- Logs API response or error.

---

### 4.7 `modules/userModel.js`

#### `userSchema` (Mongoose schema)
- Fields: `firstName`, `lastName`, `email` (unique), `password`.

#### `userSchema.pre("save", async function (next) { ... })`
- Mongoose pre-save hook for password hashing.
- Behavior:
  - If password has not changed, exits early.
  - Otherwise generates salt (`genSalt(10)`) and hashes password.
  - Prevents plain-text passwords from being stored.

## 5. Environment Variables Used
Defined in `config/.env` and referenced in code:
- `PORT`
- `SESSION_SECRET`
- `MONGODB_CONNECTION_STRING`
- `CUSTOMER_ROLE`
- `DATA_CLERK_ROLE`
- `MAILGUN_API_KEY`

## 6. Rendering and UI Notes
- EJS layouts are configured with `layouts/main` as default.
- Shared UI parts are under `views/partials` (navbar, footer, mealkit card).
- Static files are served from `public/`.

## 7. Security and Access Control Summary
- Passwords are hashed before storage using bcrypt.
- Session-based auth is enforced with role-specific middleware.
- Unauthorized access attempts return a 401 error page.
- Unknown routes return 404 and unexpected failures return 500 pages.

## 8. Current Architectural Characteristics
- Meal-kit data is currently in-memory (`modules/mealkit-util.js`) rather than database-backed.
- User records are database-backed (MongoDB).
- Controllers contain both routing and some business logic; modules provide reusable helper logic.

## 9. Suggested Next Improvements
- Move meal-kit catalog from in-memory array to MongoDB.
- Centralize response error messaging for cleaner controllers.
- Add automated tests for validation and role middleware.
- Add CSRF protection and stronger session cookie hardening for production.
