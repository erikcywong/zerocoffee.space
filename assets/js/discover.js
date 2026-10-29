/* ZCC discover engine — filters, search, sort, paging over window.ZCC_PROJECTS.
   Trilingual: reads window.ZCC_I18N (exposed by the page) and re-renders on langchange. */
(function () {
  var P = window.ZCC_PROJECTS || [];
  var PAGE = 24;
  var state = { vertical: "all", layer: "all", carbon: "all", q: "", sort: "prog", shown: PAGE };

  function lang() {
    try { return localStorage.getItem("zcc_lang") || "en"; } catch (e) { return "en"; }
  }
  function t(key, fallback) {
    var d = (window.ZCC_I18N || {})[lang()] || {};
    return d[key] != null ? d[key] : fallback;
  }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function money(n) {
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1) + "M";
    if (n >= 1e3) return "$" + Math.round(n / 1e3) + "k";
    return "$" + n;
  }
  var VKEYS = { farm: "t_farm", process: "t_process", roast: "t_roasting", pack: "t_pack", log: "t_log", cafe: "t_cafe" };
  var VNAME = { farm: "Farming", process: "Processing", roast: "Roasting", pack: "Packaging", log: "Logistics", cafe: "Café" };
  var CKEYS = { removal: "t_removal", avoidance: "t_avoid", inset: "t_inset" };
  var CNAME = { removal: "Removal", avoidance: "Avoidance", inset: "Inset" };
  var LKEYS = { 1: "d_inc", 2: "d_com", 3: "d_inst", 4: "d_cver" };
  var LNAME = { 1: "Incubation", 2: "Community", 3: "Institutional", 4: "Carbon verified" };

  function custom(key, fb, vars) {
    var s = t(key, fb);
    for (var k in vars) s = s.replace("{" + k + "}", vars[k]);
    return s;
  }

  function card(p) {
    var pct = Math.max(2, Math.round((p.raised / p.target) * 100));
    var statusKey = p.layer === 1 ? "d_inc" : p.layer === 2 ? "st_live" : p.layer === 3 ? "d_inst" : "st_verified";
    var statusColor = p.layer === 4 ? "var(--up)" : p.layer === 3 ? "var(--accent)" : "var(--muted)";
    var carbonTag = p.layer === 4
      ? '<span class="tag green">' + esc(p.retired.toLocaleString("en-US")) + " t " + t("pj_ret", "retired") + "</span>"
      : "";
    return '<a class="pcard" href="#/project?p=' + p.id + '">' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px">' +
        '<span class="tag">' + esc(t(VKEYS[p.vertical], VNAME[p.vertical])) + "</span>" +
        '<span class="tag blue">' + esc(t(CKEYS[p.carbon], CNAME[p.carbon])) + "</span>" +
        '<span class="tag">L' + p.layer + "</span>" + carbonTag +
      "</div>" +
      "<h3>" + esc(p.name) + "</h3>" +
      '<p class="desc">' + esc(custom("dz_" + p.vertical, DZ_EN[p.vertical], { place: p.place, metric: p.metric })) + "</p>" +
      '<div class="small muted" style="display:flex;justify-content:space-between;gap:8px;margin:2px 0 0;font-size:11px">' +
        "<span>" + esc(p.place) + " · " + esc(p.country) + "</span><span class=\"mono\">" + p.id + "</span></div>" +
      '<div class="bar" style="margin:10px 0 8px"><i style="width:' + pct + '%"></i></div>' +
      '<div class="meta"><span class="mono">' + money(p.raised) + " / " + money(p.target) + "</span>" +
        '<span style="color:' + statusColor + '">' + esc(t(statusKey, LNAME[p.layer])) + "</span></div>" +
      "</a>";
  }

  var DZ_EN = {
    farm: "Agroforestry and soil-carbon transition at {place} — {metric}.",
    process: "Processing-side methane capture and energy retrofit at {place} — {metric}.",
    roast: "Roastery electrification and heat recovery at {place} — {metric}.",
    pack: "Reusable and low-carbon packaging system at {place} — {metric}.",
    log: "Green freight and cold-chain consolidation out of {place} — {metric}.",
    cafe: "Café-level refrigerant and energy programme at {place} — {metric}."
  };

  function matches(p) {
    if (state.vertical !== "all" && p.vertical !== state.vertical) return false;
    if (state.layer !== "all" && String(p.layer) !== String(state.layer)) return false;
    if (state.carbon !== "all" && p.carbon !== state.carbon) return false;
    if (state.q) {
      var q = state.q.toLowerCase();
      var hay = (p.name + " " + p.place + " " + p.country + " " + p.id + " " + p.region).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  }

  function render() {
    var grid = document.getElementById("d-grid");
    if (!grid) return;
    var list = P.filter(matches);
    if (state.sort === "prog") list.sort(function (a, b) { return b.raised / b.target - a.raised / a.target; });
    else if (state.sort === "tonnes") list.sort(function (a, b) { return b.retired - a.retired || b.allocated - a.allocated; });
    else list.sort(function (a, b) { return a.name.localeCompare(b.name); });

    var slice = list.slice(0, state.shown);
    grid.innerHTML = slice.map(card).join("");
    var empty = document.getElementById("d-empty");
    if (empty) empty.hidden = list.length !== 0;
    var cnt = document.getElementById("d-count");
    if (cnt) cnt.textContent = custom("d_showing", "Showing {n} of {total}", { n: slice.length, total: list.length });
    var more = document.getElementById("d-more");
    if (more) more.hidden = list.length <= state.shown;
    var hint = document.getElementById("d-total");
    if (hint) hint.textContent = P.length;
  }

  function setChipGroup(container, attr, val) {
    var chips = container.querySelectorAll(".chip");
    for (var i = 0; i < chips.length; i++)
      chips[i].classList.toggle("on", chips[i].getAttribute(attr) === val);
  }

  document.addEventListener("click", function (e) {
    var chip = e.target.closest ? e.target.closest("#d-filters .chip") : null;
    if (chip) {
      var g = chip.getAttribute("data-group");
      var val = chip.getAttribute("data-val");
      state[g] = val;
      var row = document.querySelector('#d-filters .chips[data-row="' + g + '"]');
      if (row) setChipGroup(row, "data-val", val);
      state.shown = PAGE;
      render();
      return;
    }
    var more = e.target.closest ? e.target.closest("#d-more") : null;
    if (more) { state.shown += PAGE; render(); }
  });

  document.addEventListener("input", function (e) {
    if (e.target && e.target.id === "d-search") { state.q = e.target.value.trim(); state.shown = PAGE; render(); }
  });
  document.addEventListener("change", function (e) {
    if (e.target && e.target.id === "d-sort") { state.sort = e.target.value; render(); }
  });

  function renderFeatured() {
    var box = document.getElementById("d-featured");
    if (!box) return;
    function best(v, l) {
      var c = P.filter(function (p) { return p.vertical === v && p.layer === l; });
      c.sort(function (a, b) { return b.raised / b.target - a.raised / a.target; });
      return c[0];
    }
    var picks = [best("farm", 4), best("process", 3), best("roast", 2)].filter(Boolean);
    box.innerHTML = picks.map(card).join("");
  }

  window.addEventListener("langchange", function () { render(); renderFeatured(); });
  window.ZCC_DISCOVER = { render: render, reset: function () {
    state = { vertical: "all", layer: "all", carbon: "all", q: "", sort: "prog", shown: PAGE };
    render();
  } };
  function boot() {
    // deep links: #/discover?v=farm&l=4&c=removal&q=peru
    try {
      var raw = location.hash.replace(/^#/, "");
      var qi = raw.indexOf("?");
      if (qi !== -1) {
        var sp = new URLSearchParams(raw.slice(qi + 1));
        ["vertical", "layer", "carbon"].forEach(function (k) {
          var v = sp.get(k.charAt(0)) || sp.get(k);
          if (v) {
            state[k] = v;
            var row = document.querySelector('#d-filters .chips[data-row="' + k + '"]');
            if (row) setChipGroup(row, "data-val", v);
          }
        });
        if (sp.get("q")) { state.q = sp.get("q"); var el = document.getElementById("d-search"); if (el) el.value = state.q; }
      }
    } catch (e) {}
    render();
    renderFeatured();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
