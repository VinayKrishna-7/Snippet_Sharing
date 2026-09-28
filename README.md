# SnipDrop ⚡

> **Share code instantly. No account required.**

SnipDrop is an anonymous, fast, developer-friendly code snippet sharing platform built on the **MERN stack** (MongoDB, Express, React, Node.js) with the **Monaco Editor** and **Tailwind CSS**.

---

## ✨ Features

- **No Sign-Up Needed**: Instant access with zero authentication or user tracking.
- **VS Code Monaco Editor**: Line numbers, tab indentation, dark theme, and character count.
- **16+ Languages**: Syntax support for JavaScript, TypeScript, Python, Go, Rust, Java, C++, and more.
- **Unique Shareable URLs**: Clean short links (e.g. `/s/a8K2xP`). MongoDB IDs are never exposed.
- **Expiration System**: Auto-expire snippets (*1 hour, 1 day, 7 days, 30 days, or Never*).
- **Live View Counter**: Atomically tracks views on valid snippet requests.
- **Search, Filter & Sort**: Browse community snippets by language, keywords, and popularity.
- **Private Deletion**: Secure token generated at creation time to delete snippets without an account.
- **Zero-Config Database**: Automatic in-memory fallback for instant local testing, plus 1-click MongoDB Atlas support.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router 6, Monaco Editor, Tailwind CSS, Lucide Icons, Axios
- **Backend**: Node.js, Express.js, Mongoose, Helmet, Express-Rate-Limit, CORS
- **Database**: MongoDB / MongoDB Atlas (with automatic local fallback)

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd snipdrop

# Install all dependencies (client and server)
npm run install:all
```

### 2. Configure Environment

Copy `.env.example` in the `server` folder:

```bash
cp server/.env.example server/.env
```

*(Optional)* Set your MongoDB Atlas URI in `server/.env`. If omitted, SnipDrop will run in zero-config local storage mode automatically.

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/snipdrop?retryWrites=true&w=majority
CLIENT_URL=http://localhost:5173
```

### 3. Run Locally

Start both the backend server and frontend development server with a single command:

```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/snippets` | Create a new snippet |
| `GET` | `/api/snippets/:id` | Get snippet by short ID (increments views) |
| `GET` | `/api/snippets` | Browse snippets (search, filter, pagination) |
| `DELETE` | `/api/snippets/:id` | Delete snippet (requires `deleteToken`) |
| `GET` | `/api/health` | Service health status |

---

## 🌐 Deployment

- **Frontend**: Deploy the `client` folder to **Vercel** or **Netlify** (`Build: npm run build`, `Output: dist`).
- **Backend**: Deploy the `server` folder to **Render** or **Railway** (`Start: node server.js`).
- Set `VITE_API_URL` on the frontend pointing to your deployed backend URL.

---

## 📄 License

MIT License — free for personal and commercial projects.
