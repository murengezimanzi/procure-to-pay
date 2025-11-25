# procure-to-pay
> An advanced, containerized full-stack application for automating corporate procurement. Features **Role-Based Access Control (RBAC)**, **Multi-Level Approval Workflows**, **AI-based Invoice Data Extraction**, and **Automated PDF Purchase Order Generation**.

## Table of Contents

- [Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture--workflow)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation--setup)
- [User Setup](#-user-roles--credentials)
- [API Documentation](#-api-documentation)


## Key Features

### Role-Based Access Control (RBAC)
Strict permission handling ensures security and governance across the organization:

- **Staff**: Create purchase requests, upload proforma invoices, upload receipts
- **Approver L1**: Review pending requests, approve or reject at the first level
- **Approver L2**: Final approval authority; triggers automated PO generation
- **Finance**: Read-only access to finalized Purchase Orders and audit trails

### AI Document Processing
- **Smart Extraction**: Automatically scans uploaded Proforma Invoices (PDF/Images) to extract vendor names, line items, and total amounts
- **Reduced Manual Entry**: Minimizes data entry errors and accelerates the request process
- *Note: Currently implemented via a modular Service Layer with simulation logic for demonstration stability*

### Automated PO Generation
- Upon final approval (Level 2), the system automatically generates a professional, downloadable PDF Purchase Order using **ReportLab**
- Automatically links the generated PO to the request record for easy tracking

### Receipt Validation
- Staff can upload receipts post-purchase for verification
- The system automatically compares the receipt total against the authorized PO amount
- Flags discrepancies for manual review and audit purposes

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Backend** | Python 3.11, Django 5, Django REST Framework (DRF) |
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons |
| **Database** | PostgreSQL 15 (Dockerized) |
| **DevOps** | Docker, Docker Compose, Gunicorn, Nginx |
| **Authentication** | JWT (SimpleJWT) with Custom Claims |
| **PDF Generation** | ReportLab |
| **Image Processing** | PyCairo, Pillow |
| **API Documentation** | Drf-yasg (Swagger/Redoc) |

## Architecture & Workflow

```
┌─────────────┐
│ Staff User  │
└──────┬──────┘
       │
       ├─→ Upload Proforma Invoice
       │
       ↓
┌──────────────────────┐
│ AI Extraction Service│ (Extract: Vendor, Items, Amount)
└──────┬───────────────┘
       │
       ↓
┌─────────────────────────┐
│ Purchase Request Created│ (Status: PENDING)
└──────┬──────────────────┘
       │
       ↓
  ┌────────────────┐
  │ Approver L1    │
  │ Review & Vote  │
  └────┬───────┬──┘
       │       │
    Reject  Approve
       │       │
       ↓       ↓
   REJECTED  ┌──────────────┐
             │ Approver L2  │
             │ Final Review │
             └────┬───────┬─┘
                  │       │
               Reject  Approve
                  │       │
                  ↓       ↓
              REJECTED  ┌────────────────────┐
                        │ PDF Generator      │
                        │ Service            │
                        └────┬───────────────┘
                             │
                             ↓
                        ┌──────────────┐
                        │ PO Generated │
                        │ & Saved      │
                        └────┬─────────┘
                             │
                             ↓
                        ┌──────────────┐
                        │ Finance Team │
                        │ View/Download│
                        └──────────────┘
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (v20.10+)
- **Docker Compose** (v1.29+)
- **Git**

To verify your installations:

```bash
docker --version
docker compose --version
```

## ⚡️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/procure-to-pay.git
cd procure-to-pay
```

### 2. Build and Start Services

Build and start all containers (this may take a few minutes on first run):

```bash
docker compose up --build
```

Once running, services are available at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Swagger Documentation**: http://localhost:8000/swagger/

### 3. Initialize the Database

Open a new terminal and run the following commands:

```bash
# Apply database migrations
docker compose exec web python manage.py migrate

# Create a superuser account for Django admin
docker compose exec web python manage.py createsuperuser
```

Follow the prompts to create your admin credentials (e.g., username: `admin`, password: `yourpassword`).

## User Roles & Credentials

The system uses four distinct roles, each with specific permissions. Create these test users through the Django Admin Panel:

1. Navigate to **Django Admin**: http://localhost:8000/admin/
2. Login with your superuser credentials
3. Go to **Users** → **Add User**
4. Create users and assign roles as shown below:

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| alice | password123 | STAFF | Can create & view own requests |
| bob | password123 | APPROVER_L1 | Approves requests at Level 1 |
| charlie | password123 | APPROVER_L2 | Final approver; triggers PO generation |
| finance | password123 | FINANCE | Read-only access to approved POs |

**Important**: After creating each user, scroll to the bottom of their profile page and select the appropriate **Role** from the dropdown menu.

##  User Guide (How to Test)

Follow this workflow to test the complete P2P process:

### Step 1: Create a Purchase Request (Staff User)

1. Login to http://localhost:3000 as **alice** (password: `password123`)
2. Click **"New Request"** button
3. Upload a Proforma Invoice (PDF or Image file)
4. **Observation**: Watch the AI Document Analysis extract key information automatically
5. Review the extracted vendor name, line items, and estimated amount
6. Click **"Submit Request"**

### Step 2: Level 1 Approval

1. Logout and login as **bob** (password: `password123`)
2. View the dashboard—you'll see Alice's pending request
3. Click the request to view details
4. Review the procurement details
5. Click **"Approve"** button
6. **Result**: Request status changes to "**Level 1 Approved**"

### Step 3: Level 2 Approval & PO Generation

1. Logout and login as **charlie** (password: `password123`)
2. Navigate to the approved request from Level 1
3. Review all details
4. Click **"Approve"** button
5. **Result**: Status updates to "**APPROVED**" and the system generates a PDF Purchase Order in the background

### Step 4: Download the Purchase Order

1. A green **"Generated PO"** button now appears on the request
2. Click it to download the professionally formatted PDF Purchase Order
3. The PDF contains all purchase details and is ready for record-keeping

### Step 5: View as Finance (Optional)

1. Logout and login as **finance** (password: `password123`)
2. View approved purchase orders in read-only mode
3. Access audit trails and historical records

## API Documentation

The backend includes fully interactive Swagger documentation.
### Access Documentation

- **Swagger UI**: http://localhost:8000/swagger/
  