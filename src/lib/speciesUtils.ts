/**
 * Állatfajta fordító és normalizáló segédfüggvény
 * Magyar és angol nyelvű megjelenítéshez
 */

export function getTranslatedSpecies(species: string | undefined | null, lang: 'hu' | 'en' = 'hu'): string {
  if (!species || !species.trim()) {
    return lang === 'en' ? 'Unknown animal' : 'Ismeretlen állat';
  }

  const s = species.trim();
  const lower = s.toLowerCase();

  // Magyar nyelv esetén
  if (lang === 'hu') {
    if (lower === 'dog') return 'Kutya';
    if (lower === 'cat') return 'Macska';
    if (lower === 'wild animal' || lower === 'wild') return 'Vadállat';
    if (lower === 'other') return 'Egyéb';
    if (lower === 'unknown animal') return 'Ismeretlen állat';
    if (lower === 'bird') return 'Madár';
    if (lower === 'horse') return 'Ló';
    if (lower === 'hedgehog') return 'Sün';
    return s;
  }

  // Angol nyelv esetén
  if (/^(kutya|dog)$/i.test(s)) return 'Dog';
  if (/^(macska|cica|cat)$/i.test(s)) return 'Cat';
  if (/^(vadállat|vadallat|wild animal|wild)$/i.test(s)) return 'Wild Animal';
  if (/^(egyéb|egyeb|other)$/i.test(s)) return 'Other';
  if (/^(ismeretlen állat|ismeretlen allat|unknown animal)$/i.test(s)) return 'Unknown animal';

  // Egyéb gyakori fajták
  if (/^(madár|madar|bird)$/i.test(s)) return 'Bird';
  if (/^(ló|lo|horse)$/i.test(s)) return 'Horse';
  if (/^(sün|sünike|sun|hedgehog)$/i.test(s)) return 'Hedgehog';
  if (/^(róka|roka|fox)$/i.test(s)) return 'Fox';
  if (/^(őz|oz|deer)$/i.test(s)) return 'Deer';
  if (/^(nyúl|nyul|rabbit)$/i.test(s)) return 'Rabbit';

  // Ha a fajtamegnevezés előtagként szerepel (pl. "Kutya (labrador)" -> "Dog (labrador)")
  if (/^kutya\b/i.test(s)) {
    return s.replace(/^kutya/i, 'Dog');
  }
  if (/^(macska|cica)\b/i.test(s)) {
    return s.replace(/^(macska|cica)/i, 'Cat');
  }
  if (/^(vadállat|vadallat)\b/i.test(s)) {
    return s.replace(/^(vadállat|vadallat)/i, 'Wild Animal');
  }
  if (/^(egyéb|egyeb)\b/i.test(s)) {
    return s.replace(/^(egyéb|egyeb)/i, 'Other');
  }

  return s;
}
