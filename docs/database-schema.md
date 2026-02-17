# Joyfit MVP Database Schema

**Platform:** Weight-loss challenge  
**Database:** PostgreSQL  
**Scale target:** 10k+ users

---

## Entity Relationship Overview

```
users ──┬──< weigh_ins
        ├──< subscriptions
        ├──< commissions (as referrer)
        └── inviter_id ──> users (self-ref)
```

---

## Tables

### 1. `users`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK, default gen_random_uuid() | |
| phone | VARCHAR(20) | NOT NULL, UNIQUE | Primary identifier |
| facebook_username | VARCHAR(100) | NULLABLE | |
| inviter_id | UUID | FK → users(id), NULLABLE | One inviter per user |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | |
| updated_at | TIMESTAMPTZ | NOT NULL, default now() | |

**Business rules:** Each user has at most one inviter. Enforce via application logic (or CHECK if needed).

---

### 2. `weigh_ins`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK, default gen_random_uuid() | |
| user_id | UUID | FK → users(id), NOT NULL | |
| weight_kg | DECIMAL(5,2) | NOT NULL | e.g. 75.50 |
| image_url | VARCHAR(500) | NOT NULL | S3/Cloud path |
| recorded_at | DATE | NOT NULL | Weigh-in date |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | |

**Unique constraint:** `(user_id, recorded_at)` — one weigh-in per user per day (weekly = one per week; adjust if you want multiple per week).

**Index:** `(user_id, recorded_at DESC)` for leaderboard and history queries.

---

### 3. `subscriptions`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK, default gen_random_uuid() | |
| user_id | UUID | FK → users(id), NOT NULL | |
| plan_type | VARCHAR(20) | NOT NULL | '1_month' \| '3_months' |
| status | VARCHAR(20) | NOT NULL | 'active' \| 'expired' \| 'cancelled' |
| invited | BOOLEAN | NOT NULL, default false | Had inviter at purchase |
| started_at | TIMESTAMPTZ | NOT NULL | |
| expires_at | TIMESTAMPTZ | NOT NULL | |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | |

**Index:** `(user_id, status)`, `(status, expires_at)` for active subscription lookups.

---

### 4. `commissions`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK, default gen_random_uuid() | |
| referrer_id | UUID | FK → users(id), NOT NULL | Inviter who earns |
| subscription_id | UUID | FK → subscriptions(id), NOT NULL | Source subscription |
| amount | DECIMAL(10,2) | NOT NULL | Commission amount |
| status | VARCHAR(20) | NOT NULL | 'pending' \| 'paid' |
| created_at | TIMESTAMPTZ | NOT NULL, default now() | |

**Unique constraint:** `(subscription_id)` — one commission record per subscription (commission per active subscription).

**Index:** `(referrer_id, status)` for balance and payout queries.

---

## Relationships

| From | To | Type | Notes |
|------|-----|------|-------|
| users.inviter_id | users.id | Many-to-one | Self-reference |
| weigh_ins.user_id | users.id | Many-to-one | |
| subscriptions.user_id | users.id | Many-to-one | |
| commissions.referrer_id | users.id | Many-to-one | |
| commissions.subscription_id | subscriptions.id | One-to-one | One commission per subscription |

---

## Index Recommendations

| Table | Index | Purpose |
|-------|-------|---------|
| users | `UNIQUE(phone)` | Login / lookup |
| users | `(inviter_id)` | Referral tree queries |
| weigh_ins | `(user_id, recorded_at DESC)` | User history, leaderboard |
| weigh_ins | `(recorded_at)` | Period-based leaderboard |
| subscriptions | `(user_id, status)` | Active subscription per user |
| subscriptions | `(status, expires_at)` | Expiry / cron jobs |
| commissions | `(referrer_id, status)` | Balance, payout list |

---

## Derived Data (No Extra Tables)

| Concept | Source | Notes |
|--------|--------|-------|
| Referral count | `COUNT(*) FROM users WHERE inviter_id = ?` | Index on `inviter_id` |
| Commission balance | `SUM(amount) FROM commissions WHERE referrer_id = ? AND status = 'pending'` | |
| Leaderboard | `weigh_ins` | See below |

---

## Leaderboard Logic

**Weight loss %:** `(start_weight - end_weight) / start_weight * 100`

**Periods:**
- **Weekly:** Start weight = last weigh-in before period start; end weight = last weigh-in in period.
- **Monthly:** Same idea over 30 days.

**Implementation:** Use `weigh_ins` with `(user_id, recorded_at)`. For each period, compute per user:
- `start_weight`: latest `weight_kg` with `recorded_at < period_start`
- `end_weight`: latest `weight_kg` with `recorded_at <= period_end`
- Rank by `(start_weight - end_weight) / start_weight DESC`.

For 10k users, consider:
- Caching leaderboard (e.g. Redis, materialized view, or cron-updated table).
- Index `(recorded_at, user_id)` for range scans.

---

## Future Extensibility Notes

| Need | Approach |
|------|----------|
| Multiple challenges/campaigns | Add `challenge_id` to `weigh_ins` and/or `subscriptions`; `challenges` table |
| Payment provider (Stripe, etc.) | Add `payment_id`, `provider` to `subscriptions` or separate `payments` table |
| Commission tiers | Add `commission_rate` or `tier` to `users` or config table |
| Notifications | `user_preferences` or `notification_log` table |
| Audit trail | `audit_log` table (user_id, action, payload, created_at) |
| Soft delete | Add `deleted_at` to `users` |

---

## SQL Snippets (Reference)

```sql
-- Active subscription check
SELECT * FROM subscriptions 
WHERE user_id = $1 AND status = 'active' AND expires_at > now();

-- Referral count
SELECT COUNT(*) FROM users WHERE inviter_id = $1;

-- Commission balance
SELECT COALESCE(SUM(amount), 0) FROM commissions 
WHERE referrer_id = $1 AND status = 'pending';
```
