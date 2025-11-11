<script lang="ts">
  import "./app.css";
  import {
    setOptions,
    setCatalogue,
    getAst,
    clearSiteResults,
    querySpot,
    markSiteClaimed,
    setSiteResult,
    type SpotResult,
    type Catalogue,
  } from "@samply/lens";
  import { negotiate } from "$lib/project-manager";
  import { options } from "./lib/env-options";
  import { SvelteMap } from "svelte/reactivity";
  import { onMount } from "svelte";
  import { env } from "$env/dynamic/public";
  import catalogueProd from "./config/catalogue.json";
  import catalogueTest from "./config/catalogue-test.json";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function normalizeStratifierUsingAggregator(
    siteResult: never,
    stratKey: string,
    aggregator: (
      values: Array<{ key: string; population: number }>,
    ) => Array<{ key: string; population: number }>,
  ) {
    const s = siteResult?.stratifiers;
    if (!s || !s[stratKey]) return;

    // object -> array
    const asArray = Object.entries(s[stratKey]).map(([key, population]) => ({
      key,
      population: Number(population) || 0,
    }));

    // normalize
    const normalized = aggregator(asArray);

    // array -> object
    s[stratKey] = Object.fromEntries(
      normalized.map(({ key, population }) => [key, population]),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const normalizeGenderAggregator = (
    values: Array<{ key: string; population: number }>,
  ) => {
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const map = new Map<string, number>();
    const canon = (raw: string) => {
      const k = raw.trim().toLowerCase();
      if (k === "m" || k === "male") return "Male";
      if (k === "f" || k === "female") return "Female";
      if (["other", "diverse"].includes(k)) return "Other";
      if (["unknown", "unbekannt", "unk", "n/a", "na"].includes(k))
        return "Unknown";
      return raw.charAt(0).toUpperCase() + raw.slice(1);
    };

    for (const { key, population } of values) {
      const c = canon(key);
      map.set(c, (map.get(c) || 0) + (Number(population) || 0));
    }
    return [...map.entries()].map(([key, population]) => ({ key, population }));
  };

  let abortController = new AbortController();
  window.addEventListener("lens-search-triggered", () => {
    abortController.abort();
    abortController = new AbortController();
    clearSiteResults();

    /** Helper function to base64 encode a UTF-8 string */
    const base64Encode = (utf8String: string) =>
      btoa(String.fromCharCode(...new TextEncoder().encode(utf8String)));

    const query = base64Encode(
      JSON.stringify({
        lang: "ast",
        payload: base64Encode(
          JSON.stringify({ ast: getAst(), id: crypto.randomUUID() }),
        ),
      }),
    );
    querySpot(query, abortController.signal, (result: SpotResult) => {
      const site = result.from.split(".")[1];
      if (result.status === "claimed") {
        markSiteClaimed(site);
      } else if (result.status === "succeeded") {
        const siteResult = JSON.parse(atob(result.body));
        setSiteResult(site, siteResult);
      } else {
        hideFailedSite(site);
        console.error(
          `Site ${site} failed with status ${result.status}:`,
          result.body,
        );
      }
    });
  });

  window.addEventListener("lens-negotiate-triggered", () => {
    negotiate();
  });

  onMount(() => {
    setOptions(options);

    // Set the catalogue based on the environment
    let catalogue = catalogueProd as Catalogue;
    if (env.PUBLIC_ENVIRONMENT === "test") {
      catalogue = catalogueTest as Catalogue;
    }
    setCatalogue(catalogue);
  });

  const saveQuery = () => {
    // The query is already stored in the URL, so we can create a simple HTML file that redirects to the current URL.
    const url = window.location.href;
    const htmlContent = `<html><head><meta http-equiv="refresh" content="0;url=${url}"></head><body></body></html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const currentDate = new Date();

    const formattedDate = currentDate.toLocaleDateString("de-DE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    a.download = `itcc-explorer-query-${formattedDate}.html`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  let catalogueOpen: boolean = false;
  const barChartBackgroundColors: string[] = ["#4dc9f6", "#3da4c7"];

  const genderHeaders: Map<string, string> = new SvelteMap<string, string>()
    .set("Male", "Male")
    .set("male", "Male")
    .set("Female", "Female")
    .set("female", "Female");

  const vitalStateHeaders: Map<string, string> = new SvelteMap<string, string>()
    .set("alive", "Alive")
    .set("Alive", "Alive")
    .set("Dead", "Deceased")
    .set("Deceased", "Deceased")
    .set("unknown", "Unknown")
    .set("Unknown", "Unknown");
</script>

<header>
  <div class="header-wrapper">
    <div class="logo">
      <img src="../logo-ITCC.jpg" alt="ITCC" />
    </div>
    <div class="logo">
      <img src="../logo-kitz.svg" alt="KiTZ" />
    </div>
    <div class="logo">
      <img src="../logo-PMC-netherlands.svg" alt="Princess Máxima Center" />
    </div>
    <div class="logo">
      <img src="../logo-itcc-zerocc.jpg" alt="Kids Canser Centre" />
    </div>
    <div class="logo">
      <img
        src="../logo-itcc-smpaeds.png"
        alt="The Institute of Canser Research"
      />
    </div>
    <div class="logo">
      <img src="../logo-itcc-dcci.svg" alt="Danish Region hovedstaden" />
    </div>
    <div class="logo">
      <img
        src="../logo-itcc-profyle.jpg"
        alt="Precision Oncology For Young People"
      />
    </div>
    <div class="logo">
      <img
        src="../logo-itcc-mappyacts.png"
        alt="Gustave Roussy Cancer Centre"
      />
    </div>
    <h1>ITCC Clinical Data Portal</h1>
  </div>
</header>

<main>
  <div class="search">
    <div class="search-wrapper">
      <lens-search-bar noMatchesFoundMessage="No results found"
      ></lens-search-bar>
      <lens-query-explain-button
        noQueryMessage="Empty search query: Searches for all results."
      ></lens-query-explain-button>
      <button class="save_button" on:click={saveQuery} title="Save search query"
        ><img alt="Save search criteria" src="save_24.svg" />
      </button>
      <lens-search-button title="Search"></lens-search-button>
    </div>
  </div>

  <div class="grid">
    <div class="catalogue-wrapper">
      <div class="catalogue">
        <div class="catalogue-header">
          <h2>Search Criteria</h2>
          <lens-info-button
            message={[
              `The search is patient-oriented.`,
              `For patients with multiple oncological diagnoses, selected search criteria may not only refer to one disease, but also to others.`,
              `Within a category, different variations are searched with an 'OR-link'; when searching across multiple categories, with an 'AND-link'.`,
            ]}
            buttonSize="20px"
            alignDialogue="left"
          ></lens-info-button>
        </div>
        <lens-catalogue toggle={{ collapsable: false, open: catalogueOpen }}
        ></lens-catalogue>
      </div>
    </div>

    <div class="charts">
      <div class="chart-wrapper result-summary">
        <lens-result-summary></lens-result-summary>
        {#if options.projectmanagerOptions}
          <lens-negotiate-button
            type="ProjectManager"
            title="Data and sample requests"
          ></lens-negotiate-button>
        {/if}
        <lens-search-modified-display
          >Charts no longer represent the current search!</lens-search-modified-display
        >
      </div>
      <div class="chart-wrapper chart-diagnosis">
        <lens-chart
          title="Diagnosis"
          dataKey="diagnosis"
          chartType="bar"
          indexAxis="y"
          xAxisTitle="Diagnosis Count"
          yAxisTitle="Diagnosis"
          backgroundColor={barChartBackgroundColors}
        ></lens-chart>
      </div>
      <div class="chart-wrapper result-table">
        <lens-result-table pageSize={10}> </lens-result-table>
      </div>
      <div class="chart-wrapper">
        <lens-chart
          title="Sex Distribution"
          dataKey="Gender"
          chartType="pie"
          displayLegends={true}
          headers={genderHeaders}
        ></lens-chart>
      </div>
      <div class="chart-wrapper chart-age-distribution">
        <lens-chart
          title="Diagnosis Age Distribution"
          dataKey="diagnosisAge"
          chartType="bar"
          groupRange={10}
          filterRegex="^(([0-9]?[0-9]$)|(1[0-2]0))"
          xAxisTitle="Age"
          yAxisTitle="Diagnosis Count"
          backgroundColor={barChartBackgroundColors}
        ></lens-chart>
      </div>
      <div class="chart-wrapper">
        <lens-chart
          title="Vital Status"
          dataKey="75186-7"
          chartType="pie"
          displayLegends={true}
          headers={vitalStateHeaders}
        ></lens-chart>
      </div>
      <div class="chart-wrapper chart-age-distribution">
        <lens-chart
          title="Molecular Marker Distribution"
          dataKey="MolecularMarkers"
          chartType="bar"
          xAxisTitle="Molecular Marker"
          yAxisTitle="Count"
          backgroundColor={barChartBackgroundColors}
        ></lens-chart>
      </div>
    </div>
  </div>
</main>

<footer>
  <div>
    Made with ♥ and <a href="https://github.com/samply/lens">samply/lens</a>
  </div>
  <div class="logo">
    <img src="../logo-dkfz.svg" alt="DKFZ" />
  </div>
</footer>

<style>
  .catalogue-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--gap-s);
  }

  .catalogue-header h2 {
    margin: 0;
  }
</style>
