// src/client.js
import dotenv from "dotenv";
import { Client, PrivateKey } from "@hashgraph/sdk";

dotenv.config();

if (!process.env.OPERATOR_ID || !process.env.OPERATOR_KEY) {
  throw new Error("OPERATOR_ID and OPERATOR_KEY must be set in .env");
}

const client = Client.forTestnet();
client.setOperator(process.env.OPERATOR_ID, PrivateKey.fromString(process.env.OPERATOR_KEY));

export default client;
