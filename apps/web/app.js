const inputEl = document.querySelector("#input-json");
const outputEl = document.querySelector("#output-json");
const reportEl = document.querySelector("#report");
const loadExampleButton = document.querySelector("#load-example");
const runConvertButton = document.querySelector("#run-convert");
const downloadButton = document.querySelector("#download-json");
const pricingGridEl = document.querySelector("#pricing-grid");
const accountSummaryEl = document.querySelector("#account-summary");
const usageSummaryEl = document.querySelector("#usage-summary");
const usageFillEl = document.querySelector("#usage-fill");
const apiKeySelectEl = document.querySelector("#api-key-select");
const apiKeyValueEl = document.querySelector("#api-key-value");
const pluginEndpointEl = document.querySelector("#plugin-endpoint");
const pluginSnippetEl = document.querySelector("#plugin-snippet");
const newKeyNameEl = document.querySelector("#new-key-name");
const createKeyButton = document.querySelector("#create-key");
const refreshJobsButton = document.querySelector("#refresh-jobs");
const jobsBodyEl = document.querySelector("#jobs-body");
const jobsEmptyEl = document.querySelector("#jobs-empty");
const playgroundEndpointEl = document.querySelector("#playground-endpoint");
const playgroundApiKeyEl = document.querySelector("#playground-api-key");

let latestTemplate = null;
let latestJobId = null;
let bootstrapPayload = null;

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildExportFilename(title, uniqueSuffix = "") {
  const base = slugify(title) || "elementor-template";

  if (uniqueSuffix) {
    return `${base}-${uniqueSuffix}.json`;
  }

  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "z");
  return `${base}-${stamp}.json`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function currentApiKey() {
  return playgroundApiKeyEl.value.trim();
}

function currentEndpoint() {
  return playgroundEndpointEl.value.trim();
}

function renderReport(report) {
  if (!report) {
    reportEl.textContent = "";
    return;
  }

  const warnings = report.warnings.length ? report.warnings.join(" | ") : "No mapper warnings.";
  const jobText = latestJobId ? ` Saved as job ${latestJobId}.` : "";
  reportEl.textContent = `Converted ${report.convertedNodes} nodes.${jobText} ${warnings}`;
}

function renderPlans(plans, activePlanId) {
  pricingGridEl.innerHTML = plans
    .map((plan) => {
      const exportLabel = plan.exportsPerMonth < 0 ? "Unlimited exports" : `${plan.exportsPerMonth} exports / month`;
      const priceLabel = plan.priceLabel || `$${plan.priceMonthly}`;
      const cadenceLabel = plan.priceSuffix || (typeof plan.priceMonthly === "number" ? "/month" : "");
      return `
        <article class="feature-card ${plan.id === activePlanId ? "plan-active" : ""}">
          <p class="panel-label">${escapeHtml(plan.name)}</p>
          <div class="price">${escapeHtml(priceLabel)}<small>${escapeHtml(cadenceLabel)}</small></div>
          <p>${escapeHtml(exportLabel)} · ${plan.seats} seat${plan.seats > 1 ? "s" : ""}</p>
          <ul class="feature-list">
            ${plan.features.map((feature) => `<li>${escapeHtml(feature)}</li>`).join("")}
          </ul>
        </article>
      `;
    })
    .join("");
}

function renderAccount(account) {
  accountSummaryEl.innerHTML = `
    <strong>${escapeHtml(account.name)}</strong>
    <p>${escapeHtml(account.email)}</p>
    <p>Plan: ${escapeHtml(account.planName)}</p>
    <p>Slug: ${escapeHtml(account.slug)}</p>
  `;

  const limit = account.limits.exportsPerMonth;
  const used = account.usage.exportsUsed;
  const usageLabel = limit < 0 ? `${used} exports this month` : `${used} of ${limit} exports used`;
  const remaining = limit < 0 ? "Unlimited remaining" : `${account.limits.remainingExports} exports remaining`;
  const width = limit < 0 ? Math.min(used * 4, 100) : Math.min((used / Math.max(limit, 1)) * 100, 100);

  usageSummaryEl.innerHTML = `
    <strong>${escapeHtml(usageLabel)}</strong>
    <p>Billing period: ${escapeHtml(account.usage.period)}</p>
    <p>${escapeHtml(remaining)}</p>
  `;

  usageFillEl.style.width = `${width}%`;
}

function syncApiKeyInputs(apiKeys, preferredToken) {
  apiKeySelectEl.innerHTML = apiKeys
    .map((key) => `<option value="${escapeHtml(key.token)}">${escapeHtml(key.name)} ••••${escapeHtml(key.lastFour)}</option>`)
    .join("");

  if (preferredToken) {
    apiKeySelectEl.value = preferredToken;
  }

  const selectedToken = apiKeySelectEl.value || apiKeys[0]?.token || "";
  playgroundApiKeyEl.value = selectedToken;
  apiKeyValueEl.textContent = selectedToken || "No API key available.";
}

