# CampusConnect API Contract

## Overview
This document specifies the REST API endpoints, payload structures, authentication requirements, and security rules for the CampusConnect Infrastructure Issue Tracking platform.

---

## Endpoints Specification

### 1. Public Statistics
- **GET** `/api/public/stats`
- **Auth**: Public
- **Response** `(200 OK)`:
  ```json
  {
    "totalComplaints": 42,
    "resolvedComplaints": 35,
    "inProgressComplaints": 5,
    "pendingComplaints": 2,
    "deduplicationRate": 98.4,
    "avgResponseHours": 4.2
  }
  ```

### 2. File Complaint (Student)
- **POST** `/api/complaints`
- **Auth**: Required (`Student`)
- **Request Body**:
  ```json
  {
    "title": "A3 Building - Floor 1 Washroom Plumbing Leak",
    "description": "Water leaking near washbasin on floor 1.",
    "categoryId": "cat-uuid",
    "locationPath": "Academic Blocks > A3 Building > Floor 1 > Gents Washroom",
    "issueTag": "plumbing-leak"
  }
  ```

### 3. My Complaints (Student)
- **GET** `/api/complaints/my`
- **Auth**: Required (`Student`)
- **Response** `(200 OK)`: Array of `ComplaintResponse`

### 4. Upvote Complaint (Student)
- **POST** `/api/complaints/:id/upvote`
- **Auth**: Required (`Student`)
- **Response** `(200 OK)`: Updated upvote count & priority score

### 5. Admin Domain Complaints Queue
- **GET** `/api/admin/complaints`
- **Auth**: Required (`Admin`)
- **Response** `(200 OK)`: Array of complaints matching admin's domain role

### 6. Update Complaint Status (Admin)
- **PATCH** `/api/admin/complaints/:id/status`
- **Auth**: Required (`Admin`)
- **Request Body**:
  ```json
  {
    "status": "IN_PROGRESS",
    "adminNote": "Maintenance team dispatched."
  }
  ```

### 7. Export Complaints Report (Excel)
- **GET** `/api/admin/reports/export-complaints`
- **Auth**: Required (`Admin`)
- **Response**: Binary `.xlsx` spreadsheet file
