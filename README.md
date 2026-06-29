<!--
SPDX-FileCopyrightText: 2026 Kaito Udagawa <umireon@kaito.tokyo>

SPDX-License-Identifier: Apache-2.0
-->

# kaito-tokyo/setup-apple-codesigning

This action provides Apple codesigning for GitHub Actions users.

## Usage

See https://github.com/kaito-tokyo/setup-apple-codesigning/wiki for recommended setup.

<!-- start usage -->
```yaml
- uses: kaito-tokyo/setup-apple-codesigning@main
  with:
    MACOS_SIGNING_CERT: ${{ secrets.MACOS_SIGNING_CERT }}
    MACOS_SIGNING_CERT_PASSWORD: ${{ secrets.MACOS_SIGNING_CERT_PASSWORD }}
```
<!-- end usage -->
