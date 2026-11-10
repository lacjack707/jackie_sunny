import { describe, expect, it } from 'vitest';
import { CATALOGUE_REFERENCE_SOURCES, offerIsCurrentAsOf, TANGERINE_CATALOGUE, TANGERINE_OFFERS } from './catalogue';
import { getEntry, retrieve } from './knowledge';
import { eligiblePromotionIds, namedOfferingIds, OFFERINGS, offeringsFor, validateOfferingIds } from './offerings';

describe('Tangerine product catalogue', () => {
  it('covers the major personal product families with unique ids and official sources', () => {
    expect(TANGERINE_CATALOGUE.length).toBeGreaterThanOrEqual(15);
    expect(new Set(TANGERINE_CATALOGUE.map((product) => product.id)).size).toBe(TANGERINE_CATALOGUE.length);
    expect(new Set(TANGERINE_CATALOGUE.map((product) => product.sourceId)).size).toBe(TANGERINE_CATALOGUE.length);
    const sourceIds = [
      ...TANGERINE_CATALOGUE.map((product) => product.sourceId),
      ...TANGERINE_OFFERS.map((offer) => offer.sourceId),
      ...CATALOGUE_REFERENCE_SOURCES.map((source) => source.id),
    ];
    expect(new Set(sourceIds).size).toBe(sourceIds.length);
    for (const product of TANGERINE_CATALOGUE) {
      expect(product.sourceUrl).toMatch(/^https:\/\/www\.tangerine\.ca\//);
      expect(product.customerFit.length).toBeGreaterThan(0);
      expect(product.eligibility.length).toBeGreaterThan(0);
      expect(product.rates.length).toBeGreaterThan(0);
      for (const sourceId of product.relatedSourceIds) expect(getEntry(sourceId)).toBeDefined();
    }
    for (const offer of TANGERINE_OFFERS) {
      expect(offer.sourceUrl).toMatch(/^https:\/\/www\.tangerine\.ca\//);
      expect(offer.eligibility.length).toBeGreaterThan(0);
      expect(offer.conditions.length).toBeGreaterThan(0);
    }
    expect(CATALOGUE_REFERENCE_SOURCES.every((source) => source.url.startsWith('https://www.tangerine.ca/'))).toBe(true);
  });

  it('marks FHSA availability as unconfirmed and preserves the official information source', () => {
    const fhsa = TANGERINE_CATALOGUE.find((product) => product.id === 'fhsa-status');
    expect(fhsa?.availability).toBe('unconfirmed');
    expect(fhsa?.sourceUrl).toBe('https://www.tangerine.ca/en/ai-information');
    expect(fhsa?.relatedSourceIds).toContain('gov-fhsa-overview');
    expect(fhsa?.summary).toMatch(/no dedicated FHSA product page or terms were found/i);
  });

  it('makes every verified catalogue product browsable without broadening the recommendation shortlist', () => {
    const browseIds = validateOfferingIds(OFFERINGS.map((offering) => offering.id));
    for (const product of TANGERINE_CATALOGUE) {
      const offeringId = product.id === 'savings' ? 'savings-account' : product.id;
      expect(browseIds).toContain(offeringId);
      const offering = OFFERINGS.find((item) => item.id === offeringId)!;
      expect(offering.rates?.length).toBeGreaterThan(0);
      expect(offering.conditions.length).toBeGreaterThan(0);
      expect(offering.sources[0]).toBe(product.sourceId);
    }
    expect(browseIds.length).toBe(OFFERINGS.length);
    expect(OFFERINGS.find((offering) => offering.id === 'fhsa-status')?.availability).toBe('unconfirmed');
    expect(OFFERINGS.find((offering) => offering.id === 'fhsa-status')?.sources.every((id) => getEntry(id)?.kind === 'tangerine')).toBe(true);
    expect(offeringsFor('accessible_interest').map((offering) => offering.id)).not.toContain('mortgage');
    expect(namedOfferingIds('Tell me about Tangerine mortgages')).toContain('mortgage');
  });

  it('surfaces current promotions only when the customer confirms the relevant eligibility facts', () => {
    expect(eligiblePromotionIds(
      ['chequing'],
      'I am new to Tangerine and want to move my payroll there.',
      '2026-11-09',
    )).toEqual(['chequing-payroll-bonus']);
    expect(eligiblePromotionIds(
      ['moneyback-card'],
      'I have never had a Tangerine credit card.',
      '2026-11-09',
    )).toEqual(['moneyback-ten-percent']);
    expect(eligiblePromotionIds(['chequing'], 'I want to switch my payroll.', '2026-11-09')).toEqual([]);
    expect(eligiblePromotionIds(['moneyback-card'], 'I want a Tangerine credit card.', '2026-11-09')).toEqual([]);
    expect(eligiblePromotionIds(['chequing'], 'I am new to Tangerine and want to move my payroll.', '2026-11-17')).toEqual([]);
  });

  it('keeps current-rate values live and exposes catalogue facts to Sunny retrieval', () => {
    const chequing = TANGERINE_CATALOGUE.find((product) => product.id === 'chequing')!;
    expect(chequing.rates[0].value).toBeNull();
    expect(chequing.relatedSourceIds).toContain('tng-live-rates');
    expect(getEntry(chequing.sourceId)?.conditions.join(' ')).toMatch(/no monthly fee or minimum balance/i);
    expect(retrieve('Tangerine line of credit prime rate', 7, [], false).some((entry) => entry.id === 'tng-catalogue-line-of-credit')).toBe(true);
  });

  it('records promotion conditions and suppresses stale or out-of-window offers', () => {
    const cardOffer = TANGERINE_OFFERS.find((offer) => offer.id === 'moneyback-ten-percent')!;
    expect(cardOffer.endsOn).toBe('2026-11-30');
    expect(cardOffer.conditions.join(' ')).toMatch(/60-day/);
    expect(offerIsCurrentAsOf(cardOffer, '2026-11-09')).toBe(true);
    expect(offerIsCurrentAsOf(cardOffer, '2026-12-01')).toBe(false);
    expect(offerIsCurrentAsOf(cardOffer, '2026-11-17')).toBe(false);
  });
});
