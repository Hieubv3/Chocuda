import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary';
import { installAuthFetchPatch } from './lib/api';
import './index.css';

// SECURITY: Gan token JWT vao moi request fetch + tu dong dang xuat khi 401
installAuthFetchPatch();

// SUPABASE ADAPTER (tuy chon, mac dinh TAT):
// - Bat bang VITE_SUPABASE_ADAPTER=on trong .env (kem VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY).
// - Khi bat: cac endpoint da map (/api/properties, /api/news, /api/stores...) chay qua Supabase,
//   cac endpoint chua map tu dong fallback ve Express => khong vo app.
// - Khi chua co env Supabase: import dong that bai -> bat loi -> app chay nhu cu (Express + JSON file).
async function bootstrap() {
  if (import.meta.env.VITE_SUPABASE_ADAPTER === 'on') {
    try {
      const [{ supabase }, { installSupabaseAdapter }] = await Promise.all([
        import('./lib/supabase/client'),
        import('./lib/supabase/supabaseFetchAdapter'),
      ]);
      installSupabaseAdapter(supabase);
    } catch (e) {
      console.warn('[Supabase] chua cau hinh day du, tiep tuc dung Express:', e);
    }
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ErrorBoundary>
    </StrictMode>,
  );
}

bootstrap();
