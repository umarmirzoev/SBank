# SomoniBank

# 🏦 SomoniBank — Digital Banking Backend

<p align="center">
  <b>Modern, Secure, Scalable Banking Backend built with ASP.NET Core</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/.NET-9-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/JWT-Auth-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Architecture-Clean-orange?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Status-Production--Ready-brightgreen?style=for-the-badge" />
</p>

---

# 🚀 Overview

**SomoniBank** is a full-featured **digital banking backend system** designed to power mobile and web banking applications.

It goes far beyond CRUD and implements real banking logic:

- Account lifecycle management  
- Secure money transfers  
- Currency exchange  
- Card management  
- Notifications system  
- PIN-based security  
- Role-based access control  
- Audit logging  

---

# 🎯 Project Goals

Build a **real-world banking backend** that is:

- scalable 📈  
- secure 🔐  
- modular 🧩  
- production-ready ⚙️  

---

# 🧱 Architecture

The project follows a **Clean Architecture approach**:


SomoniBank
│
├── API
│ ├── Controllers
│ ├── Middleware
│ └── Program.cs
│
├── Domain
│ ├── Entities
│ ├── Enums
│ └── Core Models
│
└── Infrastructure
├── DbContext
├── Services
├── Configurations
└── Migrations


---

# ⚙️ Tech Stack

| Technology | Purpose |
|----------|--------|
| ASP.NET Core (.NET 9) | Backend API |
| Entity Framework Core | ORM |
| PostgreSQL | Database |
| JWT | Authentication |
| BCrypt | Password & PIN hashing |
| Swagger | API documentation |

---

# 🔐 Security Features

- JWT Authentication  
- Role-based access (User / Admin)  
- PIN protection (hashed)  
- Audit logging  
- Transfer limits  
- Account status validation  

---

# 🧩 Core Features

## 👤 Authentication
- Register / Login
- JWT Token system
- Role management

---

## 💼 Accounts
- Open account
- Types: `Current`, `Savings`, `Deposit`
- Status: `Active`, `Blocked`, `Closed`
- Balance management

---

## 💸 Transfers
- Secure money transfer
- Balance validation
- Status validation
- Database transaction safety
- Audit logging

---

## 🔐 PIN System
- Create PIN
- Verify PIN
- Change PIN
- Secure hashing

---

## 💳 Cards
- Virtual / Physical cards
- Linked to accounts
- Block functionality
- Masked numbers

---

## 💱 Currency Exchange
- Convert between accounts
- Uses real exchange rates
- Full validation

---

## 🔔 Notifications
Triggered on:
- Registration
- Account creation
- Transfers
- Security events

---

## 🛡 Admin Panel (API)
- View users
- View accounts
- View transactions

---

# 📡 API Endpoints

## Auth

POST /api/auth/register
POST /api/auth/login


## Accounts

POST /api/accounts/open
GET /api/accounts/my
PATCH /api/accounts/{id}/block
PATCH /api/accounts/{id}/close


## Transfers

POST /api/transfers
GET /api/transfers/my


## Transactions

GET /api/transactions/recent


## PIN

POST /api/pin/create
POST /api/pin/verify
PATCH /api/pin/change


## Cards

POST /api/cards/create
GET /api/cards/my
PATCH /api/cards/{id}/block


## Exchange

POST /api/exchange/convert
GET /api/exchange/rates


## Notifications

GET /api/notifications/my
PATCH /api/notifications/{id}/read


## Admin

GET /api/admin/users
GET /api/admin/accounts
GET /api/admin/transactions


---

# 🔄 Business Logic Highlights

### Transfers
- Only from user's own account  
- Prevents insufficient balance  
- Prevents invalid account states  
- Fully transactional  

### Accounts
- Unique account number  
- Lifecycle management  
- Validation rules  

### Limits
- Daily transfer limits  
- Per-transaction limits  

---

# 🧪 Testing (Swagger)

After running the app:


http://localhost:PORT/swagger


---

# 🚀 Getting Started

```bash
git clone https://github.com/your-username/somonibank.git
cd somonibank

dotnet restore
dotnet ef database update
dotnet run
📊 Project Status
Module	Status
Authentication	✅ Done
Accounts	✅ Done
Transfers	✅ Done
Cards	✅ Done
Exchange	✅ Done
Notifications	✅ Done
Admin	✅ Done
Frontend	🚧 In Progress
🌍 Future Improvements
Two-factor authentication (SMS / OTP)
Fraud detection system
Scheduled payments
Loan system
Real payment gateway integration
👨‍💻 Author

Umar Mirzoev
Backend Developer (.NET)

⭐ Final Note

This project demonstrates:

real backend architecture
production-level logic
security-first design
scalable system thinking
📄 License

MIT