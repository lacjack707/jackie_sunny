/**
 * Tangerine offerings Sunny can introduce, built from curated and structured
 * catalogue data. Showing an offering means it is optional to explore based on
 * what the customer said, never that it is suitable or best.
 */
import { getEntry } from './knowledge.ts';
import { offerIsCurrentAsOf, TANGERINE_CATALOGUE, TANGERINE_OFFERS, type CatalogueOffer } from './catalogue.ts';

export type GoalType = 'build_wealth' | 'accessible_interest' | 'first_home' | 'understand_options' | 'other';

export interface Offering {
  id: string;
  name: string;
  /** One-line plain-language description. */
  summary: string;
  features: string[];
  /** Fees, access restrictions and other conditions. */
  conditions: string[];
  risks: string[];
  /** Knowledge-base ids that support every statement above. */
  sources: string[];
  rates?: string[];
  /** Goals this is relevant to explore for (not a suitability judgment). */
  relevantFor: GoalType[];
  availability?: 'available' | 'unconfirmed';
}

export const OFFERINGS: Offering[] = [
  {
    id: 'savings-account',
    name: 'Tangerine Savings Account',
    summary: 'Keeps money accessible while it earns interest.',
    features: ['No monthly fee, no minimum balance', 'Interest calculated daily, paid monthly (rates can change)', 'Up to 10 savings accounts for separate goals', 'Automatic Savings Program you can change or cancel'],
    conditions: ['A fee applies to transfers to another financial institution'],
    risks: ['Interest may not keep up with rising costs'],
    sources: ['tng-savings-account', 'tng-saving-vs-investing'],
    relevantFor: ['accessible_interest', 'first_home', 'understand_options', 'other'],
  },
  {
    id: 'moneyback-card',
    name: 'Tangerine Money-Back Credit Card',
    summary: 'Cash-back credit card with customer-selected accelerated earn categories.',
    features: ['Choose cash-back categories from the options Tangerine currently offers', 'Cash back applies to eligible purchases under the card terms'],
    conditions: ['Credit approval required; applying includes a credit check', 'Purchase and cash-advance rates, annual fee and other charges can apply; verify current application terms'],
    risks: ['Interest and fees can outweigh rewards if you carry a balance', 'Approval is not guaranteed'],
    sources: ['tng-catalogue-moneyback-card'],
    relevantFor: ['understand_options', 'other'],
  },
  {
    id: 'tfsa',
    name: 'Tangerine TFSA (savings, GIC or investment funds)',
    summary: 'A tax-free account; what you hold inside it can be savings, a GIC or investment funds.',
    features: ['TFSA Savings Account, Tax-Free GIC, or Tax-Free Investment Fund Account', 'Growth generally tax-free; withdraw any time', 'No fees while funds stay with Tangerine'],
    conditions: ['You’re responsible for staying within your contribution room', 'A fee applies when transferring out to another institution'],
    risks: ['Risk depends on the holding: savings and GICs differ from investment funds'],
    sources: ['tng-tfsa-options', 'gov-tfsa'],
    relevantFor: ['build_wealth', 'accessible_interest', 'first_home', 'understand_options', 'other'],
  },
  {
    id: 'rsp',
    name: 'Tangerine RSP (savings, GIC or investment funds)',
    summary: 'A registered retirement account with tax-deductible contributions.',
    features: ['RSP Savings Account, RSP GIC, or RSP Investment Fund Account', 'Contributions tax deductible; growth tax-deferred'],
    conditions: ['Withdrawals are taxable income, with tax withheld', '$50 fee to transfer an RSP to another institution'],
    risks: ['Risk depends on the holding inside the account'],
    sources: ['tng-rsp-options', 'gov-rrsp'],
    relevantFor: ['build_wealth', 'understand_options'],
  },
  {
    id: 'gic',
    name: 'Tangerine GICs',
    summary: 'Your principal back at the end of a set term, plus interest.',
    features: ['Terms from short (e.g. 90 days) to multiple years', 'No minimum to open', 'Available in a TFSA, RSP, RIF or non-registered'],
    conditions: ['Not cashable before maturity, except approved financial-hardship redemptions'],
    risks: ['Money is locked in for the term'],
    sources: ['tng-gic', 'fcac-gic-rights'],
    relevantFor: ['build_wealth', 'accessible_interest', 'first_home', 'understand_options'],
  },
  {
    id: 'investment-funds',
    name: 'Tangerine Investment Funds',
    summary: 'Diversified mutual-fund portfolios for longer-term investing.',
    features: ['Core, Global ETF and Socially Responsible Global portfolios; Money Market Fund', 'Can be held in a TFSA, RSP, RIF or non-registered account'],
    conditions: [
      'Management fees: 0.80% Core, 0.50% Global ETF, 0.55% Socially Responsible, plus a 0.15% administration fee and other fund expenses',
      'Read the prospectus before investing',
    ],
    risks: ['Not guaranteed and not CDIC-insured', 'Values change frequently; you can lose money'],
    sources: ['tng-investment-funds', 'cdic-coverage'],
    relevantFor: ['build_wealth', 'understand_options'],
  },
  {
    id: 'advisors',
    name: 'Tangerine Advisors',
    summary: 'Phone or video consultations about investing and financial planning.',
    features: ['No-obligation investment consultation', 'Book online (not in this prototype)', 'Tangerine says advisors aren’t paid commissions based on what you choose'],
    conditions: ['Advice fees or minimums aren’t stated on Tangerine’s page'],
    risks: [],
    sources: ['tng-advisors'],
    relevantFor: ['build_wealth', 'understand_options'],
  },
];

