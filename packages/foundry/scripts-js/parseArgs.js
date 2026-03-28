import { spawnSync } from "child_process";
import { config } from "dotenv";
import { join, dirname } from "path";
import { readFileSync, existsSync } from "fs";
import { parse } from "toml";
import { fileURLToPath } from "url";
import { selectOrCreateKeystore } from "./selectOrCreateKeystore.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
// Load `packages/foundry/.env` regardless of `process.cwd()` (e.g. monorepo root vs foundry package).
config({ path: join(__dirname, "..", ".env") });

// Common mistakes: missing var (Node would stringify as "undefined") or literal `undefined` / empty in .env
const badKeystorePlaceholders = new Set(["", "undefined", "null", "NULL"]);
function isBadKeystoreName(name) {
  return (
    name == null ||
    (typeof name === "string" && badKeystorePlaceholders.has(name.trim()))
  );
}
const ks = process.env.LOCALHOST_KEYSTORE_ACCOUNT;
if (isBadKeystoreName(ks)) {
  delete process.env.LOCALHOST_KEYSTORE_ACCOUNT;
}

// Get all arguments after the script name
const args = process.argv.slice(2);
let fileName = "Deploy.s.sol";
let network = "localhost";
let keystoreArg = null;

// Show help message if --help is provided
if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Usage: yarn deploy [options]
Options:
  --file <filename>     Specify the deployment script file (default: Deploy.s.sol)
  --network <network>   Specify the network (default: localhost)
  --keystore <name>     Specify the keystore account to use (bypasses selection prompt)
  --help, -h           Show this help message
Examples:
  yarn deploy --file DeployBlitzBuddy.s.sol --network sepolia
  yarn deploy --network sepolia --keystore my-account
  yarn deploy --file DeployBlitzBuddy.s.sol
  yarn deploy
  `);
  process.exit(0);
}

// Parse arguments
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--network" && args[i + 1]) {
    network = args[i + 1];
    i++; // Skip next arg since we used it
  } else if (args[i] === "--file" && args[i + 1]) {
    fileName = args[i + 1];
    i++; // Skip next arg since we used it
  } else if (args[i] === "--keystore" && args[i + 1]) {
    keystoreArg = args[i + 1];
    i++; // Skip next arg since we used it
  }
}

// Function to check if a keystore exists
function validateKeystore(keystoreName) {
  if (keystoreName === "scaffold-eth-default") {
    return true; // Default keystore is always valid
  }

  const keystorePath = join(
    process.env.HOME,
    ".foundry",
    "keystores",
    keystoreName
  );
  return existsSync(keystorePath);
}

// Check if the network exists in rpc_endpoints
try {
  const foundryTomlPath = join(__dirname, "..", "foundry.toml");
  const tomlString = readFileSync(foundryTomlPath, "utf-8");
  const parsedToml = parse(tomlString);

  if (!parsedToml.rpc_endpoints[network]) {
    console.log(
      `\n❌ Error: Network '${network}' not found in foundry.toml!`,
      "\nPlease check `foundry.toml` for available networks in the [rpc_endpoints] section or add a new network."
    );
    process.exit(1);
  }
} catch (error) {
  console.error("\n❌ Error reading or parsing foundry.toml:", error);
  process.exit(1);
}

const DEFAULT_LOCALHOST_KEYSTORE = "scaffold-eth-default";

const localhostEnvRaw = process.env.LOCALHOST_KEYSTORE_ACCOUNT;
const localhostEnvAccount =
  typeof localhostEnvRaw === "string" ? localhostEnvRaw.trim() : localhostEnvRaw;
if (
  network === "localhost" &&
  !isBadKeystoreName(localhostEnvAccount) &&
  localhostEnvAccount !== DEFAULT_LOCALHOST_KEYSTORE
) {
  console.log(`
⚠️ Warning: Using ${localhostEnvAccount} keystore account on localhost.

You can either:
1. Enter the password for ${localhostEnvAccount} account
   OR
2. Set the localhost keystore account in your .env and re-run the command to skip password prompt:
   LOCALHOST_KEYSTORE_ACCOUNT='${DEFAULT_LOCALHOST_KEYSTORE}'
`);
}

let selectedKeystore = localhostEnvAccount;
if (network !== "localhost") {
  if (keystoreArg) {
    // Use the keystore provided via command line argument
    if (!validateKeystore(keystoreArg)) {
      console.log(`\n❌ Error: Keystore '${keystoreArg}' not found!`);
      console.log(
        `Please check that the keystore exists in ~/.foundry/keystores/`
      );
      process.exit(1);
    }
    selectedKeystore = keystoreArg;
    console.log(`\n🔑 Using keystore: ${selectedKeystore}`);
  } else {
    try {
      selectedKeystore = await selectOrCreateKeystore();
    } catch (error) {
      console.error("\n❌ Error selecting keystore:", error);
      process.exit(1);
    }
  }
} else if (keystoreArg) {
  // Allow overriding the localhost keystore with --keystore flag
  if (!validateKeystore(keystoreArg)) {
    console.log(`\n❌ Error: Keystore '${keystoreArg}' not found!`);
    console.log(
      `Please check that the keystore exists in ~/.foundry/keystores/`
    );
    process.exit(1);
  }
  selectedKeystore = keystoreArg;
  console.log(
    `\n🔑 Using keystore: ${selectedKeystore} for localhost deployment`
  );
}

if (network === "localhost" && isBadKeystoreName(selectedKeystore)) {
  selectedKeystore = DEFAULT_LOCALHOST_KEYSTORE;
}

// Check for default account on live network
if (selectedKeystore === DEFAULT_LOCALHOST_KEYSTORE && network !== "localhost") {
  console.log(`
❌ Error: Cannot deploy to live network using default keystore account!

To deploy to ${network}, please follow these steps:

1. If you haven't generated a keystore account yet:
   $ yarn generate

2. Run the deployment command again.

The default account (${DEFAULT_LOCALHOST_KEYSTORE}) can only be used for localhost deployments.
`);
  process.exit(0);
}

const ethKeystoreForMake =
  network === "localhost" && isBadKeystoreName(selectedKeystore)
    ? DEFAULT_LOCALHOST_KEYSTORE
    : String(selectedKeystore);

process.env.DEPLOY_SCRIPT = `script/${fileName}`;
process.env.RPC_URL = network;
process.env.ETH_KEYSTORE_ACCOUNT = ethKeystoreForMake;

const result = spawnSync("make", ["deploy-and-generate-abis"], {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    DEPLOY_SCRIPT: `script/${fileName}`,
    RPC_URL: network,
    ETH_KEYSTORE_ACCOUNT: ethKeystoreForMake,
  },
});

process.exit(result.status);
