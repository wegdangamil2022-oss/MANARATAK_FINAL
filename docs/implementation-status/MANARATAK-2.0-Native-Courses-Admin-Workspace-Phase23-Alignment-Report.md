# MANARATAK 2.0 Native Courses Admin Workspace & Phase 23 Alignment Report

**Document ID:** MANARATAK-ALIGNMENT-REPORT-PHASE23-NATIVE-COURSES  
**Phase:** Phase 23 - Enterprise Administration Portal  
**Date:** July 2026  
**Status:** FULLY ALIGNED & IMPLEMENTED  
**Scope:** Courses Admin Workspace Tripartite Section Separation, Native MANARATAK Courses Authoring & Administration, Phase 23 UI/UX Standards, Domain Boundaries, and Phase 23 Documentation Synchronization.

---

## Executive Summary

The **Native MANARATAK Courses Admin Workspace** has been successfully designed, implemented, and fully synchronized with Phase 23 documentation specifications within MANARATAK 2.0.

This implementation enforces the architectural requirement that **Native MANARATAK Courses are NOT imported courses**. They are created and authored directly inside MANARATAK through a dedicated 6-step authoring pipeline, managed via a lightweight vertical administration list, and governed by strict cross-phase boundaries.

The Courses Admin Workspace is now structured into three clear, non-overlapping sections:
1. **Native MANARATAK Courses (`/admin/courses/native`)** - Authoring, curriculum structuring, question bank management, media attachments via EAP, certificate configuration, and lifecycle governance.
2. **Imported External Courses (`/admin/imports/courses`)** - Ingestion controls and external course catalog feeds.
3. **Paid Courses (`/admin/courses/paid`)** - Store pricing overview and monetization settings linked with Phase 19.

---

## Key Achievements & Implementation Artifacts

### 1. Courses Admin Landing Page (`/admin/courses`)
- **Location:** `/apps/web/src/features/admin-preview/AdminCoursesLandingPage.tsx`
- **Features:** Displays three distinct, high-impact section cards separating Native Courses, Imported External Courses, and Paid Courses with direct navigation buttons and status badges.

### 2. Native MANARATAK Courses Workspace (`/admin/courses/native`)
- **Location:** `/apps/web/src/features/admin-preview/AdminNativeCoursesPreviewPage.tsx`
- **Lightweight Vertical List:** Displays only essential scanning columns:
  - Course Title (Arabic & English)
  - Category / Field
  - Level (Beginner / Intermediate / Advanced)
  - Language
  - Price Type (Free / Paid / Draft Pricing)
  - Lifecycle Status Badge (Draft / Under Review / Ready to Publish / Published / Archived)
  - Instructor Name & Certificate Status
  - Direct "View Details" action (`/admin/courses/native/:id`)
- **8 Top Statistics Counters:**
  1. All Native Courses (`كل دورات منارتك`)
  2. Draft (`مسودة`)
  3. Under Review (`قيد المراجعة`)
  4. Ready to Publish (`جاهزة للنشر`)
  5. Published (`منشورة`)
  6. Archived (`مؤرشفة`)
  7. Certificate Enabled (`الشهادة مفعلة`)
  8. Missing Content (`محتوى ناقص`)
- **6-Step Native Authoring Wizard Overlay ("Create Native Course" / "إضافة دورة منارتك"):**
  1. *Course Basics*: Title Ar/En, description, category, level, language, instructor, cover image via EAP Asset ID, pricing type.
  2. *Curriculum Builder*: Module creation, lesson ordering, duration, lesson types (video, text, file, link, quiz).
  3. *Media & Attachments*: Video, PDF, and image assets via Phase 05 EAP Asset Ref IDs.
  4. *Assessments & Question Bank*: Question bank drafting (MCQ, True/False, Short Answer), module quizzes, final exam rules, passing score %, attempt limits.
  5. *Certificate Configuration*: Certificate enablement toggle, Phase 14 template reference ID, eligibility requirements.
  6. *Review & Publish Readiness*: Completeness validation checklist before saving draft or marking ready.

### 3. Native Course Detail Page (`/admin/courses/native/:id`)
- **Location:** `/apps/web/src/features/admin-preview/AdminNativeCourseDetailPage.tsx`
- **Comprehensive Management Surface:**
  - Course Basics & EAP Cover Asset Ref
  - Curriculum Modules & Lessons (Phase 13 Domain)
  - Media Assets via Phase 05 EAP Asset IDs
  - Assessments & Question Bank (Phase 13 Domain)
  - Certificate Governance Card (Phase 14 Boundary Note)
  - Pricing & Monetization Card (Phase 19 Boundary Note)
  - Content Completeness Checklist (Basics, Modules, Media, Assessments)
  - Admin Audit & Action History Log
