

## Plan: Light Theme Redesign + Data Display Changes

### Changes Overview

**1. Color Theme: White background + light blue components**
- Rewrite CSS variables in `src/index.css` to a light theme: white background, light blue accents, dark text
- Update utility classes (`.glass`, `.ring-surface`, `.surface-card`, `.glow-indigo`) for light mode
- Update gradient references in components from dark-mode colors to light blue tones

**2. Remove stage navigation on stepper clicks**
- `StageFooter.tsx`: Remove the `onClick` handler and `onNavigate` prop from stepper buttons; make them non-interactive indicators only
- `Index.tsx`: Remove `handleNavigate` callback and stop passing `onNavigate` to `StageFooter`

**3. Remove fallback/demo data**
- `Index.tsx`: In the `catch` blocks for both `handleFileUpload` and `handleDeepExtraction`, remove the fake data assignments. Instead, show an error state (e.g., toast or inline message) and stay on the current stage.

**4. Handle missing values as "Not Found"**
- `DataField.tsx`: Update the value rendering logic — if value is `null`, `undefined`, or empty string, display "Not Found" in a muted/italic style.

**5. Redesign data display to horizontal key-value with bigger fonts**
- `DataField.tsx`: Redesign from stacked card to a horizontal row layout: key on the left, value on the right, with larger font sizes (text-base/text-lg).
- `ResultsStage.tsx`: Change grid from `grid-cols-2` to `grid-cols-1` for full-width key-value rows. Apply same layout to Stage 2 (Core Extracted, AI Suggested, Schema Template) and Stage 3 (Deep Extraction).
- Schema Template section: Render as key-value rows instead of raw JSON `<pre>` block.

### Files to Modify
| File | What Changes |
|---|---|
| `src/index.css` | Light theme CSS variables + updated utilities |
| `src/components/StageFooter.tsx` | Remove click navigation, keep as visual indicator |
| `src/pages/Index.tsx` | Remove fallback data, remove `handleNavigate`, add error handling |
| `src/components/DataField.tsx` | Horizontal key-value layout, bigger fonts, "Not Found" for missing values |
| `src/components/ResultsStage.tsx` | Single-column layout, render template as key-value rows |
| `src/components/ConfidenceGauge.tsx` | Update colors for light theme |
| `src/components/DocumentViewer.tsx` | Minor color adjustments for light theme |
| `src/components/ExtractModal.tsx` | Color adjustments for light theme |
| `src/components/UploadStage.tsx` | Color adjustments for light theme |
| `src/components/LoadingSpinner.tsx` | Color adjustments for light theme |

