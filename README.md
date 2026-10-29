# WhatsApp Web Clone - Full-Stack Real-Time Chat & Calling App

A modern, responsive, full-stack WhatsApp Web clone built with React, TypeScript, Tailwind CSS / Vanilla styling, Node.js, Express, Socket.IO, WebRTC, and MongoDB.

## Features

- 💬 **Real-time Messaging**: Instant one-on-one and group messaging powered by Socket.IO.
- 📞 **Voice & Video Calling**: Peer-to-peer real-time audio and video calls powered by WebRTC.
- 🔐 **Authentication & Security**: JWT-based authentication, bcrypt password hashing, and email verification.
- 🗄️ **MongoDB Database**: Persistent user profiles, message histories, conversation threads, and call logs.
- 🟢 **Online/Offline Presence**: Real-time user statuses and last-seen timestamps.
- 📎 **Rich Attachments**: Support for image, video, document, and media sharing.
- 📱 **Responsive Design**: Pixel-perfect layout inspired by WhatsApp Web, fully optimized for both desktop and mobile viewports.

---

## Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Icons**: Lucide Icons
- **Real-Time Client**: Socket.IO Client
- **WebRTC**: Peer-to-peer audio and video streaming
- **Styling**: Modern CSS design system

### Backend
- **Runtime**: Node.js
- **Server Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-Time**: Socket.IO
- **Security & Auth**: JSON Web Tokens (JWT), bcryptjs
- **Email Service**: Nodemailer (Gmail SMTP / Custom SMTP)

---

## Project Structure

```text
chat-app/
├── public/                 # Static assets
├── src/                    # Frontend source code
│   ├── components/         # Reusable UI components
│   ├── context/            # Global App & Auth state management
│   ├── pages/              # Views (Chats, Calls, Status, Auth, Profile)
│   ├── services/           # API and Socket client services
│   ├── types/              # TypeScript definitions
│   └── App.tsx             # Root application component
├── server/                 # Backend Express & Socket.IO server
│   ├── src/
│   │   ├── config/         # Database & DNS configuration
│   │   ├── controllers/    # Request controllers
│   │   ├── models/         # Mongoose schemas (User, Message, Conversation, Call)
│   │   ├── routes/         # Express API endpoints
│   │   ├── services/       # Business logic services
│   │   ├── socket/         # Socket.IO handlers (chat & signaling)
│   │   └── utils/          # Email and helper utilities
│   ├── .env.example        # Environment variable template
│   └── package.json
├── .gitignore              # Git ignore rules (protects .env and secrets)
├── package.json            # Frontend dependencies
└── vite.config.ts          # Vite configuration
```

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas cluster or local MongoDB instance

---

### Installation & Setup

#### 1. Clone the repository
```bash
git clone https://github.com/Tushar-Singh07/Chat-App.git
cd Chat-App
```

#### 2. Configure Backend Environment
Navigate to the `server/` directory and create your `.env` file based on `.env.example`:
```bash
cd server
cp .env.example .env
```

Configure your environment variables in `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@yourcluster.mongodb.net/chatapp?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Optional SMTP Configuration for email verification
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM="WhatsApp Web" <your_email@gmail.com>
```

#### 3. Install Dependencies & Run

**Backend:**
```bash
cd server
npm install
npm run dev
```

**Frontend:**
```bash
# In the root directory:
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to experience the application.

---

## License
MIT License
