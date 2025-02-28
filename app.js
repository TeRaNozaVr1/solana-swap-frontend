const solanaWeb3 = window.solanaWeb3;
const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("mainnet-beta"));

document.addEventListener("DOMContentLoaded", function () {
    let wallet = null;

    // Перевіряємо баланс перед транзакцією
    async function checkBalance() {
        if (!wallet || !wallet.publicKey) {
            alert("Спочатку підключіть гаманець!");
            return;
        }

        const balance = await connection.getBalance(wallet.publicKey);
        const solBalance = balance / solanaWeb3.LAMPORTS_PER_SOL;
        document.getElementById("walletBalance").innerText = `Баланс: ${solBalance.toFixed(4)} SOL`;
        return solBalance;
    }

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
            await checkBalance();
        } catch (err) {
            console.error("Помилка підключення:", err);
            alert("Помилка підключення до гаманця.");
        }
    }

    // Відправка SOL або SPL-токенів
    async function sendTransaction(amount, currency) {
        if (!wallet || !wallet.publicKey) {
            alert("Спочатку підключіть гаманець!");
            return;
        }

        try {
            // Перевіряємо баланс перед транзакцією
            const solBalance = await checkBalance();
            if (currency === "SOL" && solBalance < amount) {
                alert("Недостатньо коштів на балансі!");
                return;
            }

            const receiver = new solanaWeb3.PublicKey("4ofLfgCmaJYC233vTGv78WFD4AfezzcMiViu26dF3cVU");
            const transaction = new solanaWeb3.Transaction();

            if (currency === "SOL") {
                // Відправляємо SOL
                const instruction = solanaWeb3.SystemProgram.transfer({
                    fromPubkey: wallet.publicKey,
                    toPubkey: receiver,
                    lamports: amount * solanaWeb3.LAMPORTS_PER_SOL,
                });
                transaction.add(instruction);
            } else {
                // Відправляємо SPL-токени (USDT, USDC)
                const tokenMint = currency === "USDT"
                    ? new solanaWeb3.PublicKey("Es9vMFrzaCER3H6QBdhtjKY6w2wM1DWou3HsnRT8ePGr") // USDT Solana
                    : new solanaWeb3.PublicKey("EPjFWdd5AufqSSQUiJ68p5moFjB8ofmKvQjqp5DJmQMQ"); // USDC Solana

                const tokenAccount = await getTokenAccount(wallet.publicKey, tokenMint);
                if (!tokenAccount) {
                    alert("Не знайдено токен-акаунту для цього токена!");
                    return;
                }

                const transferInstruction = createTokenTransferInstruction(wallet.publicKey, receiver, tokenAccount, tokenMint, amount);
                transaction.add(transferInstruction);
            }

            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = wallet.publicKey;

            // Підписуємо та відправляємо транзакцію
            const signedTransaction = await wallet.signTransaction(transaction);
            const serializedTransaction = signedTransaction.serialize();
            const transactionSignature = await connection.sendRawTransaction(serializedTransaction);

            console.log("Транзакція відправлена:", transactionSignature);
            
            // Очікуємо підтвердження
            await confirmTransaction(transactionSignature);

        } catch (error) {
            console.error("Помилка транзакції:", error);
            alert("Не вдалося здійснити обмін.");
        }
    }

    // Отримання SPL-токен акаунту користувача
    async function getTokenAccount(owner, mint) {
        const accounts = await connection.getParsedTokenAccountsByOwner(owner, { mint });
        return accounts.value.length > 0 ? accounts.value[0].pubkey : null;
    }

    // Створення інструкції для переказу SPL-токенів
    function createTokenTransferInstruction(sender, receiver, tokenAccount, tokenMint, amount) {
        return new solanaWeb3.TransactionInstruction({
            keys: [
                { pubkey: tokenAccount, isSigner: false, isWritable: true },
                { pubkey: receiver, isSigner: false, isWritable: true },
                { pubkey: sender, isSigner: true, isWritable: false },
            ],
            programId: new solanaWeb3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), // SPL Token Program
            data: Buffer.from([3, ...new solanaWeb3.BN(amount * 10 ** 6).toArray("le", 8)]), // 3 - Transfer instruction
        });
    }

    // Підтвердження транзакції та отримання деталей
    async function confirmTransaction(signature) {
        const result = await connection.confirmTransaction(signature);
        if (result.value.err) {
            console.error("Помилка підтвердження:", result.value.err);
            alert("Транзакція не підтверджена!");
            return;
        }

        console.log("Транзакція успішно підтверджена!");
        await getTransactionDetails(signature);
    }

    // Отримання деталей транзакції
    async function getTransactionDetails(signature) {
        const transaction = await connection.getParsedTransaction(signature, {
            commitment: "finalized",
        });

        if (!transaction) {
            console.error("Не вдалося отримати деталі транзакції!");
            return;
        }

        console.log("Деталі транзакції:", transaction);
        alert(`Транзакція успішна! Деталі: ${signature}`);
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
