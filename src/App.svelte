<script lang="ts">
    import "./app.css";
    import { 
        setOptions,
        setCatalogue, 
        getAst,
        buildLibrary,
        buildMeasure,
        clearSiteResults,
        querySpot,
        markSiteClaimed,
        setSiteResult,
        type SpotResult,
        type Catalogue } from "@samply/lens";
    import catalogueJson from "./config/catalogue.json";
    import { measures } from "$lib/measures";
    import { negotiate } from "$lib/project-manager";
    import { translateAstToCql } from "$lib/ast-to-cql-translator";
    import { options } from "./lib/env-options";
    import { SvelteMap } from "svelte/reactivity";
    import { onMount } from "svelte";

  let abortController = new AbortController();
  window.addEventListener("lens-search-triggered", () => {
    abortController.abort();
    abortController = new AbortController();

    // AST to CQL translation
    const cql = translateAstToCql(
      getAst(),
      false,
      "DKTK_STRAT_DEF_IN_INITIAL_POPULATION",
      measures,
    );
    const lib = buildLibrary(cql);
    const measure = buildMeasure(
      lib.url,
      measures.map((m) => m.measure),
    );

    clearSiteResults();
    const query = btoa(
      JSON.stringify({
        lang: "cql",
        lib,
        measure,
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

    let catalogue = catalogueJson as Catalogue;
    setCatalogue(catalogue);
    onMount(() => {
        setOptions(options);
    })

    const saveQuery = () =>{
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
    }

    let catalogueOpen: boolean = false;
    const barChartBackgroundColors: string[] = ["#4dc9f6", "#3da4c7"];

    const genderHeaders: Map<string, string> = new SvelteMap<string, string>()
        .set("male", "Male")
        .set("female", "Female")
        .set("unknown", "Unknown");
    
    const vitalStateHeaders: Map<string, string> = new SvelteMap<string, string>()
    .set("lebend", "alive")
    .set("verstorben", "deceased")
    .set("unbekannt", "unknown");
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
            <img src="../logo-itcc-smpaeds.png" alt="The Institute of Canser Research" />
        </div>
        <div class="logo">
            <img src="../logo-itcc-dcci.svg" alt="Danish Region hovedstaden" />
        </div>
        <div class="logo">
            <img src="../logo-itcc-profyle.jpg" alt="Precision Oncology For Young People" />
        </div>
            <div class="logo">
            <img src="../logo-itcc-mappyacts.png" alt="Gustave Roussy Cancer Centre" />
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
      <button
        class="save_button"
        on:click={saveQuery}
        title="Save search query"
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
        <lens-search-modified-display>Charts no longer represent the current search!</lens-search-modified-display>
      </div>
      <div class="chart-wrapper chart-diagnosis">
        <lens-chart
          title="Diagnosis"
          dataKey="diagnosis"
          chartType="bar"
          indexAxis="y"
          groupingDivider="."
          groupingLabel=".%"
          filterRegex={"^(C.{2,6}|D[0-4][0-9].{0,4})"}
          xAxisTitle="Diagnosis Count"
          yAxisTitle="ICD-10-Codes"
          backgroundColor={barChartBackgroundColors}
        ></lens-chart>
      </div>
      <div class="chart-wrapper result-table">
        <lens-result-table pageSize={10}>
        </lens-result-table>
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
          title="Diagnosis Age Distribution"
          dataKey="age_at_diagnosis"
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
          title="Sex Distribution "
          dataKey="gender"
          chartType="pie"
          displayLegends={true}
          headers={genderHeaders}
        ></lens-chart>
      </div>
    </div>
  </div>
</main>

<footer > 
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