# 🏥 OPD Token Allocation Engine

A backend system to manage **hospital OPD token allocation** with **priority handling**, **elastic slot capacity**, **emergency overrides**, **waitlisting**, and **real‑world event simulation**.

This project models real hospital workflows including **walk‑ins, online bookings, paid priority patients, follow‑ups, emergencies, cancellations, and no‑shows**.

---

## 🚀 Features

* ⏰ Fixed OPD slots with hard capacity limits
* 🎟️ Priority‑based token allocation
* 🚑 Emergency override (overbooking allowed)
* 🧾 Waitlist with automatic promotion
* ❌ Cancellation & no‑show handling
* 🔁 Dynamic reallocation
* 🧪 OPD day simulation (stress test)
* 🧪 Automated tests using Jest
* 🌐 RESTful APIs (Node.js + Express)
* 🗄️ MongoDB with Mongoose

---

## 🧠 Core Design Principles

* Business logic isolated in services
* Controllers are thin
* Single allocation engine reused everywhere
* Explicit handling of real‑world edge cases
* Readable, interview‑friendly architecture

---

## 🏗️ High‑Level Architecture

```
Frontend (Lovable UI – planned)
        |
        v
REST APIs (HTTP)
        |
        v
Express API Layer (Controllers)
        |
        v
Allocation Engine Service (Core Business Logic)
  - Slot capacity checks
  - Priority comparison
  - Emergency override
  - Waitlist handling
  - Auto reallocation
        |
        v
MongoDB
  - Doctors
  - Slots
  - Tokens
```

> **Note:** The same allocation engine is reused by booking APIs, cancellation logic, emergency handling, and the simulation engine.

---

## 📦 Tech Stack

| Layer              | Technology       |
| ------------------ | ---------------- |
| Backend            | Node.js, Express |
| Database           | MongoDB          |
| ODM                | Mongoose         |
| Testing            | Jest             |
| Time Utils         | Day.js           |
| API Testing        | Postman          |
| Frontend (planned) | Lovable          |

---

## 🗂️ Project Structure

```
opd-token-engine/
│
├── src/
│   ├── models/
│   │   ├── Doctor.js
│   │   ├── Slot.js
│   │   └── Token.js
│   │
│   ├── services/
│   │   ├── allocationService.js
│   │   └── simulationService.js
│   │
│   ├── controllers/
│   │   ├── tokenController.js
│   │   ├── doctorController.js
│   │   ├── slotController.js
│   │   └── simulationController.js
│   │
│   ├── routes/
│   │   ├── tokenRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── slotRoutes.js
│   │   └── simulationRoutes.js
│   │
│   ├── config/db.js
│   ├── app.js
│   └── server.js
│
├── tests/
│   └── allocation.test.js
│
├── .env
├── package.json
└── README.md
```

---

## 🎯 Token Prioritization Rules

| Source    | Priority | Behavior                       |
| --------- | -------- | ------------------------------ |
| EMERGENCY | 1        | Always allocated, may overbook |
| PAID      | 2        | High priority                  |
| FOLLOWUP  | 3        | Medium                         |
| ONLINE    | 4        | Normal                         |
| WALKIN    | 5        | Lowest                         |

**Important Design Decision**

Emergency is treated as an **override**, not just a higher priority. It bypasses capacity checks and is handled in a separate code path.

---

## 🔄 Allocation Algorithm (Simplified)

```
If token is EMERGENCY:
    Allocate immediately (OVERBOOK slot if needed)

Else if slot has free capacity:
    Allocate token

Else:
    Compare with lowest-priority booked token
    If new token has higher priority:
        Bump lower-priority token
        Allocate new token
    Else:
        Add token to WAITLIST
```

---

## 🔁 Dynamic Event Handling

### Cancellation / No‑Show

* Cancelled token frees the slot
* Highest‑priority waitlisted token is auto‑promoted

### Emergency

* Slot may exceed capacity
* Slot marked as **OVERBOOKED**

---

## 🧪 OPD Day Simulation

**Endpoint**

```
POST /simulate/day
```

**What it does**

* Creates 3 doctors
* Creates slots for the full OPD window
* Performs random bookings
* Injects emergency insertions
* Randomly cancels some tokens
* Returns a summary

**Example Response**

```json
{
  "doctors": 3,
  "slotsCreated": 9,
  "tokensBooked": 12,
  "emergencies": 2,
  "cancellations": 3,
  "waitlistedRemaining": 1
}
```

---

## 🧪 Automated Testing (Jest)

**Key scenarios covered**

* Allocation when slot has capacity
* Waitlisting when slot is full
* Cancellation with auto reallocation

**Run tests**

```bash
npm test
```

---

## 🌐 API Overview

### Doctors

```
POST /doctors
GET  /doctors
```

### Slots

```
POST /slots
GET  /slots?doctorId=<id>
```

### Tokens

```
POST /tokens/book
POST /tokens/cancel/:tokenId
```

### Simulation

```
POST /simulate/day
```
