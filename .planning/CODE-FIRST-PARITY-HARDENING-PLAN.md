# Rakazo Fork — Code-First Grok Bot Parity Hardening Plan

- **Status:** IMPLEMENTED — source-reviewed; runtime/provider/device-unverified
- **Tanggal audit:** 2026-10-12
- **Target kerja:** repository Rakazo Fork, branch `m4-execution`
- **Baseline saat plan dibuat:** `736b9e66`
- **Jenis pekerjaan:** implementasi + review kode statis saja; **bukan** release verification.

## Tujuan

Selesaikan bagian implementasi yang masih rapuh setelah M1–M4 agar Rakazo Fork semakin mendekati **alur dan kemampuan Grok Bot**, tanpa mengejar pixel parity. Fokus pada **kode yang benar-benar menangani aksi**, bukan menambah screenshot, test suite, atau polish visual yang akan dicek pemilik secara manual.

**Bukan rewrite dan bukan M5 resmi.** Ini follow-up code-only untuk branch M4, bukan pengganti `.planning/M4-EXECUTION-PLAN.md`, `.planning/STATE.md`, atau fase 23/31. Kode dapat diberi label `CODE COMPLETE` dalam file ini **tanpa** menyatakan M3/M4 release gate lulus.

### Instruksi eksplisit pemilik (mengalahkan gate pengujian untuk pekerjaan ini)

- **Kerjakan kode saja.** Jangan menjalankan aplikasi, browser, Electron, simulator, perangkat, Playwright, Maestro, screenshot capture, benchmark, test unit, test integrasi, atau E2E.
- **Jangan membuat test baru hanya demi checklist**, dan jangan menghabiskan fase untuk memperbaiki flaky/pre-existing test. Perubahan pada test yang sudah ada bukan deliverable.
- Verifikasi cukup lewat **source review**: ikuti pemanggil/callee, kepemilikan data, kontrak tipe, jalur berhasil/gagal, state transition, dan `git diff`. Typecheck/lint statis boleh dilakukan bila berguna, tetapi **bukan syarat selesai** dan tidak boleh berubah menjadi siklus debugging environment/test.
- **Pengujian visual, UX, provider real, dan perilaku runtime akan dilakukan sendiri oleh pemilik.** Jangan mencatatnya sebagai sudah diverifikasi.
- Jangan melakukan push, merge upstream, release, atau mengubah status fase M3/M4 menjadi DONE tanpa instruksi eksplisit terpisah.
- Pertahankan perubahan lokal yang sudah ada: saat baseline, `apps/web/e2e/command-palette.spec.ts` dan `apps/web/e2e/routine-crud.spec.ts` sedang modified; **jangan reset, overwrite, stage, atau menyentuhnya**.
- Ikuti `AGENTS.md` dan prinsip provider-neutral / self-hostable / privacy. Jika aturan proyek biasanya meminta runtime tests untuk release, **tinggalkan release gate terbuka**, bukan mengklaimnya selesai.

## Snapshot kode yang sudah ada — jangan dibuat ulang

| Kapabilitas | Source yang sudah ada | Target hardening |
|---|---|---|
| Draft email typed, approval, binding | `apps/api/src/draft-actions.ts`; `packages/adapters/src/draft-binding.ts`; `packages/core/src/email-draft.ts` | Keamanan jalur pengiriman, konsistensi payload, durable dispatch |
| Email alias + Gmail Spam | `packages/adapters/src/composio-emulator.ts`; `packages/adapters/src/draft-fields.ts` | Bedakan emulator dengan capability provider nyata |
| Deck artifact + PPTX | `packages/adapters/src/presentation-artifacts.ts`; `presentation-pptx.ts`; `apps/api/src/presentation-export.ts` | Ekspor Google Slides deterministik dari deck yang disimpan |
| Google Slides action | `apps/api/src/presentation-export.ts`; `apps/web/src/components/DeckCard.tsx` | Saat ini mengirim instruksi natural-language ke Bot, belum direct structured delivery |
| Mobile voice memo | `apps/mobile/lib/voice-memo.ts`; `apps/mobile/app/thread.tsx` | Recovery upload/send, lifecycle dan transcript seek |
| Project cancellation / orchestration | `apps/api/src/project-control.ts`; `packages/adapters/src/project-orchestration.ts` | Penelusuran ownership, cancel race, state consistency |
| Slack mention policy | `packages/adapters/src/slack-mentions.ts` | Pertahankan fail-closed; hanya perbaiki jika source review menemukan bypass |
| Web shell dan composer | `apps/web/src/pages/Shell.tsx` dan modul terkait | Perubahan hookup minimal; bukan redesain ulang |

