# ⚡ SwapKr

<div align="center">

![SwapKr Logo](https://swapkr.tech/logo.png)

### The Ultimate Campus Marketplace

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://swapkr.tech)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)

</div>

---

## 🚀 About SwapKr

**SwapKr** is a dynamic, student-centric marketplace designed to simplify buying, selling, swapping, and requesting items within a campus environment. Whether you need a scientific calculator for an exam, want to sell your old bicycle, or are desperately looking for a charger, SwapKr connects you with peers instantly.

**Live URL:** [https://swapkr.tech](https://swapkr.tech)

## ✨ Key Features

- **🛍️ Buy & Sell**: List items for sale with images, descriptions, and categories.
- **🔄 Item Requests**: Post requests for items you need.
  - **✨ Normal Request**: Standard visibility.
  - **🔥 Urgent Request**: Blasts an email notification to all users (costs 1 Token).
- **💬 Real-time Chat**: Negotiate deals instantly with built-in WebSocket-based chat.
- **📱 Mobile Optimized**: Fully responsive design with a mobile-first sidebar and chat interface.
- **🔔 Smart Notifications**: Get alerted for new messages, request matches, and status updates.
- **🔍 Powerful Search**: Find items and requests easily with global search and category filters.
- **📂 Organized Categories**: Browse by **Hardware**, Daily Use, Academics, Sports, and Others.

## 🛠️ Tech Stack

### Frontend

- **Framework**: React (Vite)
- **Styling**: Tailwind CSS, Shadcn UI
- **Animations**: Framer Motion
- **State Management**: React Query (TanStack Query)
- **Icons**: Lucide React

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Caching & Queues**: Redis (ioredis)
- **Real-time**: Socket.io
- **Email**: Nodemailer

### Infrastructure

- **Frontend Deployment**: [Vercel](https://vercel.com)
- **Backend Deployment**: [DigitalOcean](https://www.digitalocean.com)
- **Database**: PostgreSQL (Hosted on DigitalOcean or similar managed service)
- **Redis**: [Redis Cloud](https://redis.io/cloud)
- **Domain**: [swapkr.tech](https://swapkr.tech)

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

- Node.js (v18+)
- PostgreSQL
- Redis (for background jobs)

### Installation

1.  **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/swapkr.git
    cd swapkr
    ```

2.  **Install Dependencies**

    ```bash
    # Install backend dependencies
    cd backend
    npm install

    # Install client dependencies
    cd ../client
    npm install
    ```

3.  **Environment Setup**
    - Copy `.env.example` to `.env` in both `backend` and `client` directories.
    - Fill in your PostgreSQL credentials, Redis URL, and JWT secrets.

4.  **Run the Application**

    You will need three terminals:

    **Terminal 1: Backend Server**

    ```bash
    cd backend
    npm run server
    ```

    **Terminal 2: Worker (for Emails)**

    ```bash
    cd backend
    npm run worker
    ```

    **Terminal 3: Frontend Client**

    ```bash
    cd client
    npm run dev
    ```

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  Built with ❤️ for Campus Communities
</div>
