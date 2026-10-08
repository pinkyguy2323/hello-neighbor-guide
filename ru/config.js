// Optional cloud sync config. Leave empty = local-only mode (still works).
// Fill ONE of these to enable shared posts AND shared user guides for everyone.
// FREE options: Firebase Firestore (google) or Supabase (postgres).
window.HN_CONFIG = {
  firebase: null,
  // Example:
  // firebase: { apiKey:"...", authDomain:"....firebaseapp.com", projectId:"...", appId:"..." },
  // Collections used: hn_posts (community), hn_userguides (user guides).

  supabase: null,
  // Example:
  // supabase: { url:"https://xyz.supabase.co", anonKey:"...", table:"hn_posts", guidesTable:"hn_userguides" }

  guides: null
  // Optional overrides: { collection:"hn_userguides", table:"hn_userguides" }
};
