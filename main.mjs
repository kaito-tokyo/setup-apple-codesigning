#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Kaito Udagawa <umireon@kaito.tokyo>
//
// SPDX-License-Identifier: Apache-2.0

import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

function securitySync(...args) {
	execFileSync("/usr/bin/security", args, { stdio: "ignore" });
}

const {
	INPUT_MACOS_SIGNING_CERT,
	INPUT_MACOS_SIGNING_CERT_PASSWORD,
	RUNNER_TEMP
} = process.env;

if (!INPUT_MACOS_SIGNING_CERT) {
	throw new Error("INPUT_MACOS_SIGNING_CERT missing!");
} else if (!INPUT_MACOS_SIGNING_CERT_PASSWORD) {
	throw new Error("INPUT_MACOS_SIGNING_CERT_PASSWORD missing!");
} else if (!RUNNER_TEMP) {
	throw new Error("RUNNER_TEMP missing!");
}

const KEYCHAIN_PASSWORD = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64");
const KEYCHAIN_TEMP_DIR = mkdtempSync(join(RUNNER_TEMP, "setup-apple-codesigning-"));

if (!KEYCHAIN_PASSWORD) {
	throw new Error("Failed to generate KEYCHAIN_PASSWORD!");
} else if (!KEYCHAIN_TEMP_DIR) {
	throw new Error("Failed to create KEYCHAIN_TEMP_DIR!");
}

console.log("::add-mask::" + KEYCHAIN_PASSWORD);

const keychainPath = join(KEYCHAIN_TEMP_DIR, "app-signing.keychain-db");
const certificatePath = join(KEYCHAIN_TEMP_DIR, "certificate.p12");

try {
	securitySync("create-keychain", "-p", KEYCHAIN_PASSWORD, keychainPath);
	securitySync("set-keychain-settings", "-lut", "21600", keychainPath);
	securitySync("unlock-keychain", "-p", KEYCHAIN_PASSWORD, keychainPath);
	securitySync("default-keychain", "-s", keychainPath);
	writeFileSync(certificatePath, Buffer.from(INPUT_MACOS_SIGNING_CERT, "base64"), { mode: 0o600 });
	securitySync("import", certificatePath, "-k", keychainPath, "-P", INPUT_MACOS_SIGNING_CERT_PASSWORD, "-T", "/usr/bin/codesign", "-T", "/usr/bin/productbuild");
	securitySync("set-key-partition-list", "-S", "apple-tool:,apple:,codesign:", "-s", "-k", KEYCHAIN_PASSWORD, keychainPath);
} catch {
	throw new Error("Failed to set up Apple code signing.");
} finally {
	rmSync(certificatePath, { force: true });
}
