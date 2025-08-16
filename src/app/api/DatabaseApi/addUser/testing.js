import { v4 as uuidv4 } from "uuid";

const TEST_USER = {
 auth_user_id: uuidv4(),
  first_name: 'John',
  last_name: 'Doe',
  role: 'Fan'
};

console.log('🚀 Sending test user:', TEST_USER);

fetch('http://localhost:3000/api/DatabaseApi/addUser', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(TEST_USER)
})
.then(async (response) => {
  const data = await response.json();
  if (!response.ok) {
    console.error('❌ Server Error:', data);
    return;
  }
  console.log('✅ User created:', data);
  console.log('\n🔍 Check Supabase table for:');
  console.log(`auth_user_id = "${TEST_USER.auth_user_id}"`);
})
.catch((error) => {
  console.error('🚨 Network Error:', error.message);
});