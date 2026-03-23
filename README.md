<div align="center">

```text
       _       _   ___             _   _     _ 
    _ | |__ _ | | / __| __ _  __ _| |_| |_  (_)
   | || / _` || | \__ \/ _` |/ _` |  _| ' \ | |
    \__/\__,_||_| |___/\__,_|\__,_|\__|_||_||_|
```

**Smart Water Aggregator — "Swiggy for Water Delivery"**

[![MIT License](https://img.shields.io/badge/License-MIT-00b4d8?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![React Native Expo](https://img.shields.io/badge/React_Native-Expo-0a9396?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-005f73?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-94d2bd?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-99.3%25-e9d8a6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

An Enterprise SaaS Platform bridging local water can and jar delivery businesses with local consumers across India. 
Featuring real-time driver dispatching, glassmorphic UI, and complex role-based routing.

</div>

---

## 🏗 System Architecture

```text
+-------------------+       +--------------------+       +-------------------+
|  Frontend (Expo)  |       |  Backend (Node.js) |       |  MongoDB Cluster  |
|                   |       |                    |       |                   |
| - Consumer App    | <===> | - Express API      | <===> | - Users / Roles   |
| - Driver App      |       | - Dispatch Logic   |       | - Orders & Fleet  |
| - Vendor App      |       | - JWT Auth         |       | - Metrics         |
+-------------------+       +--------------------+       +-------------------+
                                      ^
                                      |
                                      v
                            +--------------------+
                            |    AI Scheduler    |
                            |    (node-cron)     |
                            | - Daily Aggregation|
                            | - Token Flushing   |
                            | - Purge Stale Data |
                            +--------------------+
```

## 🚀 Tech Stack

### Frontend Architecture
| Technology | Role | Details |
| :--- | :--- | :--- |
| **React Native** | Core Framework | Built with Expo SDK 52 |
| **Expo Router** | Navigation | File-based routing (`app/(role)/screen.tsx`) |
| **Reanimated 3** | Animations | 60fps native thread animations |
| **Expo Blur & Linear Gradient** | Styling | Premium glassmorphism UI |
| **Lucide React Native** | Iconography | High-quality SVG icons |
| **React Context + Axios** | State & Network | Lightweight API communication |
| **TypeScript** | Type Safety | Strict typing across 99.3% of the codebase |

### Backend & Infrastructure
| Technology | Role | Details |
| :--- | :--- | :--- |
| **Node.js + Express** | Core Server | Configured for 10MB payload support |
| **MongoDB + Mongoose** | Database | Highly scalable document storage |
| **JWT + Bcrypt.js** | Authentication | Secure access and password hashing |
| **node-cron** | Task Runner | Scheduled background loops & AI |
| **express-async-handler** | Error Handling | Clean async controller management |

## 🧠 AI / Intelligence Layer

### Dispatch Optimization Model
Our intelligent dispatch algorithm automatically matches orders to the optimal driver in real-time.

```text
[New Order Created]
       |
       v
[Query Available Drivers]
       |
       v
[Hard Gate: activeDeliveries > 3?]
   |-- (Yes) --> [Reject Driver]
   |
   |-- (No) ---> [Add to Candidate Pool]
                        |
                        v
                [Weighted Sort Candidates]
                1. Fewest active deliveries (Primary)
                2. Highest performance score (Secondary)
                        |
                        v
                [Select Top Driver Candidate]
                        |
                        v
                [Instant Auto-Assign Order]
