import crypto from "node:crypto";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function getCurrentPeriodStamp() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getAccountSummary(state, account) {
  const plan = state.plans.find((entry) => entry.id === account.planId);
  const usage = normalizeUsageForAccount(account);
  const remainingExports = plan.exportsPerMonth < 0 ? null : Math.max(plan.exportsPerMonth - usage.exportsUsed, 0);

  return {
    id: account.id,
    name: account.name,
    slug: account.slug,
    email: account.email,
    planId: account.planId,
    planName: plan.name,
    createdAt: account.createdAt,
    usage,
    limits: {
      exportsPerMonth: plan.exportsPerMonth,
      remainingExports,
      seats: plan.seats
    },
    apiKeys: account.apiKeys.map((apiKey) => ({
      id: apiKey.id,
      name: apiKey.name,
      token: apiKey.token,
      lastFour: apiKey.token.slice(-4),
      createdAt: apiKey.createdAt,
      lastUsedAt: apiKey.lastUsedAt
    }))
  };
}

function normalizeUsageForAccount(account) {
  const currentPeriod = getCurrentPeriodStamp();
  if (!account.usage || account.usage.period !== currentPeriod) {
    return {
      period: currentPeriod,
      exportsUsed: 0
    };
  }

  return account.usage;
}

function summarizeJob(job) {
  return {
    id: job.id,
    accountId: job.accountId,
    frameName: job.frameName,
    createdAt: job.createdAt,
    convertedNodes: job.convertedNodes,
    warningCount: job.warningCount,
    exportFile: job.exportFile,
    origin: job.origin,
    clientName: job.clientName
  };
}

async function ensureStateFile(dataPath, seedPath) {
  await mkdir(dirname(dataPath), { recursive: true });

  try {
    await readFile(dataPath, "utf8");
  } catch {
    if (seedPath) {
      await copyFile(seedPath, dataPath);
      return;
    }

    const initialState = {
      plans: [],
      accounts: [],
      jobs: []
    };

    await writeFile(dataPath, `${JSON.stringify(initialState, null, 2)}\n`, "utf8");
  }
}

async function readState(dataPath, seedPath) {
  await ensureStateFile(dataPath, seedPath);
  const raw = await readFile(dataPath, "utf8");
  return JSON.parse(raw);
}

async function writeState(dataPath, state) {
  await mkdir(dirname(dataPath), { recursive: true });
  await writeFile(dataPath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function touchAccount(account) {
  account.updatedAt = new Date().toISOString();
}

function findAccountByToken(state, token) {
  if (!token) {
    return null;
  }

  for (const account of state.accounts) {
    const apiKey = account.apiKeys.find((entry) => entry.token === token);
    if (apiKey) {
      return { account, apiKey };
    }
  }

  return null;
}

function getExportPath(rootDir, jobId) {
  return join(rootDir, "data", "exports", `${jobId}.json`);
}

export async function getBootstrapData(dataPath, seedPath) {
  const state = await readState(dataPath, seedPath);
  const account = state.accounts[0];

  if (!account) {
    throw createHttpError(500, "No account is configured for this workspace.");
  }

  const summary = getAccountSummary(state, account);
  const jobs = state.jobs
    .filter((job) => job.accountId === account.id)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map((job) => summarizeJob(job));

  return {
    ok: true,
    account: summary,
    plans: clone(state.plans),
    jobs,
    defaultApiKey: summary.apiKeys[0] || null
  };
}

export async function createApiKey(dataPath, seedPath, name = "Plugin Key") {
  const state = await readState(dataPath, seedPath);
  const account = state.accounts[0];

  if (!account) {
    throw createHttpError(500, "No account is configured for this workspace.");
  }

  const apiKey = {
    id: `key_${crypto.randomBytes(6).toString("hex")}`,
    name,
    token: `f2e_live_${crypto.randomBytes(18).toString("hex")}`,
    createdAt: new Date().toISOString(),
    lastUsedAt: null
  };

  account.apiKeys.unshift(apiKey);
  touchAccount(account);
  await writeState(dataPath, state);

  return {
    ok: true,
    apiKey: {
      ...apiKey,
      lastFour: apiKey.token.slice(-4)
    }
  };
}

export async function listJobsForToken(dataPath, seedPath, token) {
  const state = await readState(dataPath, seedPath);
  const match = findAccountByToken(state, token);

  if (!match) {
    throw createHttpError(401, "A valid API key is required.");
  }

  return {
    ok: true,
    jobs: state.jobs
      .filter((job) => job.accountId === match.account.id)
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .map((job) => summarizeJob(job))
  };
}

export async function getJobForToken(dataPath, seedPath, token, jobId) {
  const state = await readState(dataPath, seedPath);
  const match = findAccountByToken(state, token);

  if (!match) {
    throw createHttpError(401, "A valid API key is required.");
  }

  const job = state.jobs.find((entry) => entry.id === jobId && entry.accountId === match.account.id);
  if (!job) {
    throw createHttpError(404, "The requested conversion job was not found.");
  }

  return {
    ok: true,
    job
  };
}

export async function recordConversionJob({
  dataPath,
  seedPath,
  rootDir,
  token,
  source,
  result,
  clientName = "web-playground",
  origin = "web"
}) {
  const state = await readState(dataPath, seedPath);
  const match = findAccountByToken(state, token);

  if (!match) {
    throw createHttpError(401, "A valid API key is required.");
  }

  const { account, apiKey } = match;
  const plan = state.plans.find((entry) => entry.id === account.planId);
  const usage = normalizeUsageForAccount(account);

  if (plan.exportsPerMonth >= 0 && usage.exportsUsed >= plan.exportsPerMonth) {
    throw createHttpError(403, `Plan limit reached for ${plan.name}. Upgrade to continue exporting this month.`);
  }

  usage.exportsUsed += 1;
  account.usage = usage;
  apiKey.lastUsedAt = new Date().toISOString();
  touchAccount(account);

  const jobId = `job_${crypto.randomBytes(6).toString("hex")}`;
  const exportFile = `data/exports/${jobId}.json`;
  const job = {
    id: jobId,
    accountId: account.id,
    frameName: result.template.title,
    createdAt: new Date().toISOString(),
    convertedNodes: result.report.convertedNodes,
    warningCount: result.report.warnings.length,
    exportFile,
    origin,
    clientName,
    source,
    template: result.template,
    report: result.report
  };

  state.jobs.unshift(job);

  await mkdir(dirname(getExportPath(rootDir, jobId)), { recursive: true });
  await writeFile(getExportPath(rootDir, jobId), `${JSON.stringify(result.template, null, 2)}\n`, "utf8");
  await writeState(dataPath, state);

  return {
    ok: true,
    job: summarizeJob(job),
    account: getAccountSummary(state, account),
    plan: clone(plan)
  };
}
