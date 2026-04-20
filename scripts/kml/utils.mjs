import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { XMLParser } from 'fast-xml-parser';

export const APPROVED_CATEGORIES = [
  'Mental Health & Wellbeing',
  'Carer Support',
  'Health & Medical Support',
  'Advice & Guidance',
  'Housing & Homelessness',
  'Food & Essentials',
  'Family & Children',
  'Older People Support',
  'Disability & Accessibility',
  'Community Groups & Social Connection',
  'Faith & Spiritual Support',
  'Employment & Skills',
  'Crisis & Safety Support',
  'Transport & Access',
  'Nature, Activity & Outdoors',
];

const CATEGORY_RULES = [
  { target: 'Health & Medical Support', keywords: ['clinical', 'gp', 'medical', 'hospital', 'pharmacy', 'nhs', 'surgery', 'health centre'] },
  { target: 'Mental Health & Wellbeing', keywords: ['mental health', 'wellbeing', 'trauma', 'therapy', 'counselling', 'counseling', 'mind', 'anxiety'] },
  { target: 'Carer Support', keywords: ['carer', 'caregiver', 'caring', 'respite'] },
  { target: 'Advice & Guidance', keywords: ['advice', 'guidance', 'information', 'legal', 'benefits advice', 'money advice'] },
  { target: 'Housing & Homelessness', keywords: ['housing', 'homeless', 'shelter', 'tenancy'] },
  { target: 'Food & Essentials', keywords: ['food bank', 'food', 'essentials', 'pantry'] },
  { target: 'Family & Children', keywords: ['family', 'children', 'child', 'parent', 'nursery', 'school'] },
  { target: 'Older People Support', keywords: ['older people', 'elderly', 'age uk', 'dementia', 'retirement'] },
  { target: 'Disability & Accessibility', keywords: ['disability', 'disabled', 'accessibility', 'autism', 'neurodiversity'] },
  { target: 'Community Groups & Social Connection', keywords: ['community', 'group', 'social', 'club', 'network', 'friendship'] },
  { target: 'Faith & Spiritual Support', keywords: ['faith', 'church', 'chapel', 'spiritual', 'pastoral', 'mosque', 'temple'] },
  { target: 'Employment & Skills', keywords: ['employment', 'skills', 'training', 'job', 'work'] },
  { target: 'Crisis & Safety Support', keywords: ['crisis', 'safety', 'domestic abuse', 'abuse', 'violence', 'safeguard'] },
  { target: 'Transport & Access', keywords: ['transport', 'travel', 'bus', 'mobility', 'access'] },
  { target: 'Nature, Activity & Outdoors', keywords: ['nature', 'outdoors', 'walking', 'activity', 'sports', 'garden'] },
];

const BAD_CHAR_MAP = [
  ['Â', ''],
  ['Ã©', 'e'],
  ['Ã£', 'a'],
  ['Ã±', 'n'],
  ['Ã', ''],
  ['â€™', "'"],
  ['â€˜', "'"],
  ['â€œ', '"'],
  ['â€�', '"'],
  ['â€“', '-'],
  ['â€”', '-'],
  ['Â£', 'GBP'],
  ['\u00A0', ' '],
];

export const DEFAULT_KML_PATH = path.resolve(process.cwd(), '..', 'Kernow Resources.kml');

export const asArray = (value) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

const toText = (value) => {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object') {
    if (typeof value.cdata === 'string') return value.cdata;
    if (typeof value['#text'] === 'string') return value['#text'];
    for (const nested of Object.values(value)) {
      const text = toText(nested);
      if (text) return text;
    }
  }
  return '';
};

const decodeHtmlEntities = (input) => input
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;/gi, "'");

export const normalizeText = (input) => {
  let output = decodeHtmlEntities(input || '');
  for (const [bad, good] of BAD_CHAR_MAP) {
    output = output.split(bad).join(good);
  }
  return output
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[\t\r]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ ]{2,}/g, ' ')
    .trim();
};

export const slugify = (value) => normalizeText(value)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')
  .slice(0, 110);

const extractCoordinates = (placemark) => {
  const value = toText(placemark?.Point?.coordinates || placemark?.coordinates);
  if (!value) return { lng: null, lat: null };

  const [lngRaw, latRaw] = value.split(',').map((part) => part?.trim());
  const lng = Number(lngRaw);
  const lat = Number(latRaw);

  return {
    lng: Number.isFinite(lng) ? lng : null,
    lat: Number.isFinite(lat) ? lat : null,
  };
};

const extractTown = (text, folder) => {
  const source = `${text} ${folder}`;
  const match = source.match(/\b(Penzance|St\.?\s+Ives|Truro|Falmouth|Redruth|Camborne|Helston|Bodmin|Liskeard|Newquay|Hayle|Penryn|Saltash|Launceston|Bude|Wadebridge)\b/i);
  return match ? normalizeText(match[1]) : null;
};