const ALREADY_CURATED = new Set(['savings', 'tfsa', 'rsp', 'gic', 'investment-funds', 'moneyback-card']);
const catalogueOfferings: Offering[] = TANGERINE_CATALOGUE
  .filter((product) => !ALREADY_CURATED.has(product.id))
  .map((product) => ({
    id: product.id,
    name: product.name,
    summary: product.summary,
    features: product.customerFit,
    conditions: [...product.eligibility, ...product.fees, ...product.limitations],
    risks: [],
    sources: [
      product.sourceId,
      ...product.relatedSourceIds.filter((sourceId) => getEntry(sourceId)?.kind === 'tangerine'),
    ],
    rates: product.rates.map((rate) =>
      `${rate.label}: ${rate.value ?? 'check Tangerine’s current rates page'}. ${rate.notes}`,
    ),
    relevantFor: ['understand_options', 'other'] as GoalType[],
    availability: product.availability,
  }));
OFFERINGS.push(...catalogueOfferings);

for (const product of TANGERINE_CATALOGUE) {
  const offeringId = product.id === 'savings' ? 'savings-account' : product.id;
  const offering = OFFERINGS.find((item) => item.id === offeringId);
  if (!offering) continue;
  offering.summary = product.summary;
  offering.features = product.customerFit;
  offering.conditions = [...product.eligibility, ...product.fees, ...product.limitations];
  offering.sources = [
    product.sourceId,
    ...product.relatedSourceIds.filter((id) => getEntry(id)?.kind === 'tangerine'),
    ...offering.sources.filter(
      (id) => id !== product.sourceId && !product.relatedSourceIds.includes(id) && getEntry(id)?.kind === 'tangerine',
    ),
  ];
  offering.rates = product.rates.map((rate) =>
    `${rate.label}: ${rate.value ?? 'check Tangerine’s current rates page'}. ${rate.notes}`,
  );
  offering.availability = product.availability;
}

const BY_ID = new Map(OFFERINGS.map((o) => [o.id, o]));
const OFFER_BY_ID = new Map(TANGERINE_OFFERS.map((offer) => [offer.id, offer]));
const NAMED_PRODUCT_PATTERNS: [string, RegExp][] = [
  ['savings-account', /savings account/],
  ['chequing', /\bchequing\b|\bchecking\b|payroll|direct deposit|debit card/],
  ['usd-savings', /\b(?:us|u\.s\.) dollars?\b|\busd\b/],
  ['tfsa', /tfsa|tax.free/],
  ['rsp', /\brr?sp\b|retirement/],
  ['rif', /\brif\b|retirement income fund/],
  ['gic', /\bgics?\b|guaranteed/],
  ['investment-funds', /fund|portfolio|etf|invest/],
  ['moneyback-card', /money.?back(?!\s+world)|cash.?back|credit card/],
  ['moneyback-world-card', /world mastercard|money.?back world/],
  ['rewards-world-elite', /world elite|scene\+|rewards mastercard/],
  ['mortgage', /mortgage|home loan/],
  ['heloc', /\bheloc\b|home equity/],
  ['line-of-credit', /line of credit|credit line/],
  ['rsp-loan', /rrsp loan|rsp loan|borrow.{0,20}(?:rrsp|rsp)/],
  ['fhsa-status', /\bfhsa\b|first.home savings account/],
  ['advisors', /advis|person|talk to/],
];
const RECOMMENDATION_IDS = new Set([
  'savings-account',
  'moneyback-card',
  'tfsa',
  'rsp',
  'gic',
  'investment-funds',
  'advisors',
]);

export function getOffering(id: string): Offering | undefined {
  return BY_ID.get(id);
}

export function getCatalogueOffer(id: string): CatalogueOffer | undefined {
  return OFFER_BY_ID.get(id);
}

