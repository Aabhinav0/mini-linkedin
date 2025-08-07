# Mini-Linkedin---Professional-Community-to-Interact-with-Peoples
A full-stack LinkedIn clone built with React, Node.js, Express, and MongoDB. Features include user auth, post creation, likes, and profile updates. Uses Axios, JWT, and Mongoose. Ideal for learning the MERN stack or building social media-style apps.  

A full-stack LinkedIn-inspired platform built using the MERN stack. Users can register, create profiles, post content with images, interact socially (likes, comments), and view each other’s profiles. Designed to be responsive, secure, and developer-friendly.

🛠 Tech Stack
Frontend
React 18 – Built with hooks and modern state management.

React Router DOM – Handles client-side routing smoothly.

Axios – For making HTTP requests to the backend API.

CSS3 – Custom styling using modern CSS features.

Responsive Design – Mobile-first layout, adapts to all screen sizes.

Backend
Node.js – Runtime for building scalable server-side logic.

Express.js – Lightweight framework for handling API routes.

MongoDB – NoSQL database for storing users and posts.

Mongoose – ODM to simplify database operations.

JWT – For secure, token-based authentication.

bcryptjs – Password hashing to protect user data.

Multer – Handles file uploads (image support).

CORS – Configured to handle cross-origin requests safely.

Dev Tools
Concurrently – Runs client and server at the same time in dev mode.

Nodemon – Auto-reloads backend server on changes.

📦 Features
Core
User registration and login with JWT

Profile creation and editing

Post creation with optional image uploads

Like and comment functionality

View other users and their posts

Real-time UI updates (no reloads)

Fully responsive and mobile-optimized

Additional
Passwords are securely hashed with bcrypt

File uploads are validated and stored securely

Meaningful error messages for all major operations

Skeleton loaders and spinners during async operations

Clean LinkedIn-like UI using CSS grids and cards

⚙️ Getting Started
Requirements
Node.js (v14+)

MongoDB (local or Atlas)

npm or yarn

1. Clone the Project
bash
Copy
Edit
git clone <your-repo-url>
cd your-project-folder
2. Install Dependencies
bash
Copy
Edit
# Install root-level dependencies
npm install

# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
3. Environment Setup
Create a file at backend/config.env with:

ini
Copy
Edit
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/YourDB?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
Replace placeholders with actual values.

4. Image Uploads Directory
bash
Copy
Edit
mkdir backend/uploads
This is where uploaded images will be stored.

5. Run the App
Development Mode
bash
Copy
Edit
# From root directory
npm run dev
Production Mode
bash
Copy
Edit
# Build frontend
npm run build

# Start backend server
npm start
🔐 Admin Users
By default, all users are regular users. To create an admin:

Register a user via the frontend.

Go to your MongoDB database and manually update the user document:

json
Copy
Edit
{
  "isAdmin": true
}
Or modify the backend registration logic to include an isAdmin flag for specific users.

📡 API Endpoints
Auth
POST /api/auth/register – Register a user

POST /api/auth/login – Login

GET /api/auth/me – Get current logged-in user

Posts
GET /api/posts – Fetch all posts

POST /api/posts – Create a post (text + image)

GET /api/posts/:id – Get post by ID

PUT /api/posts/:id – Update post

DELETE /api/posts/:id – Delete post

PUT /api/posts/:id/like – Like or unlike a post

Users
GET /api/users/:id – Get user profile

GET /api/users/:id/posts – Get posts by user

PUT /api/users/profile – Update profile info

🎨 UI / UX Highlights
Clean and simple interface

Card-based layout for posts and profiles

Mobile responsive design

Smooth transitions and hover effects

Accessible with keyboard support

Informative toast messages for actions

🔒 Security
Passwords hashed with bcrypt + salt

JWT used for authentication

Input validation on server side

Image uploads restricted by type and size

Error responses don’t expose sensitive data

CORS enabled and configured securely

📦 Deployment
For local production:

bash
Copy
Edit
npm run build
npm start
For cloud deployment, ensure you:

Set environment variables properly

Configure your database URI

Set your frontend build folder to serve static files

