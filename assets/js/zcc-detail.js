/* ZCC project detail + portal context wiring.
   #/project?id=ZCC-00xx  -> fills the detail page
   #/founder?p=ZCC-00xx   -> context banner on each of the 5 portals */
(function () {
  var P = window.ZCC_PROJECTS || [];
  var VKEYS = { farm: "t_farm", process: "t_process", roast: "t_roasting", pack: "t_pack", log: "t_log", cafe: "t_cafe" };
  var VNAME = { farm: "Farming", process: "Processing", roast: "Roasting", pack: "Packaging", log: "Logistics", cafe: "Café" };
  var CKEYS = { removal: "t_removal", avoidance: "t_avoid", inset: "t_inset" };
  var CNAME = { removal: "Removal (soil + biomass)", avoidance: "Avoidance", inset: "Inset" };
  var LNAMES = { 1: "Incubation", 2: "Community", 3: "Institutional", 4: "Carbon verified" };
  var INSTR = {
    1: "Pre-seed / incubation agreement",
    2: "Reg CF-style community equity + SPV",
    3: "Institutional fund (Jebi Capital-style) + SPV",
    4: "Community equity + carbon-rights schedule"
  };
  var DZ_EN = {
    farm: "Agroforestry and soil-carbon transition at {place} — {metric}.",
    process: "Processing-side methane capture and energy retrofit at {place} — {metric}.",
    roast: "Roastery electrification and heat recovery at {place} — {metric}.",
    pack: "Reusable and low-carbon packaging system at {place} — {metric}.",
    log: "Green freight and cold-chain consolidation out of {place} — {metric}.",
    cafe: "Café-level refrigerant and energy programme at {place} — {metric}."
  };
  var last = { page: "page-home", params: {} };

  function lang() {
    try { return localStorage.getItem("zcc_lang") || "en"; } catch (e) { return "en"; }
  }
  function t(key, fb) {
    var d = (window.ZCC_I18N || {})[lang()] || {};
    return d[key] != null ? d[key] : fb;
  }
  function fill(key, fb, vars) {
    var s = t(key, fb);
    for (var k in vars) s = s.split("{" + k + "}").join(vars[k]);
    return s;
  }
  function money(n) {
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1) + "M";
    if (n >= 1e3) return "$" + Math.round(n / 1e3).toLocaleString("en-US") + "k";
    return "$" + n;
  }
  function byId(id) {
    for (var i = 0; i < P.length; i++) if (P[i].id === id) return P[i];
    return null;
  }
  function set(id, txt) { var el = document.getElementById(id); if (el) el.textContent = txt; }

  function portals(p) {
    var out = [
      { k: "pr_founder", s: "pr_founder_s", d: "Founder console", ds: "Raise, milestones, updates", h: "#/founder?p=" + p.id, on: true },
      { k: "pr_investor", s: "pr_investor_s", d: "Investor deal room", ds: "Subscribe, positions, documents", h: "#/investor?p=" + p.id, on: p.layer >= 2 },
      { k: "pr_institution", s: "pr_institution_s", d: "Institution ledger", ds: "Batches, allocations, forwards", h: "#/institution?p=" + p.id, on: p.layer >= 3 },
      { k: "pr_vvb", s: "pr_vvb_s", d: "VVB verification", ds: "Batches awaiting sign-off", h: "#/vvb?p=" + p.id, on: p.layer === 4 },
      { k: "pr_admin", s: "pr_admin_s", d: "Admin oversight", ds: "Compliance and controls", h: "#/admin?p=" + p.id, on: true }
    ];
    return out.map(function (o) {
      var sub = o.on ? t(o.s, o.ds) : t("pr_locked", "Not available at this layer yet");
      return '<a href="' + (o.on ? o.h : "#") + '" class="' + (o.on ? "" : "na") + '">' +
        '<span class="pn">' + t(o.k, o.d) + "</span><span class=\"ps\">" + sub + "</span></a>";
    }).join("");
  }

  function renderProject(id) {
    var p = byId(id) || byId("ZCC-0001");
    if (!p) return;
    set("pj_bc", p.name);
    set("pj_title", p.name);
    set("pj_id", p.id + " · " + p.region);
    set("pj_sub", fill("dz_" + p.vertical, DZ_EN[p.vertical], { place: p.place, metric: p.metric }));
    set("pj_raised", money(p.raised));
    set("pj_target", money(p.target));
    var pct = Math.max(2, Math.round((p.raised / p.target) * 100));
    var bar = document.getElementById("pj_bar");
    if (bar) bar.style.width = pct + "%";
    set("pj_inv", p.investors.toLocaleString("en-US") + " " + t("pj_inv_lbl", "investors"));
    set("pj_min", t("pj_min_lbl", "Min.") + " " + money(p.min));

    var tags = document.getElementById("pj_tags");
    if (tags) {
      tags.innerHTML =
        '<span class="tag">' + t(VKEYS[p.vertical], VNAME[p.vertical]) + "</span>" +
        '<span class="tag blue">' + t(CKEYS[p.carbon], CNAME[p.carbon]) + "</span>" +
        '<span class="tag' + (p.layer === 4 ? " green" : "") + '">L' + p.layer + " · " + t("d_" + (p.layer === 1 ? "inc" : p.layer === 2 ? "com" : p.layer === 3 ? "inst" : "cver"), LNAMES[p.layer]) + "</span>" +
        (p.allocated ? '<span class="tag green mono">' + p.allocated.toLocaleString("en-US") + " t</span>" : "");
    }
    set("pj_stage", t(VKEYS[p.vertical], VNAME[p.vertical]));
    set("pj_jur", p.place + ", " + p.country);
    set("pj_instr", INSTR[p.layer]);
    set("pj_ctype", t(CKEYS[p.carbon], CNAME[p.carbon]));
    set("pj_meth", p.method);
    set("pj_annual", p.allocated ? Math.round(p.allocated / 3).toLocaleString("en-US") + " tCO₂e / yr" : "—");

    var strip = document.getElementById("pj_portals");
    if (strip) strip.innerHTML = portals(p);
    var note = document.getElementById("pj_note");
    if (note) note.hidden = false;
  }

  var PAGES = ["founder", "investor", "institution", "vvb", "admin"];
  function renderCtx(pageId, id) {
    var p = id ? byId(id) : null;
    for (var i = 0; i < PAGES.length; i++) {
      var el = document.getElementById("ctx-" + PAGES[i]);
      if (!el) continue;
      if (pageId !== "page-" + PAGES[i] || !p) { el.hidden = true; el.innerHTML = ""; continue; }
      el.hidden = false;
      el.innerHTML = '<span class="mono">' + t("ctx_t", "Working on") + "</span>" +
        '<a href="#/project?id=' + p.id + '">' + p.name + "</a>" +
        '<span class="mono">' + p.id + " · L" + p.layer + " · " + p.country + "</span>" +
        '<span style="margin-inline-start:auto"></span>' +
        '<a href="#/project?id=' + p.id + '">' + t("ctx_open", "Open project") + " →</a>";
    }
  }

  function apply(pageId, params) {
    last.page = pageId;
    last.params = params || {};
    if (pageId === "page-project") renderProject(last.params.p || last.params.id);
    renderCtx(pageId, last.params.p);
  }

  window.ZCC_DETAIL = {
    apply: apply,
    render: function () { apply(last.page, last.params); }
  };
  window.addEventListener("langchange", function () { apply(last.page, last.params); });
})();