```

### Background Scheduler
The `ai/scheduler.js` runs silently via `node-cron` to maintain peak system health.

| Task | Frequency | Purpose |
| :--- | :--- | :--- |
| **Metric Aggregation** | Daily | Aggregates daily global delivery success rates |
| **Token Maintenance** | Hourly | Flushes expired JWT tokens to free up DB space |
| **Data Pruning** | Weekly | Purges stale historical metrics using retention windows |
| **Bias Prevention** | Monthly | Truncates legacy anomaly weights to prevent dataset bias |

## 👥 User Roles

JalSaathi offers 3 completely separate UI experiences seamlessly integrated into a single app binary:

1. **Consumer**: Place orders, track delivery live on a map, and manage recurring subscriptions.
2. **Driver**: Receive real-time dispatch alerts, navigate optimized routes, and track daily earnings.
3. **Vendor**: Manage delivery fleets, view business analytics, and monitor revenue flows.

## 📂 Project Structure

```text
JalSaathi/
├── Backend/
│   ├── models/           # Mongoose schemas
│   ├── routes/           # Express API endpoints
│   ├── middleware/       # JWT auth & error handlers
│   ├── ai/
│   │   └── scheduler.js  # node-cron background loops
│   ├── seed.js           # DB seeding script
│   └── server.js         # Entry point
└── Newproject/
    └── app/
        ├── (consumer)/   # Consumer specific screens
        ├── (driver)/     # Driver specific screens
        ├── (vendor)/     # Vendor specific screens
        ├── _layout.tsx   # Expo Router root layout
        └── index.tsx     # Role-based redirection logic
```

## 🛠 Setup & Installation

Follow these steps to run JalSaathi locally.

### Prerequisites
- Node.js (v18+)
- MongoDB instance (local or Atlas)
- Expo CLI (`npm install -g expo-cli`)

### 1. Clone & Configure Environment

```bash
git clone https://github.com/YOUR-USERNAME/JalSaathi.git
cd JalSaathi
```

Create a `.env` file in the `Backend/` directory:
```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/jalsaathi
JWT_SECRET=super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
```

### 2. Run the Backend

```bash
cd Backend
npm install
node seed.js        # Seeds the DB with user roles and mock data
node server.js      # Starts the server on http://localhost:5000
```

### 3. Run the Frontend

```bash
cd ../Newproject
npm install
npx expo start --clear
```
*Press `a` to run on Android emulator, `i` for iOS simulator, or scan the QR code with the Expo Go app.*

## 📡 API Reference

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | No | Register a new user (Consumer/Driver/Vendor) |
| `POST` | `/api/auth/login` | No | Authenticate user and receive JWT |
| `GET` | `/api/orders` | Yes | Get orders (scoped by user role) |
| `POST` | `/api/orders` | Yes | Create a new water delivery order |
| `PATCH` | `/api/orders/:id/status` | Yes | Update order status (Driver/Vendor) |
| `GET` | `/api/fleet` | Yes (Vendor) | View all drivers associated with a vendor |
| `GET` | `/api/analytics` | Yes (Vendor) | Retrieve revenue and performance analytics |

## 🎨 Design Guidelines

JalSaathi follows strict premium UI/UX guidelines to ensure a flawless experience.

| Element | Do | Don't |
| :--- | :--- | :--- |
| **Colors** | Use `theme.background` and `theme.card` from `useColorScheme()` | Hardcode hex colors physically |
| **Backgrounds** | Use layered `expo-linear-gradient` with `expo-blur` (intensity 20-40) | Use flat, solid color backgrounds |
| **Interactivity** | Add `react-native-reanimated` spring or opacity feedback on press | Leave buttons static when tapped |
| **Iconography** | Use consistent, scalable `lucide-react-native` SVG icons | Use text labels or raster PNG icons |
| **Avatars** | Use the `<UserAvatar />` component with gradient fallbacks | Leave blank spaces if PFP is missing |
| **Theming** | Support system-wide seamless Dark Mode switching | Lock the app into light mode only |

## 🤝 Contributing

We welcome community contributions. To get started:

```bash
git checkout -b feature/amazing-feature
git commit -m "feat: Add amazing feature"
git push origin feature/amazing-feature
```

**Pull Request Checklist:**
- [x] Code follows TypeScript strict typing rules.
- [x] UI components pass the Design Guidelines (blur, reanimated, theme support).
- [x] Backend routes include `express-async-handler` wrappers.
- [x] No hard-coded colors or local host IPs.

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

<div align="center">
  <p>Built with 💧 in India</p>
  <p><i>Bringing every drop to every doorstep — intelligently.</i></p>
</div>
