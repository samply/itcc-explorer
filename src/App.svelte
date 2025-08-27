<script lang="ts">
    import "./app.css";

    const saveQuery = () =>{}
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
</main>

<footer > 
  <div>
    Made with ♥ and <a href="https://github.com/samply/lens">samply/lens</a>
  </div>
  <div class="logo">
      <img src="../logo-dkfz.svg" alt="DKFZ" />
  </div>
</footer>