/**
 * Supabase Database Test Script
 * 
 * Run this in your browser console while on the app:
 * 1. Open browser DevTools (F12)
 * 2. Go to Console tab
 * 3. Copy and paste this entire script
 * 4. Press Enter to run
 */

(async function testSupabase() {
    console.log('🧪 Starting Supabase Database Tests...\n');
    
    // Get Supabase client
    const supabase = window.CAVSupabase?.getClient?.();
    if (!supabase) {
        console.error('❌ Supabase client not available. Make sure you are logged in.');
        return;
    }
    
    console.log('✅ Supabase client available\n');
    
    // Get current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
        console.error('❌ Not authenticated:', userError?.message);
        return;
    }
    
    const userId = userData.user.id;
    const userEmail = userData.user.email;
    console.log(`✅ Authenticated as: ${userEmail} (${userId})\n`);
    
    // Test results object
    const results = {
        tables: {},
        tests: []
    };
    
    // List of tables to test
    const tables = [
        'profiles', 'user_state', 'organizations', 'api_keys', 'shared_api_keys',
        'companies', 'contacts', 'projects', 'deals', 'assets',
        'strategies', 'url_analyses', 'best_practices', 'benchmarks',
        'swipe_files', 'competitors', 'user_settings', 'brand_profiles', 'activities'
    ];
    
    console.log('📊 Testing table access...\n');
    
    // Test each table
    for (const table of tables) {
        try {
            const { data, error, count } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });
            
            if (error) {
                results.tables[table] = { status: '❌ ERROR', error: error.message, count: 0 };
                console.log(`❌ ${table}: ${error.message}`);
            } else {
                results.tables[table] = { status: '✅ OK', count: count || 0 };
                console.log(`✅ ${table}: accessible (${count || 0} rows)`);
            }
        } catch (e) {
            results.tables[table] = { status: '❌ EXCEPTION', error: e.message, count: 0 };
            console.log(`❌ ${table}: ${e.message}`);
        }
    }
    
    console.log('\n🧪 Testing CRUD operations...\n');
    
    // Test INSERT into companies
    const testCompanyId = 'test-' + Date.now();
    console.log('Testing INSERT...');
    const { data: insertData, error: insertError } = await supabase
        .from('companies')
        .insert({
            uuid: testCompanyId,
            name: 'TEST COMPANY - DELETE ME',
            user_id: userId,
            user_email: userEmail,
            type: 'test',
            created_at: new Date().toISOString()
        })
        .select();
    
    if (insertError) {
        console.log(`❌ INSERT failed: ${insertError.message}`);
        results.tests.push({ test: 'INSERT', status: 'FAIL', error: insertError.message });
    } else {
        console.log(`✅ INSERT successful: created company ${testCompanyId}`);
        results.tests.push({ test: 'INSERT', status: 'PASS' });
        
        // Test SELECT
        console.log('Testing SELECT...');
        const { data: selectData, error: selectError } = await supabase
            .from('companies')
            .select('*')
            .eq('uuid', testCompanyId)
            .single();
        
        if (selectError) {
            console.log(`❌ SELECT failed: ${selectError.message}`);
            results.tests.push({ test: 'SELECT', status: 'FAIL', error: selectError.message });
        } else {
            console.log(`✅ SELECT successful: found company "${selectData.name}"`);
            results.tests.push({ test: 'SELECT', status: 'PASS' });
        }
        
        // Test UPDATE
        console.log('Testing UPDATE...');
        const { error: updateError } = await supabase
            .from('companies')
            .update({ name: 'TEST COMPANY - UPDATED' })
            .eq('uuid', testCompanyId);
        
        if (updateError) {
            console.log(`❌ UPDATE failed: ${updateError.message}`);
            results.tests.push({ test: 'UPDATE', status: 'FAIL', error: updateError.message });
        } else {
            console.log(`✅ UPDATE successful`);
            results.tests.push({ test: 'UPDATE', status: 'PASS' });
        }
        
        // Test DELETE
        console.log('Testing DELETE...');
        const { error: deleteError } = await supabase
            .from('companies')
            .delete()
            .eq('uuid', testCompanyId);
        
        if (deleteError) {
            console.log(`❌ DELETE failed: ${deleteError.message}`);
            results.tests.push({ test: 'DELETE', status: 'FAIL', error: deleteError.message });
        } else {
            console.log(`✅ DELETE successful: removed test company`);
            results.tests.push({ test: 'DELETE', status: 'PASS' });
        }
    }
    
    // Test API Keys table
    console.log('\n🔑 Testing API Keys table...\n');
    
    const testKeyId = 'test-key-' + Date.now();
    const { error: keyInsertError } = await supabase
        .from('api_keys')
        .insert({
            user_id: userId,
            user_email: userEmail,
            provider: 'test',
            encrypted_key: 'test-key-value-' + Date.now(),
            is_active: true
        });
    
    if (keyInsertError) {
        console.log(`❌ API Keys INSERT failed: ${keyInsertError.message}`);
        results.tests.push({ test: 'API_KEYS INSERT', status: 'FAIL', error: keyInsertError.message });
    } else {
        console.log(`✅ API Keys INSERT successful`);
        results.tests.push({ test: 'API_KEYS INSERT', status: 'PASS' });
        
        // Clean up
        await supabase.from('api_keys').delete().eq('provider', 'test').eq('user_id', userId);
        console.log(`✅ Cleaned up test API key`);
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📋 TEST SUMMARY');
    console.log('='.repeat(50));
    
    const tablesPassed = Object.values(results.tables).filter(t => t.status.includes('✅')).length;
    const tablesFailed = Object.values(results.tables).filter(t => t.status.includes('❌')).length;
    console.log(`\nTables: ${tablesPassed} accessible, ${tablesFailed} failed`);
    
    const testsPassed = results.tests.filter(t => t.status === 'PASS').length;
    const testsFailed = results.tests.filter(t => t.status === 'FAIL').length;
    console.log(`CRUD Tests: ${testsPassed} passed, ${testsFailed} failed`);
    
    if (tablesFailed > 0 || testsFailed > 0) {
        console.log('\n⚠️ Some tests failed! Run migration 015 in Supabase SQL Editor.');
    } else {
        console.log('\n🎉 All tests passed! Database is working correctly.');
    }
    
    console.log('\nFull results object:', results);
    
    return results;
})();
