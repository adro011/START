#!/usr/bin/env node
/**
 * Import site content from JSON export.
 * Usage: node scripts/content-import.mjs [--input=./content/content-export.json] [--dry-run]
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function getEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  return { url, key };
}

async function main() {
  const args = process.argv.slice(2);
  const inputArg = args.find((a) => a.startsWith("--input="));
  const inputFile = inputArg ? inputArg.split("=")[1] : "./content/content-export.json";
  const dryRun = args.includes("--dry-run");
  const inputPath = resolve(ROOT, inputFile);

  if (!existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }

  console.log(`${dryRun ? "[DRY RUN] " : ""}Importing content from ${inputPath}...`);

  const { url, key } = getEnv();
  const supabase = createClient(url, key);

  const raw = readFileSync(inputPath, "utf-8");
  /** @type {{ sections?: Array<{ key: string; label: string; kind: string; sort: number; enabled: boolean; content: unknown; styles: unknown }>; tokens?: Array<{ key: string; value: string; description: string | null }>; versions?: Array<unknown> }} */
  let data;

  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse JSON:", e);
    process.exit(1);
  }

  let sectionsImported = 0;
  let tokensImported = 0;

  if (data.sections && data.sections.length > 0) {
    console.log(`${dryRun ? "[DRY RUN] " : ""}Importing ${data.sections.length} sections...`);
    for (const section of data.sections) {
      if (dryRun) {
        console.log(`  - ${section.key} (${section.kind})`);
        sectionsImported++;
        continue;
      }

      const { error } = await supabase
        .from("site_sections")
        .upsert({
          key: section.key,
          label: section.label,
          kind: section.kind,
          sort: section.sort,
          enabled: section.enabled,
          content: section.content,
          styles: section.styles,
        });

      if (error) {
        console.error(`  ✗ Failed to import ${section.key}:`, error.message);
      } else {
        console.log(`  ✓ ${section.key}`);
        sectionsImported++;
      }
    }
  }

  if (data.tokens && data.tokens.length > 0) {
    console.log(`${dryRun ? "[DRY RUN] " : ""}Importing ${data.tokens.length} theme tokens...`);
    for (const token of data.tokens) {
      if (dryRun) {
        console.log(`  - ${token.key}`);
        tokensImported++;
        continue;
      }

      const { error } = await supabase
        .from("theme_tokens")
        .upsert({
          key: token.key,
          value: token.value,
          description: token.description,
        });

      if (error) {
        console.error(`  ✗ Failed to import ${token.key}:`, error.message);
      } else {
        console.log(`  ✓ ${token.key}`);
        tokensImported++;
      }
    }
  }

  console.log(`\n${dryRun ? "[DRY RUN] " : ""}Done! ${sectionsImported} sections, ${tokensImported} tokens ${dryRun ? "would be" : ""} imported.`);
}

main().catch((e) => {
  console.error("Import failed:", e);
  process.exit(1);
});