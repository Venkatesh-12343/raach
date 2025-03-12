function updateTotal(input, dateKey, factory) {
    if (userMode !== "admin") return; // Only admin can edit

    let row = input.closest('tr');
    let quantity = parseFloat(row.querySelector('.quantity').value) || 0;
    let amount = parseFloat(row.querySelector('.amount').value) || 0;
    let total = quantity * amount;
    row.querySelector('.total').value = total.toFixed(2); // Ensure two decimal places

    // Save data locally
    let storedData = JSON.parse(localStorage.getItem(`${currentMonth}-${factory}`)) || {};
    storedData[dateKey] = { quantity, amount, total };
    localStorage.setItem(`${currentMonth}-${factory}`, JSON.stringify(storedData));

    updateGrandTotal(factory);

    // Attempt to sync data
    syncData(factory);
}

function updateGrandTotal(factory) {
    let storedData = JSON.parse(localStorage.getItem(`${currentMonth}-${factory}`)) || {};

    let grandTotal = Object.values(storedData).reduce((sum, entry) => sum + (entry.total || 0), 0);

    let grandTotalElement = document.getElementById('grandTotal');
    if (grandTotalElement) {
        grandTotalElement.textContent = grandTotal.toFixed(2);
    } else {
        console.warn('Grand total element not found.');
    }
}

// Sync Data to Server
async function syncData(factory) {
    if (!navigator.onLine) {
        console.warn("Offline mode: Data will sync when online.");
        return;
    }

    let storedData = localStorage.getItem(`${currentMonth}-${factory}`);
    if (!storedData) {
        console.warn("No data to sync.");
        return;
    }

    try {
        let response = await fetch("https://your-server.com/api/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                factory: factory,
                month: currentMonth,
                data: JSON.parse(storedData),
            }),
        });

        let result = await response.json();
        console.log("Sync Successful:", result);
    } catch (error) {
        console.error("Sync Failed:", error);
    }
}

// Auto Sync When Online
window.addEventListener("online", () => {
    let factory = document.getElementById("factorySelect")?.value;
    if (factory) syncData(factory);
});

// Sync on Page Load (if online)
window.addEventListener("load", () => {
    if (navigator.onLine) {
        let factory = document.getElementById("factorySelect")?.value;
        if (factory) syncData(factory);
    }
});