const extractPostcode = (text) => {
  const match = text.match(/\b([A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})\b/i);
  if (!match) return null;
  const compact = match[1].toUpperCase().replace(/\s+/g, '');
  return `${compact.slice(0, compact.length - 3)} ${compact.slice(-3)}`;
};

export const extractContacts = (descriptionText) => {
  const text = normalizeText(descriptionText);
  const websiteMatch = text.match(/https?:\/\/[^\s)]+/i);
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text.match(/(?:\+44\s?\(?0?\)?|0)\d[\d\s]{7,14}\d/);

  const phone = phoneMatch ? phoneMatch[0].replace(/\s+/g, ' ').trim() : null;

  return {
    website: websiteMatch ? websiteMatch[0].trim().replace(/[.,;]+$/, '') : null,
    email: emailMatch ? emailMatch[0].trim().toLowerCase() : null,
    phone,
    town: extractTown(text, ''),
    postcode: extractPostcode(text),
  };
};

export const splitSummaryAndDescription = (text) => {
  const normalized = normalizeText(text);
  if (!normalized) return { summary: null, description: null };

  const lines = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^(w|t|e)\s*:/i.test(line));

  const description = lines.join('\n\n').trim();
  const summary = description ? description.slice(0, 220).trim() : null;

  return {
    summary: summary || null,
    description: description || null,
  };
};

export const mapCategory = ({ rawFolder, rawName, rawDescription }) => {
  const source = `${rawFolder || ''} ${rawName || ''} ${rawDescription || ''}`.toLowerCase();

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((keyword) => source.includes(keyword))) {
      return rule.target;
    }
  }

  return 'Community Groups & Social Connection';
};

const normalizeNameForCompare = (value) => normalizeText(value).toLowerCase().replace(/[^a-z0-9]/g, '');

export const computeDuplicateSignals = (rows, existing) => {
  const seenNameCoords = new Map();
  const seenCoords = new Map();
  const seenWebsite = new Map();
  const seenPhone = new Map();
  const seenPostcode = new Map();

  for (const row of rows) {
    const nameKey = normalizeNameForCompare(row.clean_name || row.raw_name);
    const latKey = Number.isFinite(row.raw_lat) ? row.raw_lat.toFixed(5) : '';
    const lngKey = Number.isFinite(row.raw_lng) ? row.raw_lng.toFixed(5) : '';
    const nameCoordKey = `${nameKey}|${latKey}|${lngKey}`;
    const coordKey = `${latKey}|${lngKey}`;

    if (nameKey && latKey && lngKey) seenNameCoords.set(nameCoordKey, (seenNameCoords.get(nameCoordKey) || 0) + 1);
    if (latKey && lngKey) seenCoords.set(coordKey, (seenCoords.get(coordKey) || 0) + 1);
    if (row.clean_website) seenWebsite.set(row.clean_website.toLowerCase(), (seenWebsite.get(row.clean_website.toLowerCase()) || 0) + 1);
    if (row.clean_phone) seenPhone.set(row.clean_phone, (seenPhone.get(row.clean_phone) || 0) + 1);
    if (row.postcode) seenPostcode.set(row.postcode.toUpperCase(), (seenPostcode.get(row.postcode.toUpperCase()) || 0) + 1);
  }

  const existingNameCoords = new Set(existing.map((item) => `${normalizeNameForCompare(item.name)}|${Number(item.latitude).toFixed(5)}|${Number(item.longitude).toFixed(5)}`));
  const existingCoords = new Set(existing.map((item) => `${Number(item.latitude).toFixed(5)}|${Number(item.longitude).toFixed(5)}`));
  const existingWebsite = new Set(existing.map((item) => (item.website || '').toLowerCase()).filter(Boolean));
  const existingPhone = new Set(existing.map((item) => item.phone).filter(Boolean));
  const existingPostcode = new Set(existing.map((item) => (item.postcode || '').toUpperCase()).filter(Boolean));

  for (const row of rows) {
    const reasons = [];
    const nameKey = normalizeNameForCompare(row.clean_name || row.raw_name);
    const latKey = Number.isFinite(row.raw_lat) ? row.raw_lat.toFixed(5) : '';
    const lngKey = Number.isFinite(row.raw_lng) ? row.raw_lng.toFixed(5) : '';
    const nameCoordKey = `${nameKey}|${latKey}|${lngKey}`;
    const coordKey = `${latKey}|${lngKey}`;

    if (nameKey && latKey && lngKey && (seenNameCoords.get(nameCoordKey) || 0) > 1) reasons.push('same_name_coordinates_in_batch');
    if (latKey && lngKey && (seenCoords.get(coordKey) || 0) > 1) reasons.push('same_coordinates_in_batch');
    if (row.clean_website && (seenWebsite.get(row.clean_website.toLowerCase()) || 0) > 1) reasons.push('same_website_in_batch');
    if (row.clean_phone && (seenPhone.get(row.clean_phone) || 0) > 1) reasons.push('same_phone_in_batch');
    if (row.postcode && (seenPostcode.get(row.postcode.toUpperCase()) || 0) > 1) reasons.push('same_postcode_in_batch');

    if (nameKey && latKey && lngKey && existingNameCoords.has(nameCoordKey)) reasons.push('same_name_coordinates_live');
    if (latKey && lngKey && existingCoords.has(coordKey)) reasons.push('same_coordinates_live');
    if (row.clean_website && existingWebsite.has(row.clean_website.toLowerCase())) reasons.push('same_website_live');
    if (row.clean_phone && existingPhone.has(row.clean_phone)) reasons.push('same_phone_live');
    if (row.postcode && existingPostcode.has(row.postcode.toUpperCase())) reasons.push('same_postcode_live');

    for (const candidate of rows) {
      if (candidate === row) continue;
      const candidateName = normalizeNameForCompare(candidate.clean_name || candidate.raw_name);
      if (!candidateName || !nameKey) continue;
      if (Math.min(candidateName.length, nameKey.length) < 10) continue;
      if (candidateName.includes(nameKey) || nameKey.includes(candidateName)) {
        reasons.push('similar_name_in_batch');
        break;
      }
    }

    row.duplicate_reasons = reasons;
    row.duplicate_flag = reasons.length > 0;
  }
};

