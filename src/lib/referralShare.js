/**
 * Referral invite copy and signup links for admin-to-admin referrals.
 */

const DEFAULT_PUBLIC_ORIGIN = 'https://libraryconnekto.me';

export function getReferralSignupUrl(referralCode) {
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : DEFAULT_PUBLIC_ORIGIN;
  const base = `${origin}/admin/auth?mode=signup`;
  if (!referralCode) return base;
  return `${base}&referral=${encodeURIComponent(referralCode)}`;
}

/**
 * Prefer library name or a friendly name — avoid raw login emails in share text.
 */
export function formatReferrerLabel({ referrerName = '', libraryName = '' }) {
  const lib = libraryName?.trim();
  const name = referrerName?.trim();
  const isEmail = name && name.includes('@');

  if (lib && isEmail) return lib;
  if (name && !isEmail) return name;
  if (lib) return lib;
  if (name && isEmail) {
    const local = name.split('@')[0]?.replace(/[._]/g, ' ').trim();
    return local ? local.charAt(0).toUpperCase() + local.slice(1) : 'A library owner';
  }
  return 'A library owner on Library Connekto';
}

/**
 * @param {{ code: string, libraryName?: string, referrerName?: string }} opts
 */
export function buildReferralShareMessage({ code, libraryName = '', referrerName = '' }) {
  const signupUrl = getReferralSignupUrl(code);
  const who = formatReferrerLabel({ referrerName, libraryName });

  return `📚 What if your library ran itself — seats, students & fees in one place?

Hi! ${who} is inviting you to try Library Connekto.

Tired of chasing fees on WhatsApp, mismatched registers, and “who paid what?” every month? You are not alone — most study libraries lose time and money on manual payment collection.

Library Connekto helps you go fully digital:

✨ Payment collection, worry-free
   • Collect fees online (UPI / cards) with clear payment status
   • Auto-track who paid, who is due, and subscription end dates
   • Fewer awkward follow-ups — reminders go out from one system

📖 Everything else your library needs
   • Live seat booking & occupancy
   • Student records, attendance & plans in one dashboard
   • Reports you can trust — no more Excel patchwork

🎁 Your personal referral code: ${code}
   → Paste it when you complete your library profile (right after signup)

👉 Claim your free admin account (2-min signup):
${signupUrl}

No credit card to explore. Curious? Open the link and see how your library could look next week.

Questions? Reply here or visit libraryconnekto.me

— Library Connekto · Smart, payment-ready library management`;
}

/**
 * Short version for SMS / tight spaces.
 */
export function buildReferralShareMessageShort({ code, libraryName = '', referrerName = '' }) {
  const signupUrl = getReferralSignupUrl(code);
  const who = formatReferrerLabel({ referrerName, libraryName });
  return `${who} invites you to Library Connekto — hassle-free fee collection, seats & students in one app. Code: ${code}. Start free: ${signupUrl}`;
}
