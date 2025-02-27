const solanaWeb3 = window.solanaWeb3;
const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("mainnet-beta"));

document.addEventListener("DOMContentLoaded", function () {
    let wallet = null;

    // Підключення гаманця
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

    // Підтвердження операції
    function confirmTransactionDialog(amount, currency) {
        return new Promise((resolve, reject) => {
            const userConfirmed = confirm(`Ви впевнені, що хочете обміняти ${amount} ${currency} на SPL токени?`);
            if (userConfirmed) {
                resolve();
            } else {
                reject("Операція скасована користувачем.");
            }
        });
    }

    // Відправка транзакції
    async function sendTransaction(amount, currency) {
        if (!wallet || !wallet.publicKey) {
            alert("Спочатку підключіть гаманець!");
            return;
        }

        try {
            // Діалогове вікно підтвердження операції
            await confirmTransactionDialog(amount, currency);

            // Переконуємось, що wallet має правильний publicKey
            if (!wallet.publicKey) {
                alert("Не вдалося знайти publicKey гаманця!");
                return;
            }

            const receiver = new solanaWeb3.PublicKey("4ofLfgCmaJYC233vTGv78WFD4AfezzcMiViu26dF3cVU"); // Гаманець отримувача
            const transaction = new solanaWeb3.Transaction();

            // Перевіряємо перед додаванням інструкції, чи правильно передані значення
            if (!amount || amount <= 0) {
                alert("Введіть коректну суму.");
                return;
            }

            const instruction = solanaWeb3.SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: receiver,
                lamports: amount * solanaWeb3.LAMPORTS_PER_SOL,  // Переводимо в lamports
            });

            transaction.add(instruction);

            // Отримуємо блокхеш і останню висоту блоку для підтвердження
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = wallet.publicKey;

            // Підписуємо та серіалізуємо транзакцію
            const signedTransaction = await wallet.signTransaction(transaction);
            const serializedTransaction = signedTransaction.serialize();
            const transactionSignature = await connection.sendRawTransaction(serializedTransaction);

            console.log("Транзакція відправлена, очікуємо підтвердження:", transactionSignature);
            const confirmation = await connection.confirmTransaction({
                signature: transactionSignature,
                blockhash,
                lastValidBlockHeight,
            });

            if (confirmation.value.err) {
                throw new Error("Транзакція не підтверджена!");
            }

            // Надсилаємо інформацію про транзакцію на бекенд
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

    // Обробка події підключення Phantom
    document.getElementById("connectPhantom").addEventListener("click", () => connectWallet("phantom"));
    // Обробка події підключення Solflare
    document.getElementById("connectSolflare").addEventListener("click", () => connectWallet("solflare"));

    // Обробка підтвердження обміну
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


