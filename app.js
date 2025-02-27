async function connectPhantom() {
            if (window.solana && window.solana.isPhantom) {
                try {
                    const response = await window.solana.connect({ onlyIfTrusted: false });
                    document.getElementById("walletInfo").innerText = "Гаманець: " + response.publicKey.toString();
                } catch (err) {
                    console.error("Помилка підключення:", err);
                }
            } else {
                alert("Будь ласка, встановіть Phantom Wallet!");
                window.open("https://phantom.app/", "_blank");
            }
        }

        async function connectSolflare() {
            if (window.solflare && window.solflare.isSolflare) {
                try {
                    const response = await window.solflare.connect();
                    document.getElementById("walletInfo").innerText = "Гаманець: " + response.publicKey.toString();
                } catch (err) {
                    console.error("Помилка підключення:", err);
                }
            } else {
                alert("Будь ласка, встановіть Solflare Wallet!");
                window.open("https://solflare.com/", "_blank");
            }
        }

        document.getElementById("connectPhantom").addEventListener("click", connectPhantom);
        document.getElementById("connectSolflare").addEventListener("click", connectSolflare);

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
