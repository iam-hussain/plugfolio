/**
 * THE BACK ROOM (DESIGN styles.css §"THE BACK ROOM", dashboard.html) — the
 * creator's dashboard, post editor and product editor.
 *
 * Operate mode, not Express mode: dense rows, visible labels, edits that save
 * where you made them. None of it is ever seen by a shopper, which is why it
 * looks nothing like the public surface — the public page is a photograph with
 * a price pinned to it; this is a list you scan.
 *
 * This module is a thin aggregator over the concern-focused siblings:
 * `./back-room-dashboard` (shell, page scaffolding, cards, home),
 * `./back-room-rows` (list filters, state pills, icon/mini actions) and
 * `./back-room-editor` (form fields, managers, danger zone). Import any of them
 * from the barrel `@plugfolio/ui`, never from a deep path.
 */
export * from "./back-room-dashboard";
export * from "./back-room-rows";
export * from "./back-room-editor";
