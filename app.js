document.getElementById("connect-wallet").addEventListener("click", async () => {
    if (window.solana && window.solana.isPhantom) {
        try {
            const response = await window.solana.connect();
            document.getElementById("wallet-status").innerText = `Гаманець: ${response.publicKey.toString()}`;
        } catch (err) {
            console.error("Помилка підключення:", err);
        }
    } else {
        // Спроба відкрити мобільний додаток
        window.open("https://phantom.app/ul/v1/connect", "_blank");
    }
});



// Відображення модального вікна підтвердження
function showConfirmationModal(currency, amount) {
    const modal = document.getElementById("confirmation-modal");
    document.getElementById("confirm-currency").innerText = currency;
    document.getElementById("confirm-amount").innerText = amount;
    modal.style.display = "block";
}

// Закриття модального вікна
function closeModal() {
    document.getElementById("confirmation-modal").style.display = "none";
}

document.getElementById("swap-button").addEventListener("click", async () => {
    const wallet = window.solana;
    if (!wallet || !wallet.publicKey) {
        alert("Спочатку підключіть гаманець!");
        return;
    }

    const amount = parseFloat(document.getElementById("amount").value);
    const currency = document.getElementById("currency").value;

    if (isNaN(amount) || amount <= 0) {
        alert("Введіть коректну суму!");
        return;
    }

    // Показуємо підтвердження перед відправкою
    showConfirmationModal(currency, amount);
});

// Кнопка підтвердження обміну
document.getElementById("confirm-swap").addEventListener("click", async () => {
    closeModal();
    const wallet = window.solana;
    const amount = parseFloat(document.getElementById("amount").value);
    const currency = document.getElementById("currency").value;
    const backendUrl = "https://solana-swap-backend.onrender.com/swap";

    const requestData = {
        wallet: wallet.publicKey.toString(),
        amount: amount,
        currency: currency,
        tx_hash: "user_tx_hash_placeholder" // Отримати з підтвердженої транзакції
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
