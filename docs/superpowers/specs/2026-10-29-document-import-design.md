# Document import design

Implement the upload flow approved in the conversation. Brief offers manual entry and completed-template upload. Word DOCX and our fillable PDF are supported; arbitrary prose, scanned PDFs, flattened PDFs and old DOC files are not. All parsing runs locally, with no paid API or document upload service.

Read version 1 fields into a proposed draft without changing the open project. Review business details and show page/product counts, actionable validation errors and optional-content warnings. Review edits win over imported brief values. Structured page/section/product content survives into the editor rather than being replaced by the existing starter generator.

Use at most 5 MiB compressed input, 25 MiB expanded DOCX content, 20 pages, 100 additional sections and 40 products. Reject malformed XML, active document content, unsafe links, duplicate IDs, unknown references and invalid prices. Read only form values from PDF and text/field controls from DOCX. Unfilled example response markers are empty content. Text is escaped on output. Images use public HTTPS URLs and retain supplied source credits.

Generate portable components, shared navigation, brand settings, catalogue, galleries, FAQs and footer. Blank optional fields omit public placeholders. Required page headings may fall back to the business or page name. Additional notes are never public copy. PDF records are fixed; Word record groups may repeat. A single catalogue is shared across shop sections, matching the existing builder model; mixed currencies are rejected.

Before replacing an existing website, provide a backup button and an explicit replacement choice. Capture the old project, validate the new project, then apply it transactionally; on failure restore the old project. Failed parsing and Cancel never change canvas or saved data. Successful import remains unsaved until the user saves. Persist an automatic recovery backup only when it fits local storage; do not promise recovery storage succeeded if it failed. Disable the previous project's autosave during the transaction and restore it on failure.

Verify real template round trips, four-page six-product Rama Living import, edited brief precedence, PDF import, invalid file states, cancellation, phone layout, backup restore, ZIP navigation and catalogue arithmetic. Run existing regression checks and deployment checks. Publish to the same GitHub Pages site after verification.
