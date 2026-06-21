// Captured-shape Wowhead `?xml` bodies used as deterministic test fixtures.
//
// These mirror the documented Wowhead XML shape (root `<wowhead>`, an `<item>`
// or `<spell>` element, `<name>` as CDATA, `<icon>` as a bare slug). Replace the
// strings with a real capture from `scripts/probe-wowhead.mjs` (or the browser
// devtools snippet) if the live shape ever differs - the tests will then assert
// against ground truth.

/** Item with a CDATA name and a plain-text icon slug (the common shape). */
export const ITEM_XML = `<?xml version="1.0" encoding="UTF-8"?>
<wowhead>
  <item id="260312" name="Gaze of the Alnseer">
    <name><![CDATA[Gaze of the Alnseer]]></name>
    <quality id="4"><![CDATA[Epic]]></quality>
    <icon displayId="123456">inv_misc_eye_01</icon>
  </item>
</wowhead>`;

/** Spell with a plain (non-CDATA) name and an icon slug carrying a .jpg suffix. */
export const SPELL_XML = `<?xml version="1.0" encoding="UTF-8"?>
<wowhead>
  <spell id="121471">
    <name>Shadow Blades</name>
    <icon displayId="1">ability_rogue_shadowblades.jpg</icon>
  </spell>
</wowhead>`;

/** A Cloudflare / error HTML page - what the proxy sometimes returns instead of XML. */
export const HTML_ERROR_BODY = `<!DOCTYPE html>
<html><head><title>Just a moment...</title></head>
<body>Checking your browser before accessing wowhead.com</body></html>`;

/** Well-formed XML that simply lacks the requested entity (e.g. unknown id). */
export const EMPTY_WOWHEAD_XML = `<?xml version="1.0" encoding="UTF-8"?>
<wowhead></wowhead>`;

/** Malformed XML that triggers a DOMParser <parsererror>. */
export const MALFORMED_XML = `<wowhead><item><name>Broken</name>`;
