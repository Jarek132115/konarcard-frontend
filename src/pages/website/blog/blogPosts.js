// frontend/src/pages/website/blog/blogPosts.js
// Single source of truth for every published blog post.
// The Blog index page reads from this list to render its grid.
// BlogPostLayout reads from this list to find related posts.
//
// To add a new post: append a new entry here, then create the post component
// (using BlogPostLayout) and register the route in App.jsx.

export const BLOG_CATEGORIES = [
    { key: "all", label: "All" },
    { key: "tips-guides", label: "Tips & guides" },
    { key: "digital-business-cards", label: "Digital business cards" },
    { key: "getting-more-jobs", label: "Getting more jobs" },
];

export const BLOG_POSTS = [
    {
        id: "d4",
        slug: "best-digital-business-cards-uk-tradespeople",
        category: "digital-business-cards",
        categoryLabel: "Digital business cards",
        pillClass: "is-digital",
        title: "The Best Digital Business Cards for UK Tradespeople in 2026",
        excerpt:
            "An honest comparison of the digital business cards available to UK tradespeople, with pricing, features and which one actually works for trades.",
        readTime: "10 min read",
        datePublished: "2026-04-13",
    },
    {
        id: "d5",
        slug: "what-is-an-nfc-business-card",
        category: "digital-business-cards",
        categoryLabel: "Digital business cards",
        pillClass: "is-digital",
        title: "What is an NFC Business Card and How Does It Work?",
        excerpt:
            "Plain English explanation of NFC business cards, how tapping works, and why UK tradespeople are switching from paper cards to NFC.",
        readTime: "6 min read",
        datePublished: "2026-04-13",
    },
    {
        id: "d6",
        slug: "digital-business-cards-for-tradespeople",
        category: "digital-business-cards",
        categoryLabel: "Digital business cards",
        pillClass: "is-digital",
        title: "Digital Business Cards for Tradespeople, The Complete Guide",
        excerpt:
            "How UK tradespeople are using digital business cards to win more jobs, look more professional and never hand out an out-of-date card again.",
        readTime: "9 min read",
        datePublished: "2026-04-13",
    },
    {
        id: "t4",
        slug: "are-business-cards-still-worth-it",
        category: "tips-guides",
        categoryLabel: "Tips & guides",
        pillClass: "is-tips",
        title: "Are Business Cards Still Worth It in 2026?",
        excerpt:
            "Honest answer to whether business cards are still worth having in 2026, and what UK tradespeople are using instead to win more work.",
        readTime: "6 min read",
        datePublished: "2026-04-13",
    },
    {
        id: "g4",
        slug: "how-to-win-more-jobs-as-a-tradesperson",
        category: "getting-more-jobs",
        categoryLabel: "Getting more jobs",
        pillClass: "is-jobs",
        title: "How to Win More Jobs as a Tradesperson Without Spending More on Ads",
        excerpt:
            "Five practical ways UK tradespeople win more work without paid advertising, and how to make word of mouth work harder for you.",
        readTime: "8 min read",
        datePublished: "2026-04-13",
    },
    {
        id: "g5",
        slug: "how-to-get-more-reviews-as-a-tradesperson",
        category: "getting-more-jobs",
        categoryLabel: "Getting more jobs",
        pillClass: "is-jobs",
        title: "How to Get More Reviews as a Tradesperson",
        excerpt:
            "Practical advice for UK tradespeople on getting more genuine customer reviews, and why most tradespeople ask at the wrong time.",
        readTime: "8 min read",
        datePublished: "2026-04-13",
    },
    {
        id: "t5",
        slug: "how-to-set-up-the-perfect-tradesperson-profile",
        category: "tips-guides",
        categoryLabel: "Tips & guides",
        pillClass: "is-tips",
        title: "How to Set Up the Perfect Tradesperson Profile",
        excerpt:
            "A practical guide for UK tradespeople on building a digital profile that wins jobs, what to write, what photos to take and how to make every section work for you.",
        readTime: "10 min read",
        datePublished: "2026-04-13",
    },
    {
        id: "d7",
        slug: "nfc-cards-vs-qr-codes-for-tradespeople",
        category: "digital-business-cards",
        categoryLabel: "Digital business cards",
        pillClass: "is-digital",
        title: "NFC Cards vs QR Codes, Which is Better for Tradespeople?",
        excerpt:
            "Honest comparison of NFC cards and QR codes for UK tradespeople, how each one works, when to use which, and why having both beats choosing one.",
        readTime: "7 min read",
        datePublished: "2026-04-13",
    },
    {
        id: "d8",
        slug: "how-much-does-a-digital-business-card-cost-uk",
        category: "digital-business-cards",
        categoryLabel: "Digital business cards",
        pillClass: "is-digital",
        title: "How Much Does a Digital Business Card Cost in the UK?",
        excerpt:
            "Honest breakdown of digital business card costs in the UK in 2026, what you actually get at each price point and which option makes sense for tradespeople.",
        readTime: "8 min read",
        datePublished: "2026-04-13",
    },
];

export function findPostBySlug(slug) {
    return BLOG_POSTS.find((p) => p.slug === slug) || null;
}

export function getRelatedPosts(slug, limit = 2) {
    const current = findPostBySlug(slug);
    if (!current) return BLOG_POSTS.slice(0, limit);

    // Same category first, then any other if we still need more
    const sameCategory = BLOG_POSTS.filter(
        (p) => p.slug !== slug && p.category === current.category
    );
    const others = BLOG_POSTS.filter(
        (p) => p.slug !== slug && p.category !== current.category
    );

    return [...sameCategory, ...others].slice(0, limit);
}
