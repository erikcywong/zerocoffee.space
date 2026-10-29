# -*- coding: utf-8 -*-
"""Generate 120 ZCC projects: 6 value-chain verticals x 20, each vertical 5 per capital layer.
Totals reconcile exactly with site stats: $86.4M raised, 132,400 t allocated, 61,800 t retired."""
import json, random
random.seed(4207)

VERT = ["farm", "process", "roast", "pack", "log", "cafe"]

PLACES = {
 "farm": [
  ("Kilimanjaro","Tanzania","East Africa"),("Mbeya","Tanzania","East Africa"),
  ("Nyeri","Kenya","East Africa"),("Kirinyaga","Kenya","East Africa"),
  ("Yirgacheffe","Ethiopia","East Africa"),("Guji","Ethiopia","East Africa"),
  ("Nyamasheke","Rwanda","East Africa"),("Mount Elgon","Uganda","East Africa"),
  ("Huila","Colombia","Latin America"),("Nariño","Colombia","Latin America"),
  ("Cerrado Mineiro","Brazil","Latin America"),("Sul de Minas","Brazil","Latin America"),
  ("Antigua","Guatemala","Latin America"),("Huehuetenango","Guatemala","Latin America"),
  ("Copán","Honduras","Latin America"),("Cajamarca","Peru","Latin America"),
  ("Chiapas","Mexico","Latin America"),("Tarrazú","Costa Rica","Latin America"),
  ("Da Lat","Vietnam","Southeast Asia"),("Pu'er","China","East Asia"),
 ],
 "process": [
  ("Palestina","Colombia","Latin America"),("Tolima","Colombia","Latin America"),
  ("Alta Mogiana","Brazil","Latin America"),("Acatenango","Guatemala","Latin America"),
  ("Siguatepeque","Honduras","Latin America"),("Chanchamayo","Peru","Latin America"),
  ("Veracruz","Mexico","Latin America"),("Dak Lak","Vietnam","Southeast Asia"),
  ("Lampung","Indonesia","Southeast Asia"),("Wayanad","India","South Asia"),
  ("Baoshan","China","East Asia"),("Chiang Rai","Thailand","Southeast Asia"),
  ("Mbale","Uganda","East Africa"),("Huye","Rwanda","East Africa"),
  ("Embu","Kenya","East Africa"),("Kigoma","Tanzania","East Africa"),
  ("Jinotega","Nicaragua","Latin America"),("Piura","Peru","Latin America"),
  ("Son La","Vietnam","Southeast Asia"),("Aceh Tengah","Indonesia","Southeast Asia"),
 ],
 "roast": [
  ("Portland","United States","North America"),("Oakland","United States","North America"),
  ("Brooklyn","United States","North America"),("Vancouver","Canada","North America"),
  ("Melbourne","Australia","Oceania"),("Lisbon","Portugal","Europe"),
  ("Trieste","Italy","Europe"),("Hamburg","Germany","Europe"),
  ("Rotterdam","Netherlands","Europe"),("Dubai","United Arab Emirates","Middle East"),
  ("Jazan","Saudi Arabia","Middle East"),("Seoul","South Korea","East Asia"),
  ("Tokyo","Japan","East Asia"),("Osaka","Japan","East Asia"),
  ("Taipei","Taiwan, China","East Asia"),("Hong Kong","China","East Asia"),
  ("Barcelona","Spain","Europe"),("Copenhagen","Denmark","Europe"),
  ("Cape Town","South Africa","Africa"),("Nairobi","Kenya","East Africa"),
 ],
 "pack": [
  ("Singapore","Singapore","Southeast Asia"),("Bangkok","Thailand","Southeast Asia"),
  ("Ho Chi Minh City","Vietnam","Southeast Asia"),("Jakarta","Indonesia","Southeast Asia"),
  ("Mumbai","India","South Asia"),("Nairobi","Kenya","East Africa"),
  ("Bogotá","Colombia","Latin America"),("Mexico City","Mexico","Latin America"),
  ("London","United Kingdom","Europe"),("Shanghai","China","East Asia"),
  ("Seville","Spain","Europe"),("Kraków","Poland","Europe"),
  ("Guangzhou","China","East Asia"),("Penang","Malaysia","Southeast Asia"),
  ("Manila","Philippines","Southeast Asia"),("Dhaka","Bangladesh","South Asia"),
  ("Kampala","Uganda","East Africa"),("Accra","Ghana","Africa"),
  ("Casablanca","Morocco","Africa"),("Riyadh","Saudi Arabia","Middle East"),
 ],
 "log": [
  ("Callao","Peru","Latin America"),("Antwerp","Belgium","Europe"),
  ("Mombasa","Kenya","East Africa"),("Djibouti City","Djibouti","East Africa"),
  ("Jeddah","Saudi Arabia","Middle East"),("Santos","Brazil","Latin America"),
  ("Hai Phong","Vietnam","Southeast Asia"),("Los Angeles","United States","North America"),
  ("Ningbo","China","East Asia"),("Chennai","India","South Asia"),
  ("Buenaventura","Colombia","Latin America"),("Piraeus","Greece","Europe"),
  ("Durban","South Africa","Africa"),("Tanjung Pelepas","Malaysia","Southeast Asia"),
  ("Busan","South Korea","East Asia"),("Valencia","Spain","Europe"),
  ("Montreal","Canada","North America"),("Guayaquil","Ecuador","Latin America"),
  ("Colombo","Sri Lanka","South Asia"),("Aqaba","Jordan","Middle East"),
 ],
 "cafe": [
  ("Toronto","Canada","North America"),("Amsterdam","Netherlands","Europe"),
  ("Riyadh","Saudi Arabia","Middle East"),("Cairo","Egypt","Middle East"),
  ("Kuala Lumpur","Malaysia","Southeast Asia"),("Sydney","Australia","Oceania"),
  ("Tokyo","Japan","East Asia"),("Hong Kong","China","East Asia"),
  ("Chicago","United States","North America"),("Manchester","United Kingdom","Europe"),
  ("Berlin","Germany","Europe"),("Paris","France","Europe"),
  ("Istanbul","Türkiye","Middle East"),("Doha","Qatar","Middle East"),
  ("Jakarta","Indonesia","Southeast Asia"),("Bangkok","Thailand","Southeast Asia"),
  ("São Paulo","Brazil","Latin America"),("Santiago","Chile","Latin America"),
  ("Nairobi","Kenya","East Africa"),("Cape Town","South Africa","Africa"),
 ],
}

