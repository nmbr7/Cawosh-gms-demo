## Vehicle Health Check (VHC) — Feature Spec

This section documents the end-to-end design for the Vehicle Health Check feature: goals, data model, APIs, scoring, UX, and acceptance criteria.

### 1. Goals

- Provide a technician-friendly checklist to assess vehicle condition, generate a weighted health score, and attach results to bookings/vehicles.
- Support standalone checks from left navigation and auto-created checks when specific services are completed.
- Ensure consistent scoring (aligned with stakeholder spreadsheet) and allow photos/notes per item.

### 2. Scope (v1)

- Templates with sections/items, including applicability by powertrain: `ice` (petrol/diesel), `ev`, `hybrid`.
- Create → Save draft → Submit → Approve workflow with assignments.
- Server-side scoring and validation; persisted responses and audit metadata.
- List page and stepper editor page; media upload via signed URLs.

Out of scope (v1): PDF export, offline mode, customer portal view.

### 3. Key Concepts

- Template: Versioned definition of sections/items/weights.
- Section: Group of items with a weight and applicability.
- Item: A single check with type, options, weight, and optional thresholds.
- Response: A concrete inspection instance with answers, scores, and status.
- Assignment: Who is responsible for completing the response and by when.

### 4. Data Model (types)

```ts
// types/vhc.ts
export type Powertrain = 'ice' | 'ev' | 'hybrid';

export type VHCOptionValue = number | string | boolean;

export type VHCItemType =
  | 'radio' // usually 1..5 scale
  | 'checkbox' // boolean pass/fail
  | 'range' // numeric range
  | 'tread-depth' // mm, auto-rated via thresholds
  | 'note'; // free text

export interface VHCScoreMap {
  [optionValue: string]: number;
} // 0..1

export interface VHCThresholds {
  red?: string; // e.g. "<2.0"
  amber?: string; // e.g. "2.0-3.0"
  green?: string; // e.g. ">=3.0"
}

export interface VHCItemTemplate {
  id: string;
  label: string;
  description?: string;
  type: VHCItemType;
  options?: VHCOptionValue[]; // for radio
  weight: number; // relative weight
  scoreMap?: VHCScoreMap; // maps option -> [0..1]
  thresholds?: VHCThresholds; // for tread-depth / range
  photoRequired?: boolean;
  applicable_to?: Powertrain[]; // defaults to all
  order?: number;
}

export interface VHCSectionTemplate {
  id: string;
  title: string;
  weight: number; // section weight
  applicable_to?: Powertrain[]; // defaults to all
  items: VHCItemTemplate[];
  order?: number;
}

export interface VHCTemplate {
  id: string;
  version: number;
  title: string;
  isActive: boolean;
  sectionWeights?: Record<string, number>; // optional, usually derive from sections
  sections: VHCSectionTemplate[];
}

export type VHCStatus =
  | 'draft'
  | 'in_progress'
  | 'submitted'
  | 'approved'
  | 'void';

export interface VHCAnswer {
  itemId: string;
  value?: VHCOptionValue;
  notes?: string;
  photos?: string[]; // object storage keys / URLs
}

export interface VHCResponse {
  id: string;
  templateId: string;
  templateVersion: number;
  powertrain: Powertrain;
  status: VHCStatus;
  vehicleId: string;
  bookingId?: string;
  serviceIds?: string[];
  assignedTo?: string; // user id
  assignedBy?: string; // user id
  dueAt?: string; // ISO
  answers: VHCAnswer[];
  scores?: {
    section: Record<string, number>; // 0..1 per section
    total: number; // 0..1
  };
  progress?: { answered: number; total: number };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
}
```

### 5. Scoring

- Normalize active sections/items after filtering by `powertrain` and `applicable_to`.
- Item score = `normalizedItemWeight * scoreMap[value]` or threshold-derived score.
- Section score = sum(item scores in that section).
- Total score = sum(section scores).
- Default 5-level score map: `{1:0, 2:0.25, 3:0.5, 4:0.75, 5:1}`.

### 6. API Endpoints (Next.js Route Handlers)

Base path: `/api/vhc`.

Authentication: bearer/session via existing middleware. Authorization via roles in `store/auth.ts`.

#### Templates

