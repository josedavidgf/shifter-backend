const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xxqfqprwincmfwxmsjkf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4cWZxcHJ3aW5jbWZ3eG1zamtmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NzEyNTYsImV4cCI6MjA1OTU0NzI1Nn0.133ZGFnJTeLsMr0IW8wXuHsTFfL4pI0aFTDq7JqpSCY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSupabase() {
  try {
    const { data, error } = await supabase.from('test_table').select('*');
    if (error) throw error;
    console.log("✅ Supabase Connection successful!");
    console.log("Data from test_table:", data);
  } catch (err) {
    console.error("❌ Supabase Connection failed:", err.message);
  }
}

testSupabase();
