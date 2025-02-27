const solanaWeb3 = window.solanaWeb3;
const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("mainnet-beta"));
document.addEventListener("DOMContentLoaded", function () {
    let wallet = null;

   async function connectWallet(providerName) {
    try {
        if (providerName === "phantom" && window.solana?.isPhantom) {
            wallet = window.solana;
            await wallet.connect();
        } else if (providerName === "solflare" && window.solflare?.isSolflare) {
            wallet = window.solflare;
            await wallet.connect();
        } else {
            alert("Будь ласка, встановіть відповідний гаманець!");
            return;
        }

        document.getElementById("walletInfo").innerText = `Гаманець: ${wallet.publicKey.toString()}`;
    } catch (err) {
        console.error("Помилка підключення:", err);
        alert("Помилка підключення до гаманця.");
    }
}

    async function sendTransaction(amount, currency) {
        if (!wallet || !wallet.publicKey) {
            alert("Спочатку підключіть гаманець!");
            return;
        }

        try {
            const receiver = "4ofLfgCmaJYC233vTGv78WFD4AfezzcMiViu26dF3cVU"; // Гаманець отримувача
            const transaction = new solanaWeb3.Transaction();
            
            const instruction = solanaWeb3.SystemProgram.transfer({
    fromPubkey: wallet.publicKey, 
    toPubkey: new solanaWeb3.PublicKey(receiver),
    lamports: amount * solanaWeb3.LAMPORTS_PER_SOL,
});
transaction.add(instruction);

           const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
transaction.recentBlockhash = blockhash;
transaction.feePayer = wallet.publicKey;

            const signedTransaction = await wallet.signTransaction(transaction);
            const serializedTransaction = signedTransaction.serialize();
const base64Transaction = Buffer.from(serializedTransaction).toString("base64");

const transactionSignature = await window.solana.request({
    method: "sendTransaction",
    params: [base64Transaction],
});

            console.log("Транзакція відправлена, очікуємо підтвердження:", transactionSignature);

            const response = await fetch("https://solana-swap-backend.onrender.com/swap", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    wallet: wallet.publicKey.toString(),
                    amount: amount,
                    currency: currency,
                    tx_hash: transactionSignature,
                }),
            });

            const result = await response.json();
            if (response.ok) {
                alert(`Транзакція успішна! Отримано ${result.spl_tokens} SPL-токенів.`);
            } else {
                console.error("Помилка обробки:", result.detail);
                alert("Помилка: " + result.detail);
            }
        } catch (error) {
            console.error("Помилка транзакції:", error);
            alert("Не вдалося здійснити обмін.");
        }
    }

    document.getElementById("connectPhantom").addEventListener("click", () => connectWallet("phantom"));
    document.getElementById("connectSolflare").addEventListener("click", () => connectWallet("solflare"));

    document.getElementById("confirm-swap").addEventListener("click", async () => {
        const amount = parseFloat(document.getElementById("amount").value);
        const currency = document.getElementById("currency").value;

        if (!amount || amount <= 0) {
            alert("Введіть коректну суму.");
            return;
        }

        await sendTransaction(amount, currency);
    });
});