**Dokumentasi yang diketahui stale:** `.planning/M4-ACCEPTANCE-MATRIX.md` dan beberapa phase handoff masih menyebut send-as, Gmail Spam, Google Slides, atau mobile recording sebagai belum dibuat, sementara commit `d9e396d7`, `c8e40329`, dan `15cd5e05` sudah menambah implementasi. Jangan mengerjakan ulang fitur hanya karena checklist tertinggal.

## Aturan eksekusi agent

1. Mulai dengan `git status` dan baca source HEAD yang bersangkutan; rencana ini berisi **audit seeds**, bukan jaminan bahwa setiap masalah belum diperbaiki oleh commit berikutnya. Jika sudah aman, tandai `ALREADY SATISFIED` disertai path dan penjelasan, lalu lanjut.
2. Prioritaskan **P0/P1 code correctness dan security**, baru P2 experience/code hygiene. Selesaikan tiap slice secara vertikal (shared contract → backend → adapter → UI wiring bila perlu) tanpa meninggalkan handler palsu.
3. Frontend menyatakan intent dan menampilkan status; backend menetapkan identitas actor, otorisasi, validasi, sequencing, retry, dan provider dispatch. Web/Electron berbagi UI; mobile memakai UI native dengan kontrak yang sama.
4. Reuse subsistem yang sudah ada (message nonce, run/job scheduling, connector registry, artifact storage, action approval, event/reconnect). Hindari outbox, schema, service, atau provider abstraction baru bila mekanisme durable existing cukup.
5. Semua aksi berisiko harus mengikat **actor + space + owner + resource + capability**. Never trust client-supplied IDs/labels/status sebagai bukti izin. Tidak boleh ada pengiriman email, publikasi deck, atau pembatalan pekerjaan lain tanpa otorisasi yang sesuai.
6. Hindari mengubah file berpotensi konflik besar (`Shell.tsx`, `router.ts`, `schema.prisma`, mobile `thread.tsx`) bila perubahan bisa ditaruh di modul baru yang kohesif. Jangan membuat abstraksi spekulatif.
7. Pada setiap akhir fase, centang hanya setelah implementasi dan tracing kode selesai; catat touched files, kode yang menjamin invariants, known limitations. **Jangan tulis "tested", "works on device", atau "Grok parity verified"**.
8. Jangan menyentuh `.env`, kredensial, atau data pribadi. Tidak ada push/PR otomatis.

---

## Fase A — Email action boundary & authorization (P0)

**Masalah utama:** `approvedEmailBindingError` memeriksa tool email connector yang dikenali. Itu membantu, tetapi belum membuktikan bahwa sebuah run hasil approval draft tidak dapat memakai **browser/shell atau tool lain** sebagai alternatif pengiriman. Jangan membuat klaim keamanan menyeluruh hanya karena validasi tool connector lolos.

**Area:** `packages/adapters/src/draft-binding.ts`, `executor.ts`, `builtin-tools.ts`, `packages/core/src/action-approval.ts`, `packages/core/src/email-draft.ts`, dan konektor terkait.