DESC = {
 "farm": ["Regenerative Cooperative","Agroforestry Estate","Shade-Grown Collective","Aeroponic Nursery"],
 "process": ["Wet-Mill Methane Capture","Solar Drying Hub","Honey Process Station","Biogas Retrofit"],
 "roast": ["Heat-Pump Roastery","Solar Roastery","Electric Roastery Retrofit","Micro-Roastery Network"],
 "pack": ["Reusable Loop Packaging","Compostable Pouch Line","Refill Station Network","Mono-Material Pack Plant"],
 "log": ["Green Freight Corridor","EV Cold-Chain Fleet","Port Consolidation Hub","Rail-to-Port Electrification"],
 "cafe": ["Café Collective","Refrigerant Retrofit Chain","Zero-Waste Café Group","Café Energy Cooperative"],
}

CARBON = {"farm": "removal", "process": "avoidance", "roast": "avoidance",
          "pack": "avoidance", "log": "avoidance", "cafe": "inset"}

METHOD = {"farm": "VM0042-style improved land management (ex-ante)",
          "process": "AMS-III.H wastewater methane recovery",
          "roast": "AMS-II.C efficiency + refrigerant AMS-III.AR",
          "pack": "AMS-III.AJ material substitution",
          "log": "AMS-III.C modal shift / fleet efficiency",
          "cafe": "AMS-II.C efficiency + refrigerant AMS-III.AR"}

STAGE = {1: "incu", 2: "comm", 3: "inst", 4: "carb"}
VVBS = ["VVB-0431 · Verra-accredited", "VVB-0072 · Gold Standard-approved",
        "VVB-0158 · Verra-accredited", "VVB-0233 · GS + Verra dual"]
ABBR = {"farm": "FARM", "process": "PROC", "roast": "ROST", "pack": "PACK", "log": "LOGI", "cafe": "CAFE"}

def size_metric(v, i):
    if v == "farm":
        farms = 120 + (i * 137) % 2300
        ha = 90 + (i * 71) % 2800
        return f"{farms:,} farms · {ha:,} ha"
    if v == "process":
        return f"{2 + (i % 9)} lines · {600 + (i * 83) % 3600:,} t/yr"
    if v == "roast":
        return f"{1 + (i % 6)} sites · {180 + (i * 47) % 1400:,} t/yr"
    if v == "pack":
        return f"{1 + (i % 5)} plants · {4 + (i * 3) % 28}M units/yr"
    if v == "log":
        return f"{2 + (i % 7)} corridors · {5_000 + (i * 1_700) % 42_000:,} t/yr"
    return f"{2 + (i % 8)} venues · {40 + (i * 13) % 260:,} k cups/yr"

