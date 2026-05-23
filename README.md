# DevTinder Backend

A Node.js/Express backend API for DevTinder — a developer networking and connection application inspired by swipe-based social discovery.

## 🚀 Project Overview

This repository contains the backend service for DevTinder. It handles:
- user registration and login
- profile management
- connection requests between developers
- activity feeds
- basic chat persistence and real-time messaging support via Socket.IO

## 🧩 Tech Stack

- Node.js
- Express 5
- MongoDB / Mongoose
- JSON Web Tokens (JWT)
- Socket.IO
- bcrypt for password hashing
- dotenv for environment configuration
- cors for cross-origin support

## 📁 Folder Structure

```
DevTinder-backend/
├── package.json
├── README.md
├── src/
│   ├── app.js
│   ├── config/
│   │   └── database.js
│   ├── middlewares/
│   │   └── auth.js
│   ├── models/
│   │   ├── chat.js
│   │   ├── connectionRequest.js
│   │   └── user.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── chat.js
│   │   ├── profile.js
│   │   ├── request.js
│   │   └── user.js
│   └── utils/
│       ├── socket.js
│       └── validate.js
```

## 🔧 Setup Instructions

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the repository root and add:

```env
PORT=7777
DB_CONNECTION_STRING=<your-mongodb-connection-string>
JWT_SECRET_KEY=<your-jwt-secret>
```

### 3. Start the server

- For development with auto-reload:

```bash
npm run dev
```

- For production-style start:

```bash
npm start
```

### 4. Default origin allowed

The backend is configured to accept requests from:

- `http://localhost:5173`

If your frontend runs on a different origin, update the CORS settings in `src/app.js` and `src/utils/socket.js`.

## 🌐 API Endpoints

### Auth

| Method | Path | Description |
|---|---|---|
| POST | `/signup` | Register a new user |
| POST | `/login` | Login and receive auth cookie |
| POST | `/logout` | Clear auth cookie |

#### Signup request body

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "emailId": "john@example.com",
  "password": "StrongP@ssw0rd!",
  "age": 28,
  "gender": "male",
  "skills": ["JavaScript", "Node.js"],
  "photoUrl": "https://example.com/avatar.jpg",
  "about": "Full stack developer"
}
```

#### Login request body

```json
{
  "emailId": "john@example.com",
  "password": "StrongP@ssw0rd!"
}
```

### Profile

| Method | Path | Description |
|---|---|---|
| GET | `/profile/view` | Get logged-in user profile |
| PATCH | `/profile/edit` | Update profile fields |
| PATCH | `/profile/password` | Update password |

### User & Feed

| Method | Path | Description |
|---|---|---|
| GET | `/feed` | Get profiles for potential connections |
| GET | `/user/requests/received` | Get incoming connection requests |
| GET | `/user/connections` | Get accepted connections |
| GET | `/user/:userId` | Get minimal public info for a user |

### Connection Requests

| Method | Path | Description |
|---|---|---|
| POST | `/request/send/:status/:userId` | Send request to a user (`interested` or `ignored`) |
| POST | `/request/review/:status/:requestId` | Review incoming request (`accepted` or `rejected`) |

Example:

```http
POST /request/send/interested/642f...abcd
```

### Chat

| Method | Path | Description |
|---|---|---|
| GET | `/chat/:targetUserId` | Fetch or create chat thread with another user |

## 🔐 Authentication

- Auth is cookie-based.
- `src/middlewares/auth.js` verifies the `token` cookie.
- Protected routes require a valid JWT token cookie.

## 💬 Socket.IO Real-Time Events

The backend exposes the following socket events via `src/utils/socket.js`:

- `userOnline` — mark a user as online
- `joinChat` — join a private chat room
- `leaveChat` — leave the chat room
- `sendMessage` — send a chat message to another user
- `markChatSeen` — mark unseen messages as seen
- `onlineUsers` — broadcast online user IDs
- `messageReceived` — broadcast new message payload
- `messagesSeen` — broadcast seen updates

## 🧪 Important Notes

- The backend stores chat history in MongoDB using `src/models/chat.js`.
- Connection requests use `src/models/connectionRequest.js` and support statuses: `ignored`, `interested`, `accepted`, `rejected`.
- The user model validates email and password strength using `validator`.

## 🧰 Environment Variables

Required variables:

- `PORT` — port where the backend listens (example: `7777`)
- `DB_CONNECTION_STRING` — MongoDB connection string
- `JWT_SECRET_KEY` — secret used to sign JSON Web Tokens

## 📌 Developer Tips

- If you want to support a different frontend URL, update the CORS origin in both `src/app.js` and `src/utils/socket.js`.
- Use a strong `JWT_SECRET_KEY` and never commit `.env` to source control.
- If MongoDB fails to connect, verify `DB_CONNECTION_STRING` and your cluster/network access.

## ✅ Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Create `.env` with required values
4. Run `npm run dev`
5. Open your frontend and connect to the backend on `http://localhost:7777`