- `GET /api/vhc/templates/active` → Returns the currently active composed template (base + modules).
- `POST /api/vhc/templates` (admin) → Create/update a template version.

#### Responses

- `POST /api/vhc/responses`
  - Body: `{ templateId, powertrain, vehicleId, bookingId?, serviceIds?, assignedTo?, dueAt? }`
  - Creates a `VHCResponse` in `in_progress` (or `draft") state.

- `GET /api/vhc/responses`
  - Query: `status?, vehicleId?, bookingId?, assignedTo?, from?, to?`
  - Returns paginated list.

- `GET /api/vhc/responses/:id` → Fetch a response with template snapshot if needed.

- `PATCH /api/vhc/responses/:id`
  - Body: `{ answers: VHCAnswer[] }`
  - Merges answers, recomputes `scores` and `progress` server-side.

- `POST /api/vhc/responses/:id/submit` → Transition to `submitted`; validates required items/photos.

- `POST /api/vhc/responses/:id/approve` (manager) → Transition to `approved`.

- `POST /api/vhc/responses/:id/assign`
  - Body: `{ assignedTo, dueAt? }` → updates assignment fields.

#### Uploads

- `POST /api/vhc/uploads` → Returns signed URL and key. Client uploads directly, then attaches photo keys via `PATCH` answers.

### 7. Database Persistence

Use existing DB layer (`lib/db.ts`). Collections/tables (depending on adapter):

- `vhc_templates` (versioned, immutable once active)
- `vhc_responses`

Snapshots: store `templateVersion` on the response to preserve historical consistency when templates evolve.

### 8. UX & Navigation

- Add left nav: `Vehicle Health Checks` → `/vehicle-health-checks`.
- Pages:
  - List: filters by status/assignee/vehicle/booking; create new.
  - Editor: stepper with section jump, autosave on change (500ms debounce), diagram panel on right.
- Start powertrain from `vehicle` record; allow manual selection before first answer; lock after first answer.
- Completion screen: total score, per-section scores, flagged items, recommended services.

### 9. Validation Rules

- On submit: all required items answered; required photos attached.
- Server re-checks applicability and ignores non-applicable answers.
- Powertrain change after first answer prompts confirmation and re-normalizes weights.

### 10. Acceptance Criteria (v1)

- User can create, save draft, resume, submit, and (manager) approve a VHC.
- Scores match the stakeholder spreadsheet within ±1% after normalization.
- Autosave works; network errors are surfaced; submit blocked if unsynced.
- Photos attached via signed uploads; appear in the report.
- List and editor respect permissions; audit timestamps populated.

### 11. Seed Template (excerpt)

```json
{
  "id": "vhc_template_v1",
  "version": 1,
  "title": "Standard VHC",
  "isActive": true,
  "sections": [
    {
      "id": "safety",
      "title": "Critical Safety Systems",
      "weight": 0.45,
      "items": [
        {
          "id": "mandatory_lights",
          "label": "Mandatory lights",
          "type": "radio",
          "options": [1, 2, 3, 4, 5],
          "weight": 0.09
        },
        {
          "id": "brake_pads",
          "label": "Brake pad/shoe wear",
          "type": "radio",
          "options": [1, 2, 3, 4, 5],
          "weight": 0.12
        }
      ]
    },
    {
      "id": "hv_system",
      "title": "High Voltage System",
      "applicable_to": ["ev", "hybrid"],
      "weight": 0.15,
      "items": [
        {
          "id": "charge_port_condition",
          "label": "Charge port condition",
          "type": "radio",
          "options": [1, 2, 3, 4, 5],
          "weight": 0.03
        }
      ]
    },
    {
      "id": "engine_oil",
      "title": "Engine Oil/Leaks",
      "applicable_to": ["ice", "hybrid"],
      "weight": 0.08,
      "items": [
        {
          "id": "engine_oil_level",
          "label": "Oil level/condition",
          "type": "radio",
          "options": [1, 2, 3, 4, 5],
          "weight": 0.08
        }
      ]
    }
  ]
}
```

### 12. Future Enhancements

- PDF export and customer share via email/SMS.
- Recommendations mapping to service SKUs and estimates.
- Mobile-first layout and offline caching.
- Telemetry import (OBD-II/API) where supported.
