# Full-Stack meal kit ordering application

## Meal Kit Service Application

## Developer

| Name | Role |
| --- | --- |
| Fabricio Alejandro Ortiz Fiallos | Full-stack development, database integration, authentication, order processing, and documentation |

## Project Description

This project is a full-stack meal kit ordering application. Customers can browse meal kits, view meal details, add products to a session-based cart, and place orders that are confirmed by email.

The application also includes a data clerk workflow for managing the meal kit catalogue. Authorized data clerks can add, edit, remove, and feature meal kits, including uploading product images. User accounts and meal kits are stored in MongoDB, passwords are hashed before storage, and protected pages use Express sessions with role-based authorization.

## Technology Stack

| Technology | Purpose |
| --- | --- |
| Node.js | JavaScript runtime |
| Express 5 | Web server and routing |
| EJS and express-ejs-layouts | Server-rendered views and shared layouts |
| MongoDB Atlas and Mongoose | Persistent user and meal kit data |
| Express Session | Login state and customer carts |
| bcryptjs | Password hashing and verification |
| Tailwind CSS 4 and DaisyUI | Styling and UI components |
| express-fileupload | Meal kit image uploads |
| Mailgun | Welcome and order confirmation emails |

## Theme

Meal kit discovery and online ordering with separate customer and data clerk experiences, secure account authentication, persistent catalogue data, and email order confirmations.

## External Services and Data

| Service or source | Purpose |
| --- | --- |
| MongoDB Atlas | Stores users and meal kits |
| Mailgun | Sends welcome and order confirmation emails |
| Local meal kit seed data | Provides initial meal kit records for database loading |
| Local asset storage | Stores uploaded meal kit images in `public/assets` |

## Application Routes

The application is a server-rendered Express application rather than a separate frontend and REST API. Protected routes require an authenticated Express session and the appropriate role.

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/` or `/home` | Public | Displays featured meal kits |
| `GET` | `/mealkits/on-the-menu` | Public | Displays meal kits grouped by category |
| `GET` | `/sign-up` | Public | Displays account registration |
| `POST` | `/sign-up` | Public | Creates a customer account |
| `GET` | `/log-in` | Public | Displays the login form |
| `POST` | `/log-in` | Public | Authenticates a customer or data clerk |
| `GET` | `/log-out` | Authenticated | Ends the current session |
| `GET` | `/cart` | Customer | Displays the current cart |
| `POST` | `/place-order` | Customer | Sends an order confirmation and clears the cart |
| `POST` | `/mealkits/add-to-cart/:id` | Customer | Adds a meal kit to the cart |
| `POST` | `/mealkits/update-cart` | Customer | Updates cart quantities |
| `POST` | `/mealkits/remove-from-cart/:id` | Customer | Removes a meal kit from the cart |
| `GET` | `/mealkits/list` | Data clerk | Lists all meal kits for management |
| `GET` | `/mealkits/add` | Data clerk | Displays the add meal kit form |
| `POST` | `/mealkits/add` | Data clerk | Creates a meal kit and uploads its image |
| `GET` | `/mealkits/edit/:id` | Data clerk | Displays the edit meal kit form |
| `POST` | `/mealkits/edit/:id` | Data clerk | Updates a meal kit |
| `GET` | `/mealkits/remove/:id` | Data clerk | Displays the remove confirmation |
| `POST` | `/mealkits/remove/:id` | Data clerk | Deletes a meal kit and its image |
| `GET` | `/load-data/mealkits` | Data clerk | Loads seed meal kits when the collection is empty |

## MongoDB Data

Each user document contains:

| Field | Purpose |
| --- | --- |
| `firstName` | Customer first name |
| `lastName` | Customer last name |
| `email` | Unique account email |
| `password` | Bcrypt password hash |

Each meal kit document contains its `title`, `includes`, `description`, `category`, `price`, `cookingTime`, `servings`, `imageUrl`, and `featuredMealKit` values.

Plaintext passwords are never stored in MongoDB. Customer cart contents are stored in the Express session and are not persisted as a separate MongoDB collection.

## Environment Configuration

Create `config/.env` with the following values:

```env
MONGODB_CONNECTION_STRING=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
CUSTOMER_ROLE=Customer
DATA_CLERK_ROLE=Data Clerk
MAILGUN_API_KEY=your_mailgun_api_key
PORT=8080
```

`PORT` is optional and defaults to `8080`. Keep `config/.env` private and do not commit credentials.

## Local Installation

Install the project dependencies:

```bash
npm install
```

In a separate terminal, compile and watch the Tailwind CSS file:

```bash
npm run build-css
```

Start the Express server:

```bash
npm start
```

The application is available at `http://localhost:8080` unless a different `PORT` is configured.

