import { useEffect, useState, useMemo } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { 
    useWallet, 
    WalletProvider 
} from "@solana/wallet-adapter-react";
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import "@solana/wallet-adapter-react-ui/styles.css";

const App = () => {
    const wallet = useWallet();
    const [walletAddress, setWalletAddress] = useState(null);

    useEffect(() => {
        if (wallet.connected && wallet.publicKey) {
            setWalletAddress(wallet.publicKey.toString());
        } else {
            setWalletAddress(null);
        }
    }, [wallet.connected, wallet.publicKey]);

    const handleMobileConnect = async (walletType) => {
        try {
            if (walletType === "phantom") {
                if (wallet.adapter.name === "Phantom") {
                    await wallet.adapter.connect();
                } else {
                    window.location.href = "https://phantom.app/ul/v1/connect?app_url=https://dott.com.ua";
                }
            } else if (walletType === "solflare") {
                if (wallet.adapter.name === "Solflare") {
                    await wallet.adapter.connect();
                } else {
                    window.location.href = "https://solflare.com/connect?redirect=https://dott.com.ua";
                }
            }
        } catch (error) {
            console.error("Помилка підключення:", error);
        }
    };

    return (
        <div>
            <h1>Solana Swap</h1>
            <WalletMultiButton />
            {walletAddress ? (
                <p>Гаманець: {walletAddress}</p>
            ) : (
                <>
                    <button onClick={() => handleMobileConnect("phantom")}>Підключити Phantom</button>
                    <button onClick={() => handleMobileConnect("solflare")}>Підключити Solflare</button>
                </>
            )}
        </div>
    );
};

const WalletApp = () => {
    const wallets = useMemo(() => [
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter()
    ], []);

    return (
        <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
                <App />
            </WalletModalProvider>
        </WalletProvider>
    );
};

export default WalletApp;



// Відображення модального вікна підтвердження
function showConfirmationModal(currency, amount) {
    const modal = document.getElementById("confirmation-modal");
    document.getElementById("confirm-currency").innerText = currency;
    document.getElementById("confirm-amount").innerText = amount;
    modal.style.display = "block";
}

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
