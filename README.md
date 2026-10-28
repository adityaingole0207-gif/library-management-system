# Library Management System with Database User and Role Administration

A full-stack, beginner-friendly **DBMS College Mini-Project** demonstrating fundamental Database Management System concepts using MongoDB, Express.js, React, and Node.js (MERN stack).

---

## 📌 Project Overview

This system provides a complete library management solution combined with an educational **Database Administration** guide showing how MongoDB implements authentication and Role-Based Access Control (RBAC).

### Key Features
- **Dashboard**: Real-time metrics on total books, members, active circulations, overdue loans, and MongoDB connection status.
- **Books Catalog**: Add, view, edit, search (title, author, ISBN), filter by genre, and delete books with stock tracking.
- **Member Directory**: Register, view, edit, search, and manage student and faculty library memberships.
- **Circulation & Loans**: Issue books to members with due-date tracking, return management with automated overdue detection and fine calculation, and referential protection.
- **Database User & Role Administration**: Dedicated reference guide with one-click copy commands demonstrating how DBAs manage users (`read`, `readWrite`, `dbAdmin`, `userAdmin`), grant/revoke privileges, rotate credentials, and drop accounts in `mongosh`.
- **DBMS Concepts Reference**: Embedded collapsible educational cheat-sheet explaining collections, BSON documents, references, and RBAC.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router v6, Vite, Axios, Custom Responsive CSS
- **Backend**: Node.js, Express.js REST API
- **Database**: MongoDB with Mongoose ODM (v7)
- **Environment**: Configured using `.env` files

---

## 📁 Project Structure

```text
dbms/
├── server/
│   ├── models/
│   │   ├── Book.js          # Book schema & validation
│   │   ├── Member.js        # Member schema & auto ID generator
│   │   └── Loan.js          # Loan schema with book/member references
│   ├── routes/
│   │   ├── books.js         # Books CRUD routes
│   │   ├── members.js       # Members CRUD routes
│   │   ├── loans.js         # Issue, return, and overdue routes
│   │   └── admin.js         # Metrics & db status endpoint
│   ├── server.js            # Express server entry point
│   ├── seed.js              # Sample database seeder script
│   ├── package.json
│   ├── .env.example
│   └── .env
└── client/
    ├── src/
    │   ├── components/      # Sidebar, Modal, ConfirmDialog, ConceptsPanel
    │   ├── context/         # Toast notifications context
    │   ├── pages/           # Dashboard, Books, Members, Loans, Admin, About
    │   ├── services/        # Axios API service layer
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18.x or later installed)
- **MongoDB Community Server** installed and running locally on port 27017 (or a MongoDB Atlas connection URI)
- **mongosh** (MongoDB Shell, optional for running DBA commands)

Verify MongoDB service is running:
```powershell
# On Windows, verify MongoDB service
Get-Service MongoDB
```

---

### 2. Backend Setup

1. Open a terminal in the `server` folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/library_management
   PORT=5000
   NODE_ENV=development
   ```
4. Seed the database with sample books, members, and loans:
   ```bash
   npm run seed
   ```
5. Start the backend server:
   ```bash
   npm start
   ```
   The backend will start at: `http://localhost:5000`

---

### 3. Frontend Setup

1. Open a separate terminal in the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🛡️ Database User & Role Administration Guide

In MongoDB, access control is managed via Role-Based Access Control (RBAC). The following commands can be demonstrated during your project viva using `mongosh`:

### 1. Connect to MongoDB as Root Administrator
```javascript
mongosh "mongodb://adminUsername:<admin_password>@localhost:27017/admin?authSource=admin"
```

### 2. Switch to the Project Database
```javascript
use library_management
```

### 3. Create Application User (Principle of Least Privilege)
Create an application user dedicated to the Node.js backend with `readWrite` access:
```javascript
db.createUser({
  user: "library_app_user",
  pwd: "<strong_app_password_placeholder>",
  roles: [
    { role: "readWrite", db: "library_management" }
  ]
})
```

### 4. Create an Audit / Read-Only User
```javascript
db.createUser({
  user: "library_reporter",
  pwd: "<reporter_password_placeholder>",
  roles: [
    { role: "read", db: "library_management" }
  ]
})
```

### 5. Grant Administrative Role
```javascript
db.grantRolesToUser(
  "library_reporter",
  [ { role: "dbAdmin", db: "library_management" } ]
)
```

### 6. Revoke a Role
```javascript
db.revokeRolesFromUser(
  "library_reporter",
  [ { role: "dbAdmin", db: "library_management" } ]
)
```

### 7. Change User Password
```javascript
db.changeUserPassword(
  "library_app_user",
  "<new_secure_password_placeholder>"
)
```

### 8. Drop / Delete User
```javascript
db.dropUser("library_reporter")
```

---

## 🎓 DBMS Evaluation Points for Viva

- **Document Model vs Relational Model**: Demonstrates schema flexibility while using Mongoose to enforce type contracts, required fields, and unique indexes (e.g. ISBN and Email).
- **Referential Integrity**: Implemented using normalized Mongoose `ObjectId` references from `Loan` to `Book` and `Member`. Deletion guards prevent deleting a book or member who has active unreturned loans.
- **Business Logic in Database Hooks**: Pre-save middleware automatically generates human-readable Membership IDs (`LIB00001`), clamps inventory quantities, and handles timestamps.
- **Database Security**: Explains how separating application credentials (`readWrite`) from root credentials prevents server compromise and complies with database administration standards.
