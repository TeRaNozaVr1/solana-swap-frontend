document.getElementById("connect-wallet").addEventListener("click", async () => {
    if (window.solana && window.solana.isPhantom) {
        try {
            const response = await window.solana.connect();
            document.getElementById("wallet-status").innerText = `Гаманець: ${response.publicKey.toString()}`;
        } catch (err) {
            console.error("Помилка підключення:", err);
        }
    } else {
        alert("Встановіть гаманець Phantom!");
    }
});

document.getElementById("swap-button").addEventListener("click", async () => {
    const wallet = window.solana;
    if (!wallet || !wallet.publicKey) {
        alert("Спочатку підключіть гаманець!");
        return;
    }

    const amount = 0.01; // SOL для обміну
    const backendUrl = "https://solana-swap-backend.onrender.com"; // замініть на ваш бекенд

    const requestData = {
        wallet: wallet.publicKey.toString(),
        amount: amount
    };

    try {
        const response = await fetch(backendUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();
        alert(`Транзакція успішна: ${result.txHash}`);
    } catch (error) {
        console.error("Помилка транзакції:", error);
        alert("Не вдалося провести обмін.");
    }
});
