# Editing with Studio drawers — v0.2.2

Studio tools, Pages, Design and the image chooser now share a non-modal tools drawer. The website remains visible and clickable while tools are open. No UI framework or new dependency was added; the implementation uses the browser's native non-modal dialog and original styles.

## Workflow

- On desktop, tools dock on the right. The workspace makes room and temporarily hides its section palette and selection inspector. Closing tools restores the normal editor.
- On phones and smaller tablets, tools become a bottom sheet. The canvas is brought into the visible area above it. The tool header, tabs, close control and full-preview action stay available while the form scrolls.
- New sections, reused sections, inserted pictures and galleries are selected and brought into view. Clicking the canvas leaves the tools open. Applying a brand or page change can be inspected immediately.
- The Studio tools button toggles the drawer and remembers the last tool. Pages and Design still open their corresponding tools directly. Reopening the already active tool does not erase its in-progress fields.
- Use Left/Right arrows, Home and End in the tool tabs. Escape closes tools, including when focus is inside the editable canvas, and returns focus to the opener. Keyboard focus is not trapped in the drawer.
- Full preview and destructive replacement confirmations remain modal. Escape in full preview closes only preview. Reduced-motion preferences are respected.

## Research

Ant Design defines a Drawer as an edge panel for contextual information, forms and actions. MUI distinguishes temporary overlays from persistent drawers that share the page. MDN documents `HTMLDialogElement.show()` as non-modal: surrounding content remains interactive. This implementation combines those patterns for a visual editor rather than importing a React component into the existing vanilla JavaScript app.

- https://ant.design/components/drawer/
- https://mui.com/material-ui/react-drawer/
- https://developer.mozilla.org/en-US/docs/Web/API/HTMLDialogElement/show

The existing app and dependency licenses are unchanged. Documentation was used as design guidance; no third-party drawer source was copied.

## Verification

Recorded browser journeys cover simultaneous canvas/tool interaction, inserted-section visibility, phone layout and overflow, keyboard tabs, iframe Escape, return focus, draft-field preservation, remembered tools and nested preview behavior. The new desktop and phone journeys were first run against v0.2.1 and failed on its blocking modal and centered mobile placement.