- [ ] **A01 — Trace semua jalur side effect email.** Petakan tool pengiriman / reply / forward / send-as, jalur browser/computer/shell, serta kapan action approval dikenakan. Klasifikasikan run **submitted draft** dan run chat biasa secara eksplisit.
- [ ] **A02 — Kunci submitted-email run ke payload immutable.** Untuk run dari draft yang disetujui, hanya izinkan aksi email yang payload finalnya cocok dengan snapshot approved (account, from, to/cc/bcc, subject, body/format, attachments, thread/reply metadata). Argumen tambahan/unknown yang dapat mengubah aksi harus fail-closed. Pertahankan pesan error yang bisa dipahami agent.
- [ ] **A03 — Tutup alternate-route khusus draft.** Browser/shell atau tool non-connector **tidak boleh menjadi fallback diam-diam** untuk mengeksekusi approved email draft ketika payload tidak bisa diverifikasi. Pilih action-specific restriction/approval di boundary executor; **jangan** mematikan browser/shell untuk seluruh aplikasi atau percakapan biasa.
- [ ] **A04 — Validasi capability akun asli.** `from`/send-as hanya valid jika identitas yang tersambung memang memiliki alias tersebut (provider-backed server check), bukan sekadar cocok dengan pilihan UI. Bedakan dengan mock/emulator. Untuk provider yang tidak mendukung, gunakan default sender atau status unsupported yang jujur.
- [ ] **A05 — Pertahankan approval dan isolasi multi-user.** Draft Team Bot tidak boleh memakai kredensial koneksi pribadi user lain; move-from-Spam memerlukan kebijakan consequential-action; preview/rich body tetap disanitasi dan pengiriman memakai representasi final yang sama.

**Code completion:** tak ada jalur yang diam-diam mengirim ulang/mengubah email dari submitted draft, dan setiap run membedakan aksi yang boleh dikirim dari aksi yang harus ditolak/di-approve lagi. Ini **batas kebijakan source-code**, bukan bukti bahwa setiap otomasi browser di dunia nyata bisa terdeteksi.

## Fase B — Durable draft submission & retry (P0/P1)

**Masalah teramati:** `submitDraftAction` mengubah card menjadi `submitted` lalu memanggil `sendThreadMessage`. Nonce dan compare-and-set sudah ada, tetapi status draft dan keberhasilan penjadwalan pekerjaan masih terpisah saat terjadi crash/timeout.

**Area:** `apps/api/src/draft-actions.ts`, `thread-target.ts`, state `MessageBlock` di `packages/contracts`, mekanisme durable run/reconciler yang telah ada di `packages/db` / `packages/adapters`.

- [ ] **B01 — Inventaris durable primitive existing** (transactional message/run write, nonce receipt, job reconcile, queue). Definisikan satu sumber kebenaran untuk submission dan receipt; dokumentasikan titik kegagalan **sebelum/sesudah commit**.
- [ ] **B02 — Buat submit intent recoverable.** Submission/immutable approved snapshot dan durable intent harus menjadi satu transisi atomik DB, atau melalui mekanisme existing yang memberi jaminan ekuivalen. Jangan melakukan network provider calls dalam transaksi DB.
- [ ] **B03 — Recover job yang belum dispatch.** Reconciler/worker existing menuntaskan intent yang tersimpan setelah process crash. Retry user harus memakai identity key yang sama, bukan menciptakan dua run. Hindari worker/outbox paralel baru tanpa kebutuhan nyata.
- [ ] **B04 — Benahi state untuk unknown outcome.** Bedakan `draft`, `queued/submitted`, `dispatch_failed`, dan `delivery_unknown` bila perlu. Gagal mengirim instruksi tidak sama dengan provider gagal deliver; jangan rollback ke editable draft sesudah efek eksternal mungkin terjadi.
- [ ] **B05 — Idempotency sampai boundary provider.** Gunakan idempotency provider bila tersedia; jika tidak, persist receipt dan jangan otomatis mengirim ulang ketika status external delivery belum diketahui. **Jangan klaim exactly-once email delivery** jika provider tidak menjaminnya.
- [ ] **B06 — Sinkronkan card dan thread setelah reconnect.** UI status/error/retry mengikuti server truth, bukan semata state lokal `busy`/`sent`. Perbarui kedua surface yang relevan lewat shared contract; jangan membangun UI baru untuk menutupi state mismatch.

**Code completion:** repeated submit, replay, crash-before-dispatch, dan ambiguous-delivery memiliki transisi yang terdefinisi dan implementasi dapat ditelusuri pada kode tanpa dua aksi eksternal disengaja.

## Fase C — Structured Google Slides delivery (P1)

**Masalah teramati:** `deliverDeck` saat ini mengirim `deckDeliveryText(deck)` sebagai pesan yang meminta Bot membuat Google Slides ulang. Ini **bukan ekspor langsung dari versi artifact yang disetujui**, dan tombol `sent` tidak membuktikan file eksternal telah dibuat.