projects = []
n = 0
for v in VERT:
    for i, (place, country, region) in enumerate(PLACES[v]):
        n += 1
        layer = 1 + i // 5
        stage = STAGE[layer]
        desc = DESC[v][i % 4]
        name = f"{place} {desc}"
        # target & raise by layer
        if layer == 1:
            target = random.choice([150, 250, 300, 400, 500, 600, 750]) * 1000
            ratio = random.uniform(0.0, 0.10)
            inv = random.randint(0, 28)
            mint = random.choice([100, 150, 200, 250])
        elif layer == 2:
            target = random.choice([400, 600, 800, 1000, 1200, 1500, 2000]) * 1000
            ratio = random.uniform(0.24, 0.96)
            inv = random.randint(80, 950)
            mint = random.choice([100, 200, 250, 500])
        elif layer == 3:
            target = random.choice([2000, 2500, 3000, 4000, 5000, 6000]) * 1000
            ratio = random.uniform(0.55, 1.0)
            inv = random.randint(4, 55)
            mint = random.choice([10000, 25000, 50000, 100000])
        else:
            target = random.choice([800, 1200, 1600, 2000, 2500, 3000]) * 1000
            ratio = 1.0
            inv = random.randint(40, 620)
            mint = random.choice([250, 500, 1000])
        raised = min(target, round(target * ratio / 1000) * 1000)
        projects.append({
            "id": "ZCC-%04d" % n, "name": name, "place": place, "country": country,
            "region": region, "vertical": v, "layer": layer, "stage": stage,
            "carbon": CARBON[v], "method": METHOD[v], "metric": size_metric(v, i),
            "target": target, "raised": raised, "investors": inv, "min": mint,
            "vvb": VVBS[i % 4], "allocated": 0, "retired": 0,
        })

# ---- reconcile capital to exactly $86,400,000 ----
TOTAL_RAISE = 86_400_000
cur = sum(p["raised"] for p in projects)
k = TOTAL_RAISE / cur
for p in projects:
    p["target"] = max(1000, round(p["target"] * k / 1000) * 1000)
    p["raised"] = min(p["target"], round(p["raised"] * k / 1000) * 1000)
diff = TOTAL_RAISE - sum(p["raised"] for p in projects)
step = 1000 if diff > 0 else -1000
big = sorted(projects, key=lambda x: -x["raised"])[:90]
i = 0
while diff != 0 and i < 200000:
    p = big[i % len(big)]
    if diff > 0 and p["raised"] + 1000 <= max(p["target"], p["raised"] + 1000):
        p["raised"] += 1000; p["target"] = max(p["target"], p["raised"]); diff -= 1000
    elif diff < 0 and p["raised"] >= 1000:
        p["raised"] -= 1000; diff += 1000
    i += 1

# ---- tonnes: only layer 4; exact 132,400 allocated / 61,800 retired ----
ALLOC, RET = 132_400, 61_800
c4 = [p for p in projects if p["layer"] == 4]          # 30 projects
weights = [random.uniform(0.6, 1.8) for _ in c4]
def apportion(total, w):
    s = sum(w)
    raw = [total * x / s for x in w]
    base = [int(x) for x in raw]
    rem = total - sum(base)
    order = sorted(range(len(raw)), key=lambda j: -(raw[j] - base[j]))
    for j in order[:rem]:
        base[j] += 1
    return base
alloc = apportion(ALLOC, weights)
ret_w = [random.uniform(0.32, 0.58) for _ in c4]
# retired proportional to allocation, then re-apportion to exact total
ret_raw = [a * r for a, r in zip(alloc, ret_w)]
ret = apportion(RET, ret_raw)
for p, a, r in zip(c4, alloc, ret):
    p["allocated"] = a
    p["retired"] = min(r, a)

meta = {
    "count": len(projects),
    "raised": sum(p["raised"] for p in projects),
    "target": sum(p["target"] for p in projects),
    "allocated": sum(p["allocated"] for p in projects),
    "retired": sum(p["retired"] for p in projects),
    "byStage": {}, "byLayer": {}, "byVertical": {},
}
for p in projects:
    meta["byStage"][p["stage"]] = meta["byStage"].get(p["stage"], 0) + 1
    meta["byLayer"][str(p["layer"])] = meta["byLayer"].get(str(p["layer"]), 0) + 1
    meta["byVertical"][p["vertical"]] = meta["byVertical"].get(p["vertical"], 0) + 1

out = "/* ZCC project dataset — 120 projects, 6 verticals x 20, 5 per capital layer per vertical. */\n"
out += "window.ZCC_PROJECTS = " + json.dumps(projects, ensure_ascii=False, separators=(",", ":")) + ";\n"
out += "window.ZCC_META = " + json.dumps(meta, ensure_ascii=False, separators=(",", ":")) + ";\n"
open("assets/js/projects-data.js", "w", encoding="utf-8").write(out)
print(json.dumps(meta, indent=1))
print("check raise:", meta["raised"] == 86_400_000, "alloc:", meta["allocated"] == 132_400,
      "ret:", meta["retired"] == 61_800)
