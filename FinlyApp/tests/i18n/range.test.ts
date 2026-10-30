import { describe, expect, it } from 'vitest';
import { en } from '../../src/i18n/en';
import { es } from '../../src/i18n/es';
import { ca } from '../../src/i18n/ca';
import { gl } from '../../src/i18n/gl';
import { eu } from '../../src/i18n/eu';
import { fr } from '../../src/i18n/fr';
import { de } from '../../src/i18n/de';
import { pt } from '../../src/i18n/pt';
import { it as itLocale } from '../../src/i18n/it';

const cases = [
  { code: 'en', locale: en, start: 'From 1 January', end: 'to 22 October 2026' },
  { code: 'es', locale: es, start: 'Desde el 1 de Enero', end: 'hasta el 22 de Octubre de 2026' },
  { code: 'ca', locale: ca, start: 'Des de l\'1 de Gener', end: 'fins al 22 d\'Octubre de 2026' },
  { code: 'gl', locale: gl, start: 'Desde o 1 de Xaneiro', end: 'ata o 22 de Outubro de 2026' },
  { code: 'eu', locale: eu, start: 'Urtarrilaren 1etik', end: '2026ko Urriaren 22era' },
  { code: 'fr', locale: fr, start: 'Du 1er Janvier', end: 'au 22 Octobre 2026' },
  { code: 'de', locale: de, start: 'Vom 1. Januar', end: 'bis zum 22. Oktober 2026' },
  { code: 'pt', locale: pt, start: 'De 1 de Janeiro', end: 'até 22 de Outubro de 2026' },
  { code: 'it', locale: itLocale, start: 'Dal 1° Gennaio', end: 'al 22 Ottobre 2026' },
];

describe('localised custom date ranges', () => {
  it.each(cases)('$code starts with a capital and uses the standard connectors', ({ locale, start, end }) => {
    expect(locale.cal_range_start(1, locale.months[0])).toBe(start);
    expect(locale.cal_range_end(22, locale.months[9], 2026)).toBe(end);
  });
});