**Area:** `apps/api/src/presentation-export.ts`; `apps/web/src/components/DeckCard.tsx`; `packages/adapters/src/presentation-artifacts.ts`, `presentation-pptx.ts`; konektor/capability registry; `packages/contracts/src/rpc.ts`.

- [ ] **C01 — Tetapkan satu structured export boundary.** Sumber konten adalah `Deck` yang diparse dari versioned artifact. Bentuk kontrak `PresentationDestination` / capability cukup kecil untuk PowerPoint download dan optional Google Slides delivery. Provider-specific SDK tetap di adapter.
- [ ] **C02 — Hapus reinterpretasi LLM untuk export.** Kirim slide berurutan, judul, bullets, notes, dan metadata dari Deck langsung ke provider yang didukung, mis. import/convert editable PPTX via Drive atau Google Slides API jika koneksi/scope mengizinkan. **Jangan** menyerahkan ulang seluruh deck ke instruksi natural language Bot sebagai jalur utama.
- [ ] **C03 — Kunci destination dan ownership.** Periksa per-user connection, scope, resource permission, artifact ownership, dan privacy default. Jangan membuat file public atau mengubah sharing tanpa persetujuan eksplisit.
- [ ] **C04 — Durable delivery record.** Idempotency key terikat pada actor + artifact ID + version + destination; retry tidak otomatis membuat deck ganda. Simpan outcome: pending, delivered dengan external ID/link, failed, unsupported/reauth required.
- [ ] **C05 — UI menampilkan outcome nyata.** `DeckCard` jangan set `sent=true` ketika baru berhasil mengirim pesan/instruksi. Tampilkan link Google Slides saat provider benar-benar mengembalikan file dan status retry yang tidak misleading; capability tidak tersedia → sembunyikan/disabled secara jujur.
- [ ] **C06 — Pertahankan PowerPoint dan portability.** PPTX tetap editable semampu renderer; rendering berasal dari Deck yang sama. Jangan menghapus alur download; pastikan tidak ada provider wajib untuk core product.

**Code completion:** sumber deck dan tujuan eksplisit, export melakukan operasi terstruktur (bukan perintah Bot), dan outcome yang ditampilkan konsisten dengan receipt provider. Dukungan Google yang belum tersedia pada koneksi tertentu boleh `unsupported`, **tidak boleh pura-pura terkirim**.

## Fase D — Projects, cancellation & lifecycle (P1)

**Masalah/risiko:** beberapa perbaikan orchestration sudah ada di M4; fokus pada membuktikan hubungan ownership dari implementasi dan menambal jalur yang masih ambigu, bukan membuat Project engine baru.

**Area:** `apps/api/src/project-control.ts`, `packages/adapters/src/project-orchestration.ts`, task/run/cloud-agent storage, event/reconciler, project card renderers.

- [ ] **D01 — Trace ownership parent → task → run → subagent → cloud agent.** `cancelProjectCloudAgents` saat ini menghubungkan cloud agent lewat card/message dari run; audit apakah relasi ini cukup kuat ketika message/card hilang atau status berubah. Simpan explicit relation hanya bila dibutuhkan, dengan migrasi additive jika perlu.
- [ ] **D02 — Hentikan seluruh descendants milik project saja.** Cancel idempotent; tidak membatalkan run lain pada Bot/Team Computer yang sama atau proyek user lain. Tangani queued, running, waiting approval, delayed completion, dan remote cancel acknowledgement.
- [ ] **D03 — Tidak ada child yang bangkit sesudah parent dibatalkan.** Tentukan guard pada scheduling dan completion reconciliation; update status task/project dari satu sumber authoritative.
- [ ] **D04 — Pertahankan queue/lease Team Computer.** Jangan menambah jalur yang menyebabkan raw busy error atau deadlock saat parent dan child memakai computer yang sama. Gunakan scheduler/lease yang telah ada.
- [ ] **D05 — Konsistensi Main Bot attention dan project cards.** Dedup per event/actor; state project/task yang disajikan di web, Electron dan mobile merujuk kontrak yang sama. Optimasi hanya bila terlihat sumber masalah nyata di kode.

