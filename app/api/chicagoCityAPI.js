import fetch from 'node-fetch';

export async function sendAddressToAPI(address, coordinates) {
    const apiUrl = 'https://dummyapi.example.com/address'; // Dummy API URL

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(address, coordinates)
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        return { data, address } 
    } catch (error) {
        throw error;
    }
}