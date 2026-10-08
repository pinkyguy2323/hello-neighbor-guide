// Optional cloud sync config. Leave empty = local-only mode (still works).
// Fill ONE of these to enable shared posts for everyone.
// FREE options: Firebase Firestore (google) or Supabase (postgres).
window.HN_CONFIG = {
  firebase: null,
  // Example:
  // firebase: { apiKey:"...", authDomain:"....firebaseapp.com", projectId:"...", appId:"..." },

  supabase: null
  // Example:
  // supabase: { url:"https://xyz.supabase.co", anonKey:"...", table:"hn_posts" }
};
