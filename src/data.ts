export type Country = {
  code: string;
  /** ISO 3166-1 alpha-3 — required by Thunes for country filters */
  iso3166Alpha3: string;
  name: string;
  flag: string;
  currency: string;
  currencyLabel: string;
  /** Fallback rate when API offline — 1 USD = n local (legacy / display only) */
  rateFromUsd: number;
  popular?: boolean;
};

export const countries: Country[] = [
  {
    code: "TH",
    iso3166Alpha3: "THA",
    name: "Thailand",
    flag: "🇹🇭",
    currency: "THB",
    currencyLabel: "Thai baht",
    rateFromUsd: 36.5,
    popular: true,
  },
  {
    code: "PH",
    iso3166Alpha3: "PHL",
    name: "Philippines",
    flag: "🇵🇭",
    currency: "PHP",
    currencyLabel: "Philippine peso",
    rateFromUsd: 58.2,
    popular: true,
  },
  {
    code: "MX",
    iso3166Alpha3: "MEX",
    name: "Mexico",
    flag: "🇲🇽",
    currency: "MXN",
    currencyLabel: "Mexican peso",
    rateFromUsd: 17.1,
    popular: true,
  },
  {
    code: "IN",
    iso3166Alpha3: "IND",
    name: "India",
    flag: "🇮🇳",
    currency: "INR",
    currencyLabel: "Indian rupee",
    rateFromUsd: 83.4,
  },
  {
    code: "NG",
    iso3166Alpha3: "NGA",
    name: "Nigeria",
    flag: "🇳🇬",
    currency: "NGN",
    currencyLabel: "Nigerian naira",
    rateFromUsd: 1550,
  },
  {
    code: "BR",
    iso3166Alpha3: "BRA",
    name: "Brazil",
    flag: "🇧🇷",
    currency: "BRL",
    currencyLabel: "Brazilian real",
    rateFromUsd: 5.05,
  },
  {
    code: "VN",
    iso3166Alpha3: "VNM",
    name: "Vietnam",
    flag: "🇻🇳",
    currency: "VND",
    currencyLabel: "Vietnamese dong",
    rateFromUsd: 25400,
  },
  {
    code: "CO",
    iso3166Alpha3: "COL",
    name: "Colombia",
    flag: "🇨🇴",
    currency: "COP",
    currencyLabel: "Colombian peso",
    rateFromUsd: 3950,
  },
];

export const sendCurrencies = [
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
];

/** Thunes uses alpha-3 for sender / source country */
export const sourceCountries = [
  { iso3: "USA", label: "United States" },
  { iso3: "GBR", label: "United Kingdom" },
  { iso3: "DEU", label: "Germany" },
  { iso3: "FRA", label: "France" },
  { iso3: "AUS", label: "Australia" },
  { iso3: "CAN", label: "Canada" },
];