function renderPluginConfig() {
  pluginEndpointEl.textContent = `Endpoint: ${currentEndpoint()}`;
  pluginSnippetEl.textContent = `API key: ${currentApiKey() || "Copy an API key from the dashboard first."}`;
}

function renderJobs(jobs) {
  jobsEmptyEl.style.display = jobs.length ? "none" : "block";
  jobsBodyEl.innerHTML = jobs
    .map((job) => {
      const downloadHref = `/api/jobs/${encodeURIComponent(job.id)}/download?apiKey=${encodeURIComponent(currentApiKey())}`;
      return `
        <tr>
          <td>${escapeHtml(job.frameName)}</td>
          <td>${new Date(job.createdAt).toLocaleString()}</td>
          <td>${job.convertedNodes}</td>
          <td>${job.warningCount}</td>
          <td>${escapeHtml(job.origin)}</td>
          <td><a href="${downloadHref}">Download</a></td>
        </tr>
      `;
    })
    .join("");
}

function applyBootstrap(payload, preferredToken = null) {
  bootstrapPayload = payload;
  renderPlans(payload.plans, payload.account.planId);
  renderAccount(payload.account);
  syncApiKeyInputs(payload.account.apiKeys, preferredToken || payload.defaultApiKey?.token);
  renderPluginConfig();
  renderJobs(payload.jobs);
}

async function bootstrapPlatform(preferredToken = null) {
  const response = await fetch("/api/platform/bootstrap");
  const payload = await response.json();
  playgroundEndpointEl.value = `${window.location.origin}/api/convert`;
  applyBootstrap(payload, preferredToken);
}

async function loadExample() {
  const response = await fetch("/api/example");
  const payload = await response.json();

  inputEl.value = JSON.stringify(payload.source, null, 2);
  outputEl.value = JSON.stringify(payload.template, null, 2);
  latestTemplate = payload.template;
  renderReport(payload.report);
  downloadButton.disabled = false;
}

async function refreshJobs() {
  const response = await fetch("/api/jobs", {
    headers: {
      "x-api-key": currentApiKey()
    }
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "Could not load jobs.");
  }

  renderJobs(payload.jobs);
}

async function convertPayload() {
  try {
    const payload = JSON.parse(inputEl.value);
    const response = await fetch(currentEndpoint(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": currentApiKey(),
        "x-client-name": "web-playground",
        "x-origin-app": "web"
      },
      body: JSON.stringify({
        source: payload
      })
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Conversion failed.");
    }

    outputEl.value = JSON.stringify(result.template, null, 2);
    latestTemplate = result.template;
    latestJobId = result.job?.id || null;
    renderReport(result.report);
    downloadButton.disabled = false;
    if (result.account) {
      renderAccount(result.account);
    }
    await refreshJobs();
  } catch (error) {
    latestJobId = null;
    renderReport({
      convertedNodes: 0,
      warnings: [error instanceof Error ? error.message : "Could not convert payload."]
    });
  }
}

function downloadOutput() {
  if (!latestTemplate) {
    return;
  }

  const blob = new Blob([JSON.stringify(latestTemplate, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = buildExportFilename(latestTemplate.title, latestJobId ? latestJobId.replace(/^job_/, "") : "");
  anchor.click();
  URL.revokeObjectURL(url);
}

async function createKey() {
  const response = await fetch("/api/keys", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: newKeyNameEl.value.trim() || "Plugin Key"
    })
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "Could not create API key.");
  }

  await bootstrapPlatform(payload.apiKey.token);
}

loadExampleButton.addEventListener("click", loadExample);
runConvertButton.addEventListener("click", convertPayload);
downloadButton.addEventListener("click", downloadOutput);
createKeyButton.addEventListener("click", async () => {
  try {
    await createKey();
  } catch (error) {
    reportEl.textContent = error instanceof Error ? error.message : "Could not create key.";
  }
});
refreshJobsButton.addEventListener("click", async () => {
  try {
    await refreshJobs();
  } catch (error) {
    reportEl.textContent = error instanceof Error ? error.message : "Could not refresh jobs.";
  }
});
apiKeySelectEl.addEventListener("change", () => {
  playgroundApiKeyEl.value = apiKeySelectEl.value;
  apiKeyValueEl.textContent = apiKeySelectEl.value;
  renderPluginConfig();
  refreshJobs().catch(() => {});
});
playgroundApiKeyEl.addEventListener("input", () => {
  apiKeyValueEl.textContent = playgroundApiKeyEl.value.trim();
  renderPluginConfig();
});
playgroundEndpointEl.addEventListener("input", renderPluginConfig);

await bootstrapPlatform();
await loadExample();
