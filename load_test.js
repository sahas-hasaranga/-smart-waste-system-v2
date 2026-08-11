async function runLoadTest() {
    console.log("🚀 Starting Load Test: Inserting 1000 requests...");
    const API_URL = 'http://localhost:5000/api/request';
    
    let successCount = 0;
    let errorCount = 0;
    
    // Send 1000 requests
    for (let i = 1; i <= 1000; i++) {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    houseId: 101, // Kamals house
                    wasteType: 'Organic', 
                    priority: Math.floor(Math.random() * 3) + 1 // Random priority 1-3
                })
            });
            
            if (res.ok) {
                successCount++;
            } else {
                errorCount++;
            }
            
            if (i % 100 === 0) {
                console.log(`... Sent ${i} requests`);
            }
        } catch (err) {
            errorCount++;
        }
    }
    
    console.log(`✅ Load Test Complete!`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${errorCount}`);
}

runLoadTest();
