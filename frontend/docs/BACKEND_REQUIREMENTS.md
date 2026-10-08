# CampusConnect — Backend Technical Requirements

## Overview
This document specifies the core business logic, validation rules, security guarantees, and priority score formulas for the CampusConnect Infrastructure Issue Tracking backend.

---

## 1. Domain-Based Access Control

Admins are scoped by role (`ADMIN_WIFI`, `ADMIN_MAINTENANCE`, `ADMIN_MESS`, `ADMIN_ACADEMIC`, `SUPER_ADMIN`).
- `SUPER_ADMIN` has global read and update permissions.
- Domain admins receive complaints relevant to their specific category tree.

---

## 2. Dynamic Priority Score Formula

$$\text{PriorityScore} = (\text{Upvotes} \times 1.5) + \text{BaseWeight}$$

- Upvotes dynamically escalate ticket priority in real-time.
- Tickets with `upvoteCount >= 15` are automatically flagged as `highPriority = true`.

---

## 3. Automated Deduplication Check

Before creating a new complaint ticket:
- Check for existing open complaints (`PENDING`, `APPROVED`, `IN_PROGRESS`) with matching `locationPath` and `issueTag`.
- If an active duplicate exists, auto-upvote the existing ticket instead of creating noise.

---

## 4. File Storage & Upload Constraints

1. Supported Formats: `image/jpeg`, `image/png`, `image/webp`.
2. Max File Size: 10 MB per upload.
