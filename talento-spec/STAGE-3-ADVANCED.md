# Stage 3 — Advanced (Deferred)

**Build only if the commercial case is proven.** Everything here is high-effort and low-certainty-of-ROI. The Stage 1 marketplace + Stage 2 auctions can function as a complete product without any of this. Most of it becomes valuable only at a scale the platform may never reach. Don't pre-pay that complexity.

This doc is a design sketch, not an implementation spec. When any of these features is green-lit, the spec for it will be expanded into its own file.

---

## What's in Stage 3

From the brief:

1. **Talento Identity Key (TIK)** — cryptographically generated identifier per talent
2. **Supplier Code** — per-buyer suffix
3. **Single-Use License Tokens** — one per discrete licensed use, signed, expiring
4. **Verification API** — external buyers call to check a token before each generation
5. **Verification Gateway stub** — the pluggable hook for a future external authority
6. **Audit Ledger** — immutable log of every authorization event
7. **Affiliate / referral revenue split**
8. **Payment processing** (Stripe Connect for payouts)
9. **External buyer (Supplier Partner) self-service onboarding + API key management**

---

## A. Should any of this happen at all?

Ask before starting:

1. Has a studio or brand partner asked (unprompted) for programmatic API access?
2. Has a talent complained unprompted that they can't see where their likeness is being used?
3. Is there a concrete revenue forecast that depends on per-use token fees, not transaction commission?

If the answer to all three is no, stop. The brief's "Getty for faces" pitch is compelling but it's a B2B infrastructure pitch — it only monetises after there's a catalogue of talent and a queue of API-hungry buyers. Until then, a browse-and-book marketplace with manual licensing through email/contract is enough.

If the answer to any is yes, read on.

---

## B. TIK — Talento Identity Key

**Format:** `TL-KX72F-P49R-883` (per the brief: prefix + 3 grouped alphanumeric chunks)

**Properties the brief implies:**