export function namedOfferingIds(text: string): string[] {
  const normalized = text.toLowerCase();
  return NAMED_PRODUCT_PATTERNS.filter(([, pattern]) => pattern.test(normalized)).map(([id]) => id);
}

/** Match only current offers whose stated qualifying facts the customer explicitly confirmed. */
export function eligiblePromotionIds(
  productIds: string[],
  customerText: string,
  asOf = new Date().toISOString().slice(0, 10),
): string[] {
  const text = customerText.toLowerCase();
  const newToTangerine = /\b(?:new to tangerine|new tangerine (?:client|customer)|never had (?:a )?tangerine account|never banked with tangerine)\b/.test(text);
  const payrollMove = /\b(?:payroll|direct deposit|pay)\b/.test(text) && /\b(?:move|switch|set up|change|redirect)\b/.test(text);
  const neverHadTangerineCard = /\bnever (?:had|held|owned|opened).{0,35}\b(?:tangerine )?(?:credit card|money.?back card)\b/.test(text);
  const ids: string[] = [];
  if (newToTangerine && payrollMove && productIds.includes('chequing')) ids.push('chequing-payroll-bonus');
  if (neverHadTangerineCard && productIds.includes('moneyback-card')) ids.push('moneyback-ten-percent');
  return ids.filter((id) => {
    const offer = OFFER_BY_ID.get(id);
    return offer && offerIsCurrentAsOf(offer, asOf);
  });
}

export const SIGNUP_PRODUCT_IDS = ['savings-account', 'moneyback-card'] as const;
export type SignupProductId = (typeof SIGNUP_PRODUCT_IDS)[number];

export function isSignupProductId(id: string): id is SignupProductId {
  return SIGNUP_PRODUCT_IDS.includes(id as SignupProductId);
}

export function signupProductFromText(text: string): SignupProductId | null {
  const t = text.toLowerCase();
  if (/\b(?:credit card|money.?back card|cash.?back card)\b/.test(t)) return 'moneyback-card';
  if (/\b(?:savings account|save account)\b/.test(t)) return 'savings-account';
  return null;
}

export function wantsToStartSignup(text: string): boolean {
  return /\b(?:open|apply|sign.?up|start (?:an? )?(?:application|account)|get started|interested in|ready to|want to (?:open|apply|sign up|get|start)|would like to (?:open|apply|sign up|get|start)|want (?:a|an|the) (?:new )?(?:credit card|savings account))\b/i.test(text);
}

export function resolveSignupProduct(
  text: string,
  previousSunny: string[],
  offeringsShown: string[],
): SignupProductId | null {
  if (!wantsToStartSignup(text)) return null;
  const explicit = signupProductFromText(text);
  if (explicit) return explicit;
  for (const previous of previousSunny) {
    const suggested = signupProductFromText(previous);
    if (suggested && offeringsShown.includes(suggested)) return suggested;
  }
  return null;
}

export function signupChecklist(id: SignupProductId): string[] {
  if (id === 'savings-account') {
    return [
      'Review the current variable interest rate and account terms on Tangerine’s page.',
      'Tangerine says a SIN is required to open an interest-earning account online.',
      'The account has no monthly fee or minimum balance; confirm any applicable transaction fees.',
    ];
  }
  return [
    'Credit approval is required and is not guaranteed; applying involves a credit check.',
    'Review the current purchase rate, annual fee, rewards categories and full cardholder terms before applying.',
    'Cash advances and carrying a balance can cost more than the rewards earned.',
  ];
}

/** Keep only real offering ids, de-duplicated, in order. */
export function validateOfferingIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  const out: string[] = [];
  for (const id of ids) if (typeof id === 'string' && BY_ID.has(id) && !out.includes(id)) out.push(id);
  return out.slice(0, OFFERINGS.length);
}

/** Offerings relevant to explore for a goal, in catalogue order. */
export function offeringsFor(goal: GoalType | null): Offering[] {
  return OFFERINGS.filter((o) => RECOMMENDATION_IDS.has(o.id) && o.relevantFor.includes(goal ?? 'understand_options'));
}

/** The official page for an offering (first source). */
export function offeringUrl(o: Offering): string | undefined {
  return getEntry(o.sources[0])?.url;
}