export const computeConfidence = (row) => {
  let score = 100;

  if (!row.clean_name) score -= 30;
  if (!row.clean_slug) score -= 10;
  if (!row.mapped_category) score -= 15;
  if (!row.clean_description && !row.clean_summary) score -= 15;
  if (!Number.isFinite(row.raw_lat) || !Number.isFinite(row.raw_lng)) score -= 20;
  if (!row.clean_website && !row.clean_phone && !row.clean_email) score -= 10;
  if (row.duplicate_flag) score -= 20;

  const normalizedDesc = row.raw_description || '';
  if (/[ÂÃâ€]/.test(normalizedDesc)) score -= 5;

  score = Math.max(0, Math.min(100, score));

  row.confidence_score = score;
  row.needs_review = score < 75 || row.duplicate_flag;
  row.approved_for_import = !row.needs_review;
};

const walkFolder = (folder, folderPath, output) => {
  const currentName = normalizeText(toText(folder?.name));
  const currentPath = [...folderPath, currentName].filter(Boolean);

  for (const placemark of asArray(folder?.Placemark)) {
    output.push({ placemark, folderPath: currentPath.join(' > ') });
  }

  for (const nested of asArray(folder?.Folder)) {
    walkFolder(nested, currentPath, output);
  }
};

export const parseKmlFile = async (kmlPath) => {
  const xml = await fs.readFile(kmlPath, 'utf-8');
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    parseTagValue: false,
    trimValues: false,
    cdataPropName: 'cdata',
  });

  const parsed = parser.parse(xml);
  const document = parsed?.kml?.Document || parsed?.Document;
  if (!document) throw new Error('Unable to find KML Document node.');

  const placements = [];

  for (const folder of asArray(document?.Folder)) {
    walkFolder(folder, [], placements);
  }

  for (const placemark of asArray(document?.Placemark)) {
    placements.push({ placemark, folderPath: '' });
  }

  return placements.map(({ placemark, folderPath }, index) => {
    const rawName = normalizeText(toText(placemark?.name));
    const rawDescription = toText(placemark?.description);
    const { lat, lng } = extractCoordinates(placemark);
    const contact = extractContacts(rawDescription);
    const text = normalizeText(rawDescription);
    const split = splitSummaryAndDescription(text);

    return {
      raw_name: rawName || null,
      raw_folder: folderPath || null,
      raw_description: rawDescription || null,
      raw_lat: Number.isFinite(lat) ? lat : null,
      raw_lng: Number.isFinite(lng) ? lng : null,
      raw_data_json: placemark,
      parse_status: rawName ? 'parsed' : 'parse_error',
      clean_name: rawName || null,
      clean_slug: rawName ? slugify(rawName) : null,
      clean_summary: split.summary,
      clean_description: split.description,
      clean_website: contact.website,
      clean_phone: contact.phone,
      clean_email: contact.email,
      town: contact.town || extractTown(text, folderPath),
      postcode: contact.postcode,
      mapped_category: mapCategory({ rawFolder: folderPath, rawName, rawDescription: text }),
      subcategory: folderPath || null,
      duplicate_flag: false,
      duplicate_reasons: [],
      source_reference: `kml-row-${index + 1}`,
      confidence_score: 0,
      needs_review: true,
      approved_for_import: false,
    };
  });
};

export const createBatchCode = () => {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-');
  return `kml-${stamp}`;
};

export const chunk = (items, size) => {
  const output = [];
  for (let index = 0; index < items.length; index += size) {
    output.push(items.slice(index, index + size));
  }
  return output;
};
