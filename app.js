document.addEventListener("DOMContentLoaded", function () {
    const backendUrl = "https://solana-swap-backend.onrender.com";

    async function connectWallet(walletType) {
        let wallet = null;

        if (walletType === "phantom" && window.solana && window.solana.isPhantom) {
            wallet = window.solana;
        } else if (walletType === "solflare" && window.solflare && window.solflare.isSolflare) {
            wallet = window.solflare;
        } else {
            alert("Будь ласка, встановіть " + (walletType === "phantom" ? "Phantom" : "Solflare") + " Wallet!");
            return;
        }

        try {
            await wallet.connect();
            document.getElementById("walletInfo").innerText = "Гаманець: " + wallet.publicKey.toString();
        } catch (err) {
            console.error("Помилка підключення:", err);
        }
    }

    async function sendTransaction(amount, currency) {
        const wallet = window.solana;
        if (!wallet || !wallet.publicKey) {
            alert("Спочатку підключіть гаманець!");
            return;
        }

        try {
            // Формуємо транзакцію
            const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("mainnet-beta"), "confirmed");
            const transaction = new solanaWeb3.Transaction().add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: wallet.publicKey,
                    toPubkey: new solanaWeb3.PublicKey("4ofLfgCmaJYC233vTGv78WFD4AfezzcMiViu26dF3cVU"),
                    lamports: solanaWeb3.LAMPORTS_PER_SOL * amount, 
                })
            );

            transaction.feePayer = wallet.publicKey;
            transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

            // Підпис та відправка транзакції
            const signedTransaction = await wallet.signTransaction(transaction);
            const txHash = await connection.sendRawTransaction(signedTransaction.serialize());
            alert(`Транзакція відправлена! Хеш: ${txHash}`);

            return txHash;
        } catch (error) {
            console.error("Помилка транзакції:", error);
            alert("Не вдалося провести транзакцію.");
        }
    }

    async function swapTokens() {
        const amount = parseFloat(document.getElementById("amount").value);
        const currency = document.getElementById("currency").value;

        if (isNaN(amount) || amount <= 0) {
            alert("Введіть коректну суму!");
            return;
        }

        const txHash = await sendTransaction(amount, currency);
        if (!txHash) return;

        try {
            const response = await fetch(`${backendUrl}/swap`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    wallet: window.solana.publicKey.toString(),
                    amount,
                    currency,
                    tx_hash: txHash
                })
            });

            const result = await response.json();
            alert(`Отримано: ${result.spl_tokens} SPL токенів`);
        } catch (error) {
            console.error("Помилка при запиті на бекенд:", error);
            alert("Не вдалося отримати підтвердження обміну.");
        }
    }

    document.getElementById("connectPhantom").addEventListener("click", () => connectWallet("phantom"));
    document.getElementById("connectSolflare").addEventListener("click", () => connectWallet("solflare"));
    document.getElementById("swap-button").addEventListener("click", swapTokens);
});


