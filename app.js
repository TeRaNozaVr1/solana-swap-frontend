document.addEventListener("DOMContentLoaded", function () {
    async function connectPhantom() {
        if (window.solana && window.solana.isPhantom) {
            try {
                const response = await window.solana.connect({ onlyIfTrusted: false });
                const walletInfo = document.getElementById("walletInfo");
                if (walletInfo) {
                    walletInfo.innerText = "Гаманець: " + response.publicKey.toString();
                }
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
                const walletInfo = document.getElementById("walletInfo");
                if (walletInfo) {
                    walletInfo.innerText = "Гаманець: " + response.publicKey.toString();
                }
            } catch (err) {
                console.error("Помилка підключення:", err);
            }
        } else {
            alert("Будь ласка, встановіть Solflare Wallet!");
            window.open("https://solflare.com/", "_blank");
        }
    }

    function closeModal() {
        const modal = document.getElementById("confirmation-modal");
        if (modal) {
            modal.style.display = "none";
        }
    }

    function showConfirmationModal(currency, amount) {
        const modal = document.getElementById("confirmation-modal");
        const modalText = document.getElementById("modal-text");

        if (modal && modalText) {
            modalText.innerText = `Ви хочете обміняти ${amount} ${currency}?`;
            modal.style.display = "block";
        } else {
            console.error("Модальне вікно не знайдено в DOM.");
        }
    }

    const connectPhantomBtn = document.getElementById("connectPhantom");
    if (connectPhantomBtn) {
        connectPhantomBtn.addEventListener("click", connectPhantom);
    } else {
        console.error("Кнопка 'connectPhantom' не знайдена.");
    }

    const connectSolflareBtn = document.getElementById("connectSolflare");
    if (connectSolflareBtn) {
        connectSolflareBtn.addEventListener("click", connectSolflare);
    } else {
        console.error("Кнопка 'connectSolflare' не знайдена.");
    }

    const confirmSwapBtn = document.getElementById("confirm-swap");
    if (confirmSwapBtn) {
        confirmSwapBtn.addEventListener("click", async () => {
            closeModal();
            const wallet = window.solana;
            const amountInput = document.getElementById("amount");
            const currencyInput = document.getElementById("currency");

            if (!wallet || !wallet.publicKey || !amountInput || !currencyInput) {
                console.error("Гаманець або елементи форми не знайдено.");
                return;
            }

            const amount = parseFloat(amountInput.value);
            const currency = currencyInput.value;
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

                console.log("Статус відповіді:", response.status);
                const responseText = await response.text();
                console.log("Тіло відповіді:", responseText);

                try {
                    const result = JSON.parse(responseText);
                    alert(`Транзакція успішна: ${result.txHash}`);
                } catch (error) {
                    console.error("Помилка парсингу JSON:", error);
                    alert("Некоректна відповідь сервера.");
                }
            } catch (error) {
                console.error("Помилка запиту:", error);
                alert("Не вдалося виконати обмін.");
            }
        });
    } else {
        console.error("Кнопка 'confirm-swap' не знайдена.");
    }
});



