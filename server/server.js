import { createAuthApp } from './createAuthApp.js';

const app = createAuthApp();
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
  console.log(`Verification store: ${process.env.USE_IN_MEMORY_VERIFICATION === 'true' ? 'in-memory' : 'supabase + memory fallback'}`);
});
