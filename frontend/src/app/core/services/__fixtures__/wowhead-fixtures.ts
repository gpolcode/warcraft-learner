// Captured-shape Wowhead `?xml` bodies used as deterministic test fixtures.
//
// The item fixture was captured live from the browser (item=260312), confirming
// the real shape: single-line XML, <name> as CDATA, <icon> with a displayId
// attribute and bare slug as text content, <htmlTooltip> CDATA section (large
// inline HTML that should not confuse our element selectors).

/** Real allorigins status block (from a confirmed-working item request). */
export const REAL_STATUS = { url: 'https://www.wowhead.com/item=260312?xml', content_type: 'application/xml; charset=UTF-8', http_code: 200 };

/**
 * Representative item XML slice matching the confirmed live shape.
 * Includes <htmlTooltip> CDATA so we assert querySelector doesn't pick up
 * anything from that noise (CDATA is text, not child elements).
 */
export const ITEM_XML = `<?xml version="1.0" encoding="UTF-8"?><wowhead><item id="260312"><name><![CDATA[Defiant Defender's Drape]]></name><level>108</level><quality id="3">Rare</quality><class id="4"><![CDATA[Armor]]></class><subclass id="-6"><![CDATA[Cloaks]]></subclass><icon displayId="713588">inv_cape_plate_dungeonharronir_c_01</icon><inventorySlot id="16">Back</inventorySlot><htmlTooltip><![CDATA[<table><tr><td><b class="q3">Defiant Defender's Drape</b><span class="q"><br>Item Level 28</span><br>Binds when picked up</td></tr></table>]]></htmlTooltip></item></wowhead>`;

/** Spell XML matching the same shape (CDATA name, displayId icon, trailing .jpg stripped). */
export const SPELL_XML = `<?xml version="1.0" encoding="UTF-8"?><wowhead><spell id="121471"><name><![CDATA[Shadow Blades]]></name><icon displayId="1">ability_rogue_shadowblades.jpg</icon></spell></wowhead>`;

/** A Cloudflare / error HTML page - what the proxy sometimes returns instead of XML. */
export const HTML_ERROR_BODY = `<!DOCTYPE html>
<html><head><title>Just a moment...</title></head>
<body>Checking your browser before accessing wowhead.com</body></html>`;

/** Well-formed XML that simply lacks the requested entity (e.g. unknown id). */
export const EMPTY_WOWHEAD_XML = `<?xml version="1.0" encoding="UTF-8"?><wowhead></wowhead>`;

/** Malformed XML that triggers a DOMParser <parsererror>. */
export const MALFORMED_XML = `<wowhead><item><name>Broken</name>`;