**Code completion:** alur ownership dan perubahan status dapat ditelusuri end-to-end di source, termasuk jalur error/cancel; tidak ada jalur jelas untuk orphaned worker atau pembatalan lintas user.

## Fase E — Mobile/web parity yang masih murni urusan kode (P1/P2)

**Bukan visual redesign.** Fitur mobile voice memo, transcript follow-along, deck card dan project card sudah ada; benahi kontrak/status supaya pemilik bisa memeriksa UI sendiri nanti.

**Area:** `apps/mobile/lib/voice-memo.ts`; `apps/mobile/lib/voice.ts`; `apps/mobile/app/thread.tsx`; `apps/mobile/lib/message-presentation.ts`; `apps/web/src/components/DeckCard.tsx`; `DraftActionCard.tsx`.

- [ ] **E01 — Voice recording lifecycle.** Pastikan permission denied/cancel/background/stop/release/error tidak menyisakan recorder atau menghapus satu-satunya clip sebelum upload dapat dipulihkan. Batas ukuran diterapkan sebelum base64 allocation besar; resource cleanup pada setiap exit path.
- [ ] **E02 — Upload/send recovery voice memo.** `sendVoiceMemo` melakukan create artifact lalu send message; jika langkah kedua gagal, jangan membuat orphan/duplikat attachment setiap retry. Pertahankan id/status yang bisa dipakai ulang secara aman.
- [ ] **E03 — Transcript seek nyata.** Sekarang highlight progress sudah ada tetapi tap-to-seek belum lengkap. Perluas playback API pada `lib/voice.ts` dengan seek ketika native/web backend mendukung; fallback eksplisit bila timestamp tak tersedia. Tidak perlu perubahan layout besar.
- [ ] **E04 — Shared status mapping.** Deck, draft, project, dan voice cards pada mobile harus mengerti pending, success, failed, retry, and stopped dari kontrak backend; jangan menebak status dari local button state.
- [ ] **E05 — Bot/Team/Routine parity pada entry point yang sudah ada.** Audit hanya kontrol yang sudah diekspos dan harus berfungsi: navigation target, ownership, edit permission, connection flow. Jangan menambahkan manajemen Team Bot mobile di luar kemampuan yang dibenarkan reference atau membuat placeholder UI.
- [ ] **E06 — State-aware UX wiring.** Web/Electron tetap pakai shared component; kontrol pending, disabled, retry, focus/keyboard dari kode harus masuk akal. Pemilik melakukan judgement visual dan click-through sendiri.

**Code completion:** semua kontrol baru memiliki handler dan server state yang konsisten; tidak ada deliberate dead control. **Tidak mengklaim** perilaku device/audio/visual sudah lulus.

## Fase F — Source hygiene, upstream syncability, & handoff (P2)

- [ ] **F01 — Review perubahan terhadap upstream secara statis.** Identifikasi file konflik (audit sebelumnya memperkirakan **37 predicted conflicts**, bukan angka permanen). Jangan melakukan merge/fetch/push sebagai bagian dari tugas ini tanpa persetujuan; pisahkan logic fork dalam modul adapter bila mungkin.
- [ ] **F02 — Hindari abstraction creep.** Satu source of truth untuk DTO/state; tidak ada duplikat workflow email, deck, Bot, atau project. Gunakan import type top-level, semantic UI tokens, typed errors, dan provider capability yang sudah ada.
- [ ] **F03 — Review diff keamanan.** Baca seluruh perubahan untuk kebocoran credential/PII, log sensitif, perubahan izin, accidental sharing, untrusted HTML/prompt text, cross-tenant ID, raw shell/browser fallback. Jangan stage file rahasia.
- [ ] **F04 — Perbarui dokumentasi IMPLEMENTASI yang stale saja.** Reconcile item send-as/Spam/Slides/mobile recording di `M4-ACCEPTANCE-MATRIX.md`/phase handoff jika relevan, tapi **jangan** mengganti hasil test yang belum dijalankan dengan PASS; label `implemented / static-reviewed / runtime-unverified`. Jangan tutup `STATE.md` Phase 23 atau 31.
- [ ] **F05 — Handoff untuk pemilik.** Di bawah file ini, isikan status tiap fase, file yang diubah, sumber kode yang menjamin invariant, sengaja tidak dikerjakan, dan daftar singkat hal yang perlu dicek manual oleh pemilik. Tidak perlu screenshot/test report.

