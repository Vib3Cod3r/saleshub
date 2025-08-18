// Test script to check companies API endpoint
const testCompaniesAPI = async () => {
  try {
    // First, let's check if the backend is running
    console.log('Testing backend connectivity...')
    const healthResponse = await fetch('http://localhost:8089/health')
    console.log('Health check status:', healthResponse.status)
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json()
      console.log('Health check response:', healthData)
    }
    
    // Now let's test the companies endpoint without auth (should return 401)
    console.log('\nTesting companies endpoint without authentication...')
    const companiesResponse = await fetch('http://localhost:8089/api/crm/companies')
    console.log('Companies endpoint status (no auth):', companiesResponse.status)
    
    if (!companiesResponse.ok) {
      const errorText = await companiesResponse.text()
      console.log('Companies endpoint error (no auth):', errorText)
    }
    
    // Check if there's a token in localStorage (if running in browser)
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('token')
      if (token) {
        console.log('\nTesting companies endpoint with authentication...')
        const authResponse = await fetch('http://localhost:8089/api/crm/companies', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        console.log('Companies endpoint status (with auth):', authResponse.status)
        
        if (authResponse.ok) {
          const data = await authResponse.json()
          console.log('Companies data:', data)
          console.log('Number of companies:', data.data?.length || 0)
        } else {
          const errorText = await authResponse.text()
          console.log('Companies endpoint error (with auth):', errorText)
        }
      } else {
        console.log('\nNo authentication token found in localStorage')
      }
    }
    
  } catch (error) {
    console.error('Error testing API:', error)
  }
}

// Run the test
testCompaniesAPI()
