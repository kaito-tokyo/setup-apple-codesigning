#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Kaito Udagawa <umireon@kaito.tokyo>
//
// SPDX-License-Identifier: Apache-2.0

import { execFileSync } from "node:child_process";
import { readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

function securitySync(...args) {
	return execFileSync("/usr/bin/security", args, { stdio: "ignore" });
}

const { RUNNER_TEMP } = process.env;

if (!RUNNER_TEMP) {
	throw new Error("RUNNER_TEMP missing!");
}

let ok = true;

try {
	securitySync("default-keychain", "-s");
} catch (error) {
	ok = false;
	console.error(error);
}

for (const entry of readdirSync(RUNNER_TEMP, { withFileTypes: true })) {
	if (entry.isDirectory() && entry.name.startsWith("setup-apple-codesigning-")) {
		const target = join(RUNNER_TEMP, entry.name);

		try {
			securitySync("delete-keychain", join(target, "app-signing.keychain-db"));
		} catch (error) {
			ok = false;
			console.error(error);
		}

		try {
			rmSync(target, { force: true, maxRetries: 10, recursive: true });
		} catch (error) {
			ok = false;
			console.error(error);
		}
	}
}

if (!ok) {
	throw new Error("Some error occurred during cleaning up!");
}