export function offeringRecommendationReason(
  id: string,
  goal: GoalType | null,
  horizon: HorizonType | null,
): string {
  if (id === 'chequing') {
    return 'You asked about Tangerine Chequing, so this is a specific account to explore for everyday banking and payroll; check the current fee schedule and account terms.';
  }
  if (id === 'moneyback-card') {
    return 'You asked about Tangerine credit cards, so the Money-Back Credit Card is a specific card to explore; approval is required and interest can outweigh rewards.';
  }
  if (id === 'fhsa-status') {
    return 'You asked about an FHSA. Tangerine availability is unconfirmed, so this is an information note—not an available Tangerine product or an application option.';
  }
  if (id === 'investment-funds') {
    const timeframe = goal === 'build_wealth' && horizon === 'over_5_years'
      ? 'You said you want to build wealth over a longer timeframe'
      : goal === 'build_wealth' && horizon === '1_to_5_years'
        ? 'You said you want to build wealth and have a one-to-five-year timeframe'
        : goal === 'build_wealth' || goal === 'understand_options'
          ? 'You said you want to learn about investing'
          : horizon === 'over_5_years'
            ? 'You said this is a longer-term goal'
            : 'This is a specific Tangerine investment product you asked to explore';
    return `${timeframe}, so Tangerine Investment Funds is a specific Tangerine product to explore first. Its diversified mutual-fund portfolios can lose value; I’m not telling you whether to invest or selecting a portfolio for you.`;
  }
  if (id === 'savings-account') {
    const reason = goal === 'first_home'
      ? 'You’re saving toward a first home; Tangerine FHSA availability is unconfirmed, so this is a currently verified savings option to compare'
      : horizon === 'under_1_year'
        ? 'You may need the money within a year'
        : goal === 'accessible_interest'
          ? 'You said access and earning interest matter'
          : 'As a general starting point, you can explore this if access and variable interest matter to you';
    return `${reason}, so the Tangerine Savings Account is a specific product to explore first. It keeps savings accessible while earning variable interest, and its rate can change.`;
  }
  if (id === 'gic') {
    return 'A Tangerine GIC is a specific product to explore if you can leave the money for a set term; it is generally locked in until maturity.';
  }
  if (id === 'tfsa') {
    return 'A Tangerine TFSA is a specific account to explore for its tax treatment, but the account can hold different products with different access and risk. Check contribution room and the current account details.';
  }
  if (id === 'rsp') {
    return 'A Tangerine RSP is a specific retirement account to explore; contributions and withdrawals have tax consequences, so consider your circumstances and the current terms.';
  }
  if (id === 'advisors') {
    return 'Tangerine Advisors can discuss your goals and investment questions; this prototype cannot assess suitability or book a consultation.';
  }
  const product = getOffering(id);
  return product
    ? `You asked about ${product.name}; this official Tangerine information is here to help you explore it. Any choice is yours.`
    : 'This is an optional Tangerine product to explore; any choice is yours.';
}

export type HorizonType = 'under_1_year' | '1_to_5_years' | 'over_5_years' | 'not_sure';
export type Emphasis = 'access' | 'balanced' | 'growth' | 'flexible';

export interface OfferingPlan {
  ids: string[];
  emphasis: Emphasis;
  featuredId: string;
}

const SHORT_TERM = ['savings-account', 'gic', 'tfsa'];

/**
 * Deterministic rule for the *initial* product exploration, used by both the
 * scripted engine and the server tool. It decides what's relevant to learn
 * about first given the customer's stated goal and timeline. It is not a
 * suitability decision or an allocation, and the full catalogue stays one
 * click away ("Browse all Tangerine offerings").
 *  - Within a year: access and stability first (savings, GIC terms and restrictions, TFSA savings).
 *  - 1–5 years: access and stability, plus investment funds only if the goal is building wealth or understanding options.
 *  - More than 5 years: the goal's full set, which can include investment education and funds.
 *  - Not sure / not stated: flexible options while the timeline is clarified.
 */
export function offeringPlan(goal: GoalType | null, horizon: HorizonType | null): OfferingPlan {
  if (horizon === 'under_1_year') return { ids: SHORT_TERM, emphasis: 'access', featuredId: 'savings-account' };
  if (horizon === '1_to_5_years') {
    const growth = goal === 'build_wealth' || goal === 'understand_options';
    const ids = growth ? [...SHORT_TERM, 'investment-funds'] : SHORT_TERM;
    return { ids, emphasis: 'balanced', featuredId: goal === 'build_wealth' ? 'investment-funds' : 'savings-account' };
  }
  if (horizon === 'over_5_years') {
    const ids = offeringsFor(goal).map((o) => o.id);
    const featuredId = goal === 'build_wealth' ? 'investment-funds' : goal === 'first_home' || goal === 'accessible_interest' ? 'savings-account' : 'tfsa';
    return { ids: [featuredId, ...ids.filter((id) => id !== featuredId)], emphasis: goal === 'build_wealth' ? 'growth' : 'balanced', featuredId };
  }
  return { ids: SHORT_TERM, emphasis: 'flexible', featuredId: 'savings-account' };
}
