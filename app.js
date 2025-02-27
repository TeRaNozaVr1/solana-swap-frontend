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
    if (!window.solana || !window.solana.isPhantom) {
        alert("Будь ласка, підключіть Phantom гаманець!");
        return;
    }

    try {
        // Підключаємо гаманець
        const provider = window.solana;
        await provider.connect();
        const wallet = provider.publicKey;

        // Формуємо транзакцію
        const connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com");
        const transaction = new solanaWeb3.Transaction();

        // Підставляємо фактичні дані транзакції (заповніть відповідно до вашої логіки)
        const instruction = new solanaWeb3.TransactionInstruction({
            keys: [{ pubkey: wallet, isSigner: true, isWritable: true }],
            programId: new solanaWeb3.PublicKey("3n14h2dFwJ6Vv9qzHxd9Xo6YtXtX9N7gKk2Brph81i5X"), // Замініть на ваш смарт-контракт
            data: Buffer.from([]) // Додайте необхідні дані
        });

        transaction.add(instruction);

        // Підписуємо та відправляємо транзакцію
        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = wallet;

        const signedTransaction = await provider.signTransaction(transaction);
        const rawTransaction = signedTransaction.serialize();
        const txHash = await connection.sendRawTransaction(rawTransaction);

        console.log("Транзакція відправлена:", txHash);
        return txHash;
    } catch (error) {
        console.error("Помилка відправлення транзакції:", error);
        alert("Помилка при відправленні транзакції!");
        return null;
    }
}
async function sendTransaction(amount, currency) {
    if (!window.solana || !window.solana.isPhantom) {
        alert("Будь ласка, підключіть Phantom гаманець!");
        return;
    }

    try {
        // Підключаємо гаманець
        const provider = window.solana;
        await provider.connect();
        const wallet = provider.publicKey;

        // Формуємо транзакцію
        const connection = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com");
        const transaction = new solanaWeb3.Transaction();

        // Підставляємо фактичні дані транзакції (заповніть відповідно до вашої логіки)
        const instruction = new solanaWeb3.TransactionInstruction({
            keys: [{ pubkey: wallet, isSigner: true, isWritable: true }],
            programId: new solanaWeb3.PublicKey("Ваш_адрес_програми"), // Замініть на ваш смарт-контракт
            data: Buffer.from([]) // Додайте необхідні дані
        });

        transaction.add(instruction);

        // Підписуємо та відправляємо транзакцію
        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = wallet;

        const signedTransaction = await provider.signTransaction(transaction);
        const rawTransaction = signedTransaction.serialize();
        const txHash = await connection.sendRawTransaction(rawTransaction);

        console.log("Транзакція відправлена:", txHash);
        return txHash;
    } catch (error) {
        console.error("Помилка відправлення транзакції:", error);
        alert("Помилка при відправленні транзакції!");
        return null;
    }
}

    }

    document.getElementById("connectPhantom").addEventListener("click", () => connectWallet("phantom"));
    document.getElementById("connectSolflare").addEventListener("click", () => connectWallet("solflare"));
    document.getElementById("swap-button").addEventListener("click", swapTokens);
});


