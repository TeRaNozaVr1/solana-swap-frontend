import { Connection, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import { Buffer } from "buffer"; // Додаємо підтримку buffer

window.Buffer = Buffer; // Робимо buffer доступним у браузері

const connection = new Connection("https://api.mainnet-beta.solana.com");
console.log("Solana Web3.js підключено!");
