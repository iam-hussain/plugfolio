/**
 * THE TWO EDITORS (DESIGN post-edit.html + product-edit.html).
 *
 * A post and a product each get their own page. This module is a thin
 * aggregator: the editor layout scaffolding lives in `./dash-editor-layout`
 * and the interactive field controls in `./dash-editor-fields`. Import either
 * from the package barrel `@plugfolio/ui`, never from a deep path.
 */
export * from "./dash-editor-layout";
export * from "./dash-editor-fields";
