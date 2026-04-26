export type GuideArticle = {
  slug: string;
  title: string;
  description: string;
  /** Short H2 sections */
  sections: { heading: string; body: string }[];
};

export const GUIDE_ARTICLES: Record<string, GuideArticle> = {
  "send-money-to-thailand": {
    slug: "send-money-to-thailand",
    title: "Send money to Thailand in THB | Money send guide",
    description:
      "How BuffaloMoneySend helps you send money to Thailand: card checkout, clear estimate, and payout to a Thai bank account in THB.",
    sections: [
      {
        heading: "What “money send” means here",
        body:
          "A money send is a transfer from you—paying with your card in your home currency—so a recipient in Thailand receives funds in their local bank account, typically in Thai baht (THB). Our flow shows an estimated receive amount before you pay.",
      },
      {
        heading: "Why Thailand first",
        body:
          "We started with a Thailand corridor to keep pricing and compliance clear. You choose your source country and amount; the app focuses on a reliable route into Thai accounts with transparent fees where applicable.",
      },
      {
        heading: "Before you start",
        body:
          "Have the recipient’s Thai bank, branch where relevant, and account number at hand, exactly as on their bank passbook. Wrong digits are a common reason for delayed or failed payouts across any money-send product.",
      },
    ],
  },
  "buffalo-moneysend": {
    slug: "buffalo-moneysend",
    title: "What is BuffaloMoneySend? | Buffalo & community",
    description:
      "Learn what BuffaloMoneySend is, how the buffalo fits our brand, and what to expect from our international money transfer experience to Thailand.",
    sections: [
      {
        heading: "The buffalo in BuffaloMoneySend",
        body:
          "“Buffalo” in our name is a nod to community and moving forward together—not a product feature. The herd imagery is a friendly symbol for a clear, no-nonsense way to support people you care about with a money send to Thailand.",
      },
      {
        heading: "What we are building",
        body:
          "BuffaloMoneySend is designed for people who need a simple path from card to Thai bank, with a rate estimate and secure checkout. We grow the product carefully, starting with the Thailand corridor (THB).",
      },
      {
        heading: "Your card, their account",
        body:
          "You stay in control of the amount and currency you send; your recipient in Thailand gets paid to the bank details you provide. If something looks off, we show clear errors so you can fix it before you pay.",
      },
    ],
  },
};

export function getGuideOrNull(slug: string): GuideArticle | null {
  return GUIDE_ARTICLES[slug] ?? null;
}

export function listGuidesForMenu(): { slug: string; title: string; short: string }[] {
  return [
    {
      slug: "send-money-to-thailand",
      title: "Send money to Thailand (THB)",
      short: "Money send to Thailand, THB, and what to expect",
    },
    {
      slug: "buffalo-moneysend",
      title: "What is BuffaloMoneySend?",
      short: "The buffalo brand and our community focus",
    },
  ];
}
