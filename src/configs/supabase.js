import { createClient } from '@supabase/supabase-js';
import https from 'https';
import 'dotenv/config';

// Agente que ignora certificados autofirmados (solo desarrollo local)
const agent = new https.Agent({ rejectUnauthorized: false });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    global: {
      fetch: (url, options = {}) =>
        fetch(url, { ...options, dispatcher: undefined, agent })
    }
  }
);

export default supabase;