- **11-Button Action Bar:**
  1. Edit (`تعديل`)
  2. Add Module (`إضافة وحدة`)
  3. Add Lesson (`إضافة درس`)
  4. Add Assessment (`إضافة اختبار`)
  5. Manage Question Bank (`إدارة بنك الأسئلة`)
  6. Manage Media (`إدارة الوسائط`)
  7. Enable/Configure Certificate (`تفعيل/إعداد الشهادة`)
  8. Mark Ready to Publish (`جاهزة للنشر`)
  9. Publish (`نشر`)
  10. Unpublish (`إلغاء النشر` with mandatory modal confirmation)
  11. Archive (`أرشفة` with mandatory modal confirmation)

### 4. Paid Courses Overview (`/admin/courses/paid`)
- **Location:** `/apps/web/src/features/admin-preview/AdminPaidCoursesPreviewPage.tsx`
- **Overview Surface:** Store overview for monetized courses with clear domain boundary notes delegating checkout and payment processing to Phase 19.

### 5. API Client Integration & i18n Localization
- **API Methods Added (`/apps/web/src/api/client.ts`):** `getAdminNativeCourses`, `getAdminNativeCourseById`, `executeAdminNativeCourseAction`, `createAdminNativeCourse`.
- **Translation Keys Added (`/apps/web/src/i18n/en.ts` and `/apps/web/src/i18n/ar.ts`):** Full Arabic and English keys covering all three course sections, authoring steps, list headers, detail labels, and action bar controls.

---

## Cross-Phase Architectural Boundary Compliance

| Domain / Phase | Responsibility & Boundary Governance | Compliance Status |
| :--- | :--- | :--- |
| **Phase 13 (Learning Domain)** | Owns course records, curriculum, modules, lessons, question banks, assessments, progression, and course lifecycle state machine. | **COMPLIANT** |
| **Phase 05 (EAP Assets)** | Owns uploaded media assets (videos, PDFs, images). Native courses reference assets using EAP Asset Ref IDs (`eap_asset_*`). | **COMPLIANT** |
| **Phase 14 (Certificates)** | Owns certificate generation & issuance upon student completion. Native courses configure eligibility rules & template IDs only. | **COMPLIANT** |
| **Phase 19 (Payments)** | Owns checkout & payment execution for monetized courses. Native course authoring sets store pricing metadata only. | **COMPLIANT** |
| **Phase 20 (Paid Services)** | Owns non-course paid student services (admissions support, translation, mentoring). Native courses are NOT reclassified as Phase 20 services. | **COMPLIANT** |
| **Phase 23 (Admin Portal)** | Owns admin UI/control-plane composition and authoring workflows only. Does not persist domain data directly. | **COMPLIANT** |
| **Phase 24 (Public Platform)** | Owns public rendering. Public visibility occurs exclusively after manual administrative publishing. | **COMPLIANT** |
| **No Auto-Publish Rule** | No course is published automatically. Requires explicit admin completeness check & confirmation. | **COMPLIANT** |
| **No Crawling / Scraping** | Native course authoring operates purely inside MANARATAK without uncontrolled web crawling. | **COMPLIANT** |

---

## Phase 23 Documentation Synchronization

The following formal documentation files have been updated to incorporate the Native Courses Admin Workspace architecture, conceptual TypeScript contracts, and operational workflows:

1. `/docs/phases/phase-23-enterprise-administration-portal/phase-23-01-enterprise-administration-portal-architecture-specification.md`
   - Added *Courses Admin Workspace Architecture & Section Separation Boundaries* detailing the 3-section split and domain boundaries.
2. `/docs/phases/phase-23-enterprise-administration-portal/phase-23-02-enterprise-administration-portal-structure-contracts.md`
   - Added *Section 23.B.11 Native Courses Admin Conceptual Contracts* defining TypeScript interfaces for section cards, list rows, detail view, authoring wizard, modules, lessons, question banks, certificate settings, and publishing checklist.
3. `/docs/phases/phase-23-enterprise-administration-portal/phase-23-03-enterprise-administration-portal-workflows-operational-experience.md`
   - Added *Section 23.C.15 Native Courses Admin Workspace & Authoring Operational Workflow* detailing section isolation, top stats counters, 6-step wizard, detail page layout, 11-button action bar, and cross-phase governance.

---

## Verification & Quality Assurance

- **Build Verification:** Executed `npm run build` across workspace. Result: Clean compilation with zero build errors.
- **Lint Verification:** Executed `npm run lint`. Result: Passed cleanly.
- **Type Safety:** All TypeScript interfaces strictly typed in `@manaratak/types` and `client.ts`.

---

**Report Approved By:** Chief Enterprise Architect & Architecture Review Board (ARB)  
**Status:** CLOSED & FULLY IMPLEMENTED
