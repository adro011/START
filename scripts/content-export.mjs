#!/usr/bin/env node
/**
 * Export site content (sections + theme tokens) to JSON files.
 * Usage: node scripts/content-export.mjs [--output-dir=./content]
 */

import { createClient } from "@supabase/supabase-js";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
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
  const outputDirArg = args.find((a) => a.startsWith("--output-dir="));
  const outputDir = outputDirArg ? outputDirArg.split("=")[1] : "./content";
  const outputPath = resolve(ROOT, outputDir);

  console.log(`Exporting content to ${outputPath}...`);

  const { url, key } = getEnv();
  const supabase = createClient(url, key);

  // Fetch all sections
  const { data: sections, error: sectionsError } = await supabase
    .from("site_sections")
    .select("*")
    .order("sort", { ascending: true });

  if (sectionsError) {
    console.error("Failed to fetch sections:", sectionsError.message);
    process.exit(1);
  }

  // Fetch all theme tokens
  const { data: tokens, error: tokensError } = await supabase
    .from("theme_tokens")
    .select("*")
    .order("key", { ascending: true });

  if (tokensError) {
    console.error("Failed to fetch tokens:", tokensError.message);
    process.exit(1);
  }

  // Fetch content versions (last 50 per section)
  const { data: versions, error: versionsError } = await supabase
    .from("content_versions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (versionsError) {
    console.warn("Failed to fetch versions:", versionsError.message);
  }

  const timestamp = new Date().toISOString();
  const exportData = {
    exportedAt: timestamp,
    sections: sections ?? [],
    tokens: tokens ?? [],
    versions: versions ?? [],
  };

  mkdirSync(outputPath, { recursive: true });

  writeFileSync(
    resolve(outputPath, "content-export.json"),
    JSON.stringify(exportData, null, 2)
  );

  // Also write individual files for GitHub-friendly structure
  writeFileSync(
    resolve(outputPath, "sections.json"),
    JSON.stringify({ sections: sections ?? [], exportedAt: timestamp }, null, 2)
  );

  writeFileSync(
    resolve(outputPath, "theme-tokens.json"),
    JSON.stringify({ tokens: tokens ?? [], exportedAt: timestamp }, null, 2)
  );

  writeFileSync(
    resolve(outputPath, "content-versions.json"),
    JSON.stringify({ versions: versions ?? [], exportedAt: timestamp }, null, 2)
  );

  console.log(`✓ Exported ${sections?.length ?? 0} sections, ${tokens?.length ?? 0} tokens, ${versions?.length ?? 0} versions`);
  console.log(`✓ Files written to ${outputPath}`);
}

main().catch((e) => {
  console.error("Export failed:", e);
  process.exit(1);
});