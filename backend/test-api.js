const axios = require('axios');

async function testRegister() {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test User',
            email: 'test.cs.22@nitj.ac.in',
            password: 'password123',
            phoneNumber: '9876543210',
            department: 'CSE',
            year: 2022,
            hostel: 'BH1'
        });

        console.log('✓ Registration Success:');
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('✗ Registration Failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Error:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error:', error.message);
        }
    }
}

testRegister();