- Unique per person
- Permanent (can't be revoked)
- Cryptographically tied to the talent's identity

**Pragmatic implementation:**

```ts
// lib/tik.ts
import { randomBytes, createHmac } from "crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Crockford-ish, no O/0/I/1

function randomGroup(len: number) {
  const bytes = randomBytes(len);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export function generateTik(): string {
  // Format: TL-{5}-{4}-{3}
  return `TL-${randomGroup(5)}-${randomGroup(4)}-${randomGroup(3)}`;
}

export function signTikPayload(tik: string, payload: object): string {
  // HMAC-SHA256 over the canonical JSON, using a server-only secret
  const key = process.env.TIK_SIGNING_SECRET!;
  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  return createHmac("sha256", key).update(`${tik}.${canonical}`).digest("hex");
}
```

**When issued:** on `talent_profiles.published = true` transition (server action), or on first onboarding completion — either works. Must be unique; retry on collision (DB unique constraint catches it).

**Important caveat:** "cryptographically generated" in the brief is marketing language; what actually matters is:

- Uniqueness (Postgres unique index + random alphabet)
- Unforgeability of downstream tokens that reference the TIK (HMAC)
- Server-only knowledge of the signing secret

The TIK itself is a public identifier — anyone can quote yours. What makes the system cryptographic is the HMAC on license tokens, not the TIK string.

---

## C. Supplier codes

**Format:** `SUP0042` (zero-padded, monotonically increasing)

Assign on studio/brand verification. The full tracked key becomes `{TIK}-{SUPPLIER}`. Store supplier codes on `studio_profiles.supplier_code` (column already exists in the Stage 1 schema, nullable).

```sql
-- Sequence for supplier codes
create sequence supplier_code_seq start 1;

-- On studio verification (admin action):
update public.studio_profiles
   set supplier_code = 'SUP' || lpad(nextval('supplier_code_seq')::text, 4, '0')
 where id = $1;
```

---

## D. Single-use license tokens

**Format:** `TL-{TIK}-{SUP}-{UUID}-{EXPIRY}` — signed with HMAC.

### Issuance flow

1. Studio purchases a license (scope: use case, duration, geography)
2. Server creates a row in `license_tokens` with:
   - `token_id` (uuid)
   - `talent_id`, `studio_id`
   - `scope` (jsonb: use_case, duration, geography, etc.)
   - `issued_at`, `expires_at`
   - `max_uses` (often 1, hence "single-use")
   - `signature` (HMAC over `talent_id|studio_id|token_id|expires_at|scope_hash`)
3. Token string returned to studio: base64-encoded JSON of `{ token_id, signature }`

### Verification flow

External buyer calls `POST /api/v1/verify` with the token. Server:

1. Decodes token
2. Looks up the row by `token_id`
3. Recomputes the signature — if mismatch, return 401
4. Checks `expires_at`, `max_uses` — if exceeded, return 403
5. Logs the check to `audit_logs` atomically with an `update ... returning` that increments `use_count`
6. Returns `200 { authorized: true, talent_tik, scope }`

### Sketch schema

```sql
create table public.license_tokens (
  id uuid primary key default gen_random_uuid(),
  talent_id uuid not null references public.talent_profiles(id),
  studio_id uuid not null references public.studio_profiles(id),
  scope jsonb not null,
  issued_at timestamptz default now(),
  expires_at timestamptz not null,
  max_uses int default 1,
  use_count int default 0,
  signature text not null,  -- hex HMAC
  revoked_at timestamptz
);

create table public.verification_events (
  id uuid primary key default gen_random_uuid(),
  token_id uuid references public.license_tokens(id),
  result text not null,  -- 'authorized' | 'expired' | 'exhausted' | 'invalid_signature'
  ip inet,
  user_agent text,
  metadata jsonb,
  created_at timestamptz default now()
);
```

---

## E. Verification Gateway

Per the brief: "a single integration point — the Verification Gateway — that can accept authorization signals from any external master authority in the future."

In practice this is a small abstraction layer inside the verification route:

```ts
// lib/verification-gateway.ts
export interface VerificationBackend {
  verify(token: string): Promise<VerifyResult>;
}

// Today:
class TalentoInternalBackend implements VerificationBackend {
  /* ... */
}

// Tomorrow (if and when a standard emerges):
class ExternalAuthorityBackend implements VerificationBackend {
  /* ... */
}

export const gateway: VerificationBackend =
  process.env.VERIFICATION_BACKEND === "external"
    ? new ExternalAuthorityBackend()
    : new TalentoInternalBackend();
```

That's it. The "gateway" is one interface, one env flag, two implementations (one of which is empty). No rebuild required to switch — exactly as the brief asks.

---

## F. Audit ledger

The `audit_logs` table already exists in the Stage 1 schema. In Stage 3 it fills up.

**Immutability:** Postgres doesn't do immutable tables natively. Options:

1. **Good enough:** revoke UPDATE and DELETE privileges on the table for everyone. Only inserts. Service role can technically still break it, but it's operationally disciplined.
2. **Better:** append-only via a trigger that rejects updates/deletes.
3. **Paranoid:** daily snapshot hash published to a public write-once location (S3 with object lock, or notarise to a timestamping service). Over-engineered for Talento's scale.

Go with option 2 in Stage 3:

```sql
create or replace function public.audit_logs_no_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'audit_logs is append-only';
end;
$$;

create trigger audit_logs_block_update before update on public.audit_logs
  for each row execute function public.audit_logs_no_mutation();
create trigger audit_logs_block_delete before delete on public.audit_logs
  for each row execute function public.audit_logs_no_mutation();

-- Revoke from anon/authenticated
revoke insert, update, delete on public.audit_logs from anon, authenticated;
-- Service role inserts via supabaseAdmin only
```

**Talent-facing view:** a `/talent/dashboard/usage` page that queries `verification_events` joined through `license_tokens` filtered by their `talent_id`. Shows: date, studio, scope, result.

---

## G. Affiliate / referral system

Each talent gets a referral code on signup: `TL-REF-{username}-{hash}`. Stored on `talent_profiles.referral_code`.

When someone signs up via `?ref=TL-REF-...`:

- On their profile row, store `referred_by_id`
- For the first 12 months of the new talent's earnings, `referred_by_id` gets X% of platform commission

This is pure accounting logic, no infrastructure challenge. Defer until there are actual transactions to split.

---

## H. Payments (Stripe Connect)

For platform payouts to talent:

- Stripe Connect Express accounts per talent
- Studio pays platform → platform takes commission → remainder to talent's Connect account
- Scheduled daily payouts

This is a full separate spec. Budget 3–4 weeks when the time comes.

---

## I. Supplier Partner portal

A separate signup funnel for brands/developers who want API-only access (no UI browsing). Generates API keys, provides sandbox environment, docs, webhook configuration.

Build as a subdomain or `/partners/*` route tree. Uses the same `studio_profiles` table with a `is_api_partner = true` flag.

---

## Rolling question: should Talento build the TIK system, or partner?

The brief frames Talento owning the identity layer as a moat. That moat is real but expensive.

Before committing to building A–E above, seriously consider:

- **SAG-AFTRA's AI provisions** — there may be emerging industry standards that supersede a proprietary TIK
- **C2PA (Content Credentials) / coalition for content provenance** — already has cryptographic provenance for media, could be repurposed for likeness authorization
- **Ethereum/Solana decentralised ID standards** — overkill but exist

Building a proprietary TIK is defensible if Talento ships first and becomes the de facto standard. It's a waste if an industry consortium publishes an open standard six months later.

Decision point: **revisit this section only after Talento has ≥1,000 published talent and ≥5 paying studio clients.** Until then, don't build it.

---

## Definition of Done for Stage 3

There isn't one. Stage 3 is a collection of features, each with its own spec when green-lit. Treat the items above as a menu, not a sprint.

---

## Wrap-up list (small follow-ups on already-shipped features)

Cheap, obvious polish items that don't justify their own stage. Pick off whenever convenient.

- **Email notifications** — send transactional emails (via Resend or Postmark) for `invite_received`, `message_received`, `invite_accepted/declined`, `profile_saved`. Respect a per-user "email frequency" setting (instant / daily digest / off). Suppress email if the user was active in the last N minutes (they'll see the in-app toast).
- **Push notifications (web)** — Web Push subscription on talent + studio dashboards; mirror the same event set as email.
- **Typing indicator + read-receipt timestamp** in message threads (we already record `read_at`).
- **Message search** across a user's inbox.
- **Attachments in messages** — image/PDF upload, reuse the signed-URL pattern.
- **Archive conversations** (soft-hide without deleting history).
- **Report user** flow (separate from block — routes to moderation queue).
- **Moderation dashboard** — view reports, suspend accounts, audit blocks/unblocks.
- **Notification digest email** — one daily summary for users who chose that cadence.
- **Export my data / delete my account** — GDPR-compliant data dump + cascade delete flow.
