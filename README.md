# Easy Leads Backend

Easy Leads is a NestJS backend for automated lead engagement and qualification over WhatsApp. It stores leads and conversation context in MongoDB, generates replies with OpenAI, scores lead quality over time, and supports sales handoff once a lead becomes qualified.

The current primary runtime flow is direct WhatsApp Cloud API + OpenAI + MongoDB. Botpress is still present in the codebase as a secondary / legacy integration path, but it is not the primary messaging architecture anymore.

![WhatsApp Image 2025-03-05 at 3 59 33 PM](https://github.com/user-attachments/assets/7f8b9e6f-828c-4fe4-91ce-8576a2683e22)

## Key Features

- Lead creation, retrieval, update, and phone-based lookup
- WhatsApp outbound messaging with both free-form text and template sends
- WhatsApp webhook handling for inbound conversations
- Conversation summaries persisted per lead
- Configurable chatbot and ICP settings stored in MongoDB
- Rule-based lead scoring plus OpenAI-assisted qualification analysis
- Sales handoff fields stored on leads for downstream follow-up

## Technical Architecture

Easy Leads is a single NestJS service organized into domain modules:

| Module | Responsibility |
| --- | --- |
| `Leads` | Stores lead records, creates leads, updates lead state, and supports phone-based lookup |
| `Whatsapp` | Sends WhatsApp messages, handles template sends, verifies webhooks, processes inbound messages, and drives the main conversation flow |
| `LeadScoring` | Calculates initial lead scores and updates scores over time using rules plus OpenAI analysis |
| `Settings` | Stores chatbot configuration and ICP configuration |
| `Botpress` | Secondary / legacy messaging path still available in the repo |

### Persistent Data

- `Lead`: contact details, score, category, handoff fields, and AI-derived insights
- `Settings`: stored config blobs for `chatbot` and `icp`
- `ChatSummary`: running conversation summary keyed by lead

### Primary Outbound Flow

1. A lead is created or loaded.
2. The service fetches chatbot and ICP settings from MongoDB.
3. An initial message is generated from lead context and settings.
4. The message is sent through the WhatsApp Cloud API.
5. A conversation summary record is created or updated for the lead.

### Primary Inbound Flow

1. Meta sends a webhook event to the WhatsApp controller.
2. The service validates and parses the webhook payload.
3. The lead is found by phone number or auto-created if missing.
4. Existing conversation summary is loaded from MongoDB.
5. OpenAI generates the next response using prior summary plus the new message.
6. The summary is updated, the reply is sent via WhatsApp, and the lead score is recalculated.

### Lead Scoring Flow

Lead scoring combines:

- rule-based signals such as interest, budget mentions, pricing questions, and objections
- OpenAI-based analysis for brand alignment, ICP match, insights, and client description

The result is written back to the lead record as score, category, handoff state, and AI-generated metadata.

### Botpress Status

Botpress routes and services still exist in the repository and can start/respond to conversations, but the README reflects the current primary architecture: direct WhatsApp handling through the `Whatsapp` module. Botpress should be treated as secondary / legacy unless the project is intentionally moved back to a Botpress-first flow.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend framework | NestJS on Node.js |
| Database | MongoDB with Mongoose |
| Messaging | WhatsApp Cloud API |
| AI | OpenAI API |
| Secondary integration | Botpress |
| Transport helpers | `@nestjs/axios` / RxJS |

## Main Endpoints

### Leads

- `POST /leads`
- `GET /leads`
- `GET /leads/:id`
- `PATCH /leads/:id`

### Settings

- `POST /settings/chatbot`
- `POST /settings/icp`
- `GET /settings/:type`

### WhatsApp

- `POST /whatsapp/send`
- `POST /whatsapp/send-template`
- `POST /whatsapp/start/:leadId`
- `GET /whatsapp/webhook`
- `POST /whatsapp/webhook`

### Lead Scoring

- `POST /lead-scoring/score`

### Botpress Secondary / Legacy

- `POST /botpress/start`
- `POST /botpress/respond`

## Developer Setup

### Install

```bash
npm install
```

### Run

```bash
npm run start
npm run start:dev
npm run start:prod
```

The service listens on `PORT` if provided, otherwise it defaults to `8000`.

### Build

```bash
npm run build
```

### Test

```bash
npm test
npm run test:e2e
```

## Environment Variables

### Required for Primary Flow

- `MONGO_URI`
- `OPENAI_API_KEY`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_API_TOKEN`
- `WHATSAPP_VERIFY_TOKEN`

### Optional

- `PORT`

### Optional for Botpress / Legacy Paths

- `BOTPRESS_API_TOKEN`
- `BOTPRESS_WORKSPACE_ID`
- `BOTPRESS_BOT_ID`
- `BOTPRESS_API_KEY`

## Supporting Docs

- [service-doc.md](./service-doc.md) for service-level notes
- [service-api.md](./service-api.md) for additional API documentation

This README is the best high-level description of the current primary runtime flow. The supporting docs remain useful reference material, especially for older Botpress-oriented behavior still present in the codebase.

## Typical Use Cases

- Fitness and coaching businesses
- High-ticket sales workflows
- Service businesses qualifying inbound leads
- Teams that want WhatsApp-first lead engagement with scoring and handoff

## Roadmap

- Admin dashboard for ICP and chatbot strategy configuration
- CRM integrations for downstream handoff
- Analytics for conversion, drop-off, and score changes
- Stronger separation of primary WhatsApp flow and secondary Botpress legacy flow

## License

UNLICENSED
