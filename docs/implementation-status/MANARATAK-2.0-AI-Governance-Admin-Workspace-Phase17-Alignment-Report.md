# MANARATAK 2.0 - AI Governance & AI Center Admin Workspace Phase 17 Alignment Report

**Date:** July 28, 2026  
**Phase Target:** Phase 23 (Enterprise Administration Portal) & Phase 17 (Enterprise AI Platform)  
**Related Domain Phases:** Phase 18 (Student Tools & Free AI Utilities), Phase 16 (CMS & Editorial Content), Phase 15 (Student Workspace & Profile), Phase 05 (EAP Assets)  
**Status:** COMPLETE & VERIFIED  

---

## 1. Executive Summary

This report documents the design alignment and implementation of the **AI Governance / AI Center Admin Workspace** within MANARATAK 2.0 Enterprise Administration Portal (`@manaratak/admin` / Phase 23).

The AI Center serves as the central orchestration and governance engine powering student tools (CV generator, motivation letters, CV review), automated entity translations, academic recommendations, content summarization, and AI workflows across MANARATAK 2.0.

---

## 2. Structural Breakdown & 10 Workstation Tabs

The unified workspace page is accessible at `/admin/ai-governance` (Arabic: **حوكمة الذكاء الاصطناعي / مركز الذكاء الاصطناعي**):

1. **AI Center Dashboard**: Top 6 KPI summary metrics (Daily requests, Translation ops, Motivation/CV tools, Token consumption & cost, Avg latency, Filtered requests) and health cards for AI Providers (Gemini, OpenAI, Claude, DeepSeek, Local/Custom Models).
2. **AI Providers Management**: Granular control table displaying Provider Name, Status (Active/Disabled/Degraded/Not Configured), Priority order, Default assigned services, Latency, Failure rate, and Masked API Key status (`Configured` / `Missing`). Actions allow toggling statuses and testing connections safely.
3. **AI Translation Center**: Batch translation workspace covering Universities, Scholarships, Courses, CMS Articles, Majors, International Tests, and Services. *Enforces strict rule that AI translations never publish automatically; they are routed to Phase 16 CMS review.*
4. **Prompt Management Repository**: Central prompt repository stored outside codebase. Displays prompt versions, target models, safety classifications, and detail modal for editing system prompts, variables (`{{student_background}}`), expected JSON schemas, test prompt execution, and version rollback.
5. **AI Tasks Tracking**: Execution monitor tracking Task ID, Type, Domain, Execution Status (Queued, Running, Completed, Failed, Blocked, Needs Human Review), Provider, Model, Timestamps, Latency, and Tokens used.
6. **AI Queue (BullMQ / Redis)**: Workload processing queue manager displaying Queued tasks, Running tasks, Retry queue, Avg wait time, and Queue controls (Pause Queue, Resume Queue, Retry, Cancel) with clear preview environment labels.
7. **AI Logs & Incidents**: Audit log table with automatic PII redaction and privacy protection for student identity data.
8. **AI Settings**: System parameters governing default primary/fallback providers, max retries, token limits, daily per-user quotas, safety filter levels, and cost alert thresholds.
9. **AI Usage Analytics**: Visual breakdowns for tool usage distribution, provider share, success/failure rate (99.2% success), and cost allocation.
10. **Unified AI Service Boundary Panel**: Read-only architectural guide detailing `AIService.routeRequest()` orchestrator rules and cross-phase boundary ownership.

---

## 3. Strict Boundary Rules & Security Compliance

- **No Exposed API Keys / Secrets:** API keys are never rendered or returned to the browser. Only masked status (`Configured` / `Missing`) is displayed.
- **No Direct Provider Calls by Domain Modules:** All features call `AIService.routeRequest()`. Direct calls to OpenAI/Gemini/Claude from domain components are strictly prohibited.
- **No Unreviewed Auto-Publishing:** AI-generated text and translations MUST pass through Phase 16 editorial/CMS review before being published.
- **Privacy Redaction:** Raw student PII is redacted in AI logs and model payloads, protecting Phase 15 student privacy.
- **Phase Ownership Delegation:**
  - **Phase 17:** AI routing, provider failover, prompt repository, BullMQ queue, privacy redaction.
  - **Phase 18:** Student tools UI (CV Generator, Motivation Letter, CV Reviewer).
  - **Phase 16:** Editorial review & CMS publication approval.
  - **Phase 15:** Private student identity data.
  - **Phase 23:** Admin control-plane UI screens.

---

## 4. Summary of Verification

- **Lint Status (`lint_applet`):** PASS - Clean lint with 0 ESLint warnings or errors.
- **Build Status (`compile_applet`):** PASS - Clean build with 0 TypeScript compilation errors.
- **RTL & Bilingual Support:** Fully verified with Arabic default RTL layout.

---

**Approval:** Chief Enterprise Architect & ARB  
**Status:** APPROVED & DEPLOYED IN PREVIEW
