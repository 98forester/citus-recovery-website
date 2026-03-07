import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
    const { data, error } = await supabase.from('leads').select('id, owner_name').limit(1).single();
    if (error) console.error(error);
    else console.log(data);
}
run();