**Code completion:** implementasi tersusun, tidak ada placeholder/dual-path misleading, tidak ada regression yang jelas dari pembacaan source, diff bisa direview, dan perubahan lokal awal tetap aman.

---

## Urutan eksekusi yang disarankan

`A → B → C → D → E → F`.

- **A/B adalah prioritas pertama** karena melibatkan aksi eksternal dan reliability pada approved actions.
- **C sesudah B** agar Google Slides juga dapat memakai pola durable receipt yang konsisten.
- **D/E** boleh dilakukan setelah kontrak bersama stabil; jangan mengubah backend dan UI state secara paralel tanpa koordinasi.
- **F** menutup source-level cleanup, bukan gate rilis.
- Bila pada suatu subtask kode sudah memenuhi kondisi yang diminta, **skip** daripada rewrite.

## Definisi DONE untuk plan ini

Sebuah checkbox selesai bila:
1. Agent menginspeksi current source dan memiliki penjelasan grounded apakah ada gap atau sudah terpenuhi.
2. Untuk gap yang nyata, jalur produksi diimplementasikan dari kontrak sampai handler/caller; tidak ada TODO, fake button, unused API, atau state yang sengaja disconnected.
3. Agent melakukan static diff review termasuk path sukses, error, permission, cancellation/retry, dan data ownership.
4. File/status dicatat di **Implementation Log** berikut; review kode **tidak diubah menjadi klaim runtime**.

**Di luar scope DONE:** unit test, integration test, E2E, CI, visual parity approval, Electron/mobile device verification, benchmark, real Gmail/Google Slides/Slack proof. Semua itu berada di tangan pemilik atau tetap terbuka pada release gate M3/M4 yang asli.

## Implementation Log (diisi agent saat mengeksekusi)

| Fase | Status | Bukti kode / file | Limitations / next |
|---|---|---|---|
| A — Email authorization | CODE COMPLETE — source-reviewed, runtime/provider-unverified | `packages/core/src/email-draft.ts`, `packages/core/src/node/email-account.ts`, `packages/adapters/src/draft-fields.ts`, `draft-binding.ts`, `executor.ts`, `apps/api/src/draft-actions.ts`, `thread-target.ts`, `packages/contracts/src/events.ts` | Submitted drafts pin the sole matching actor-owned provider connection and opaque account snapshot; default sender only; unknown arguments fail closed; alternate consequential routes need fresh approval. Reply/forward context and real send-as aliases remain unsupported. Spam provider behavior is still unverified. |
| B — Durable submit | CODE COMPLETE — source-reviewed, runtime/provider-unverified | `apps/api/src/draft-actions.ts`, `thread-target.ts`, `packages/adapters/src/job-reconciler.ts`, `executor.ts`, `approval-effect.ts` | Draft state and the user message/task/run/event commit atomically. Stable nonce replay and queued-run reconciliation recover dispatch; uncertain external effects stay uncertain and are not retried automatically. A submitted card remains submitted after provider-side failure; Run/ExternalEffect is the outcome source. |
| C — Google Slides | SAFE FALLBACK COMPLETE — structured delivery unsupported | `apps/api/src/presentation-export.ts`, `apps/web/src/components/DeckCard.tsx`, `packages/contracts/src/rpc.ts` | Removed the connection-only “sent” path. The card keeps PowerPoint download; the legacy Slides endpoint checks artifact ownership then reports unsupported. No connector currently exposes structured create/upload with an external receipt or link. |
| D — Project lifecycle | CODE COMPLETE — source-reviewed, runtime-unverified | `apps/api/src/project-control.ts`, `packages/adapters/src/project-orchestration.ts`, `cloud-agent-service.ts`, `executor.ts` | Project cancellation and child scheduling now share a row-lock barrier; Cloud Agent launch checks the live run and Project under that lock. Existing card/run ownership relation remains sufficient; no migration was added. |
| E — Cross-platform contracts | CODE COMPLETE — source-reviewed, device-unverified | `apps/mobile/lib/voice-memo.ts`, `voice.ts`, `app/thread.tsx`, `apps/api/src/artifacts.ts`, mobile locale files; existing routines, Team Bot, draft, project and deck cards | Mobile voice sends keep one nonce/artifact across in-session retry; timed transcript segments can seek on HTML Audio and Expo Audio. Actual iOS/Android behavior, accessibility, permissions, and process-restart recovery remain unverified. Existing entry points were inspected; no placeholder management UI was added. |
| F — Hygiene & handoff | COMPLETE — static review | `.planning/M4-ACCEPTANCE-MATRIX.md`, Phase 25/27/28/29 handoffs, this file | TypeScript and lint checks were static only. Tracked/untracked state reviewed; during this hardening pass no test file, secret, migration, or phase status was changed. The M3/M4 release gates remain open. |

