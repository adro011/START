import { getAllSiteSections, getThemeTokens } from "@/lib/site-content";

interface GitHubConfig {
  token: string;
  repo: string;
  branch: string;
  path: string;
}

function getGitHubConfig(): GitHubConfig | null {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH ?? "main";
  const path = process.env.GITHUB_CONTENT_PATH ?? "content";

  if (!token || !repo) return null;
  return { token, repo, branch, path };
}

async function githubRequest(
  config: GitHubConfig,
  endpoint: string,
  options: RequestInit = {}
) {
  const url = `https://api.github.com/repos/${config.repo}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(`GitHub API ${res.status}: ${error.message ?? res.statusText}`);
  }

  return res.json();
}

async function getFileSha(config: GitHubConfig, filePath: string): Promise<string | null> {
  try {
    const data = await githubRequest(config, `/contents/${config.path}/${filePath}?ref=${config.branch}`);
    return data.sha;
  } catch {
    return null;
  }
}

async function putFile(
  config: GitHubConfig,
  filePath: string,
  content: string,
  message: string,
  sha?: string | null
) {
  const body = {
    message,
    content: Buffer.from(content).toString("base64"),
    branch: config.branch,
    ...(sha ? { sha } : {}),
  };

  await githubRequest(config, `/contents/${config.path}/${filePath}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function syncContentToGitHub(): Promise<{ ok: boolean; error?: string }> {
  const config = getGitHubConfig();
  if (!config) {
    return { ok: false, error: "GitHub not configured (GITHUB_TOKEN, GITHUB_REPO required)" };
  }

  try {
    const [sections, tokens] = await Promise.all([
      getAllSiteSections(),
      getThemeTokens(),
    ]);

    const timestamp = new Date().toISOString();

    // sections.json
    await putFile(
      config,
      "sections.json",
      JSON.stringify({ sections, exportedAt: timestamp }, null, 2),
      `chore(content): sync sections ${timestamp}`,
      await getFileSha(config, "sections.json")
    );

    // theme-tokens.json
    await putFile(
      config,
      "theme-tokens.json",
      JSON.stringify({ tokens, exportedAt: timestamp }, null, 2),
      `chore(content): sync theme tokens ${timestamp}`,
      await getFileSha(config, "theme-tokens.json")
    );

    // content-versions.json (last 100 versions per section)
    // Note: This would require fetching versions per section; skipping for brevity
    // but structure is ready.

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Sync failed" };
  }
}

export async function importContentFromGitHub(): Promise<{ ok: boolean; error?: string }> {
  const config = getGitHubConfig();
  if (!config) {
    return { ok: false, error: "GitHub not configured" };
  }

  // This would fetch and apply content from GitHub
  // Implementation depends on whether you want one-way (DB→GitHub) or two-way sync
  // For now, we only implement DB→GitHub (export) as the primary flow.
  return { ok: false, error: "Import not implemented (export-only by design)" };
}