### Handoff — 2026-10-13

**Changed source and invariants**

- Email approval binds the exact provider, pinned connection id plus opaque provider-account snapshot, supported send action, recipients, subject, body representation, and default sender. Attachments, alternate account selectors, reply/thread metadata, unknown fields, and unverified formats are rejected. Only one matching connected account may be submitted; the executor narrows that run's connector context to the pinned connection.
- Draft submission and queued run intent are one database transaction. The ordinary `threads.send` path cannot claim the reserved draft nonce. A draft send cannot steer an already-running Bot turn. A retry reuses the same nonce and existing run receipt.
- A submitted-email run's other consequential connector actions and browser/computer/shell actions require a fresh approval. The approval policy remains unchanged for ordinary chat runs.
- Project stop marks the Project and open child tasks first under a row lock. Child scheduling/retry and Cloud Agent launch check the same Project state before creating work.
- Voice memo capture attempts recorder/audio-mode cleanup on all exits, rejects unknown/oversize recordings before base64 conversion, and retains one artifact/message key for in-session retry. The artifact family lock deduplicates a repeated upload. Timed transcript segments call the active HTML Audio or Expo Audio seek handle.
- Google Slides no longer appears as an available action based only on a connection record. The endpoint returns unsupported after confirming the actor owns a valid deck. PowerPoint remains available.

**Verification**

- Static TypeScript checks: `@rakazo/api`, `@rakazo/adapters`, `@rakazo/core`, `@rakazo/web`, and `@rakazo/mobile` passed.
- Biome check passed for touched source files; `git diff --check` passed.
- No unit, integration, E2E, CI, browser, Electron, simulator, device, provider, or screenshot verification was run, per the code-only task instructions.
- Phase 23 and Phase 31 remain open. No phase status was changed and `.planning/STATE.md` was not changed. No test file was changed by this execution; the pre-existing modified E2E files remain untouched.

**Intentionally unsupported or deferred**

- Non-default email sender selection; reply/forward metadata; direct Gmail Spam actions when the real connector does not expose them; real Google Slides create/upload and external receipt.
- Recovery of an unsent voice memo after the app process is restarted; the pending capture is held in memory to avoid storing raw audio locally.
- All runtime/provider/mobile/device checks and changes to existing tests.

**Owner checks still needed**

- Verify edited To/Cc/Bcc/subject/body/format against the real connector, reconnect or replace the pinned account, and confirm alternate routes pause for explicit approval.
- Verify provider Spam availability and consequential-action prompts; confirm Google Slides is absent while PowerPoint still downloads.
- Stop a Project while a child task is being scheduled and while a Cloud Agent launch is in flight; confirm no child wakes afterward.
- On iOS/Android, verify permission denied, cancel, background, oversized clip, upload/send failure followed by retry, and timed transcript seeking with accessibility tools.
- Review routine, Team Bot, Connect apps, draft, project, and deck flows in the UI. The two pre-existing modified E2E files remain untouched.

### Manual check oleh pemilik (bukan tugas agent)

Setelah implementasi selesai, pemilik dapat menilai sendiri send email (termasuk gagal/retry), Google Slides/PPTX, stop/retry Projects, voice memo mobile, command palette/routine actions, serta feels Grok Bot di web/Electron/mobile. **Tidak ada item di sini yang menghalangi CODE COMPLETE**, tetapi tanpa pengecekan tersebut produk belum dapat diklaim parity/release verified.
