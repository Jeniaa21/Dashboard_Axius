# Assemble tout le contenu de "marques/" en deux fichiers lus par le site :
#   catalogue.js  (fiches, modèles, zones)   et   scenes.js  (plans 3D)
# Ne modifiez jamais ces deux fichiers à la main : relancez construire.bat.
import os, re, json, sys, datetime

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MARQUES = os.path.join(RACINE, "marques")
avertissements = []

def lire_json(chemin, defaut=None):
    try:
        with open(chemin, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return defaut
    except ValueError as e:
        avertissements.append(f"JSON illisible : {os.path.relpath(chemin, RACINE)} ({e})")
        return defaut

def humaniser(slug):
    t = slug.replace("-", " ").replace("_", " ")
    return t[:1].upper() + t[1:]

def front_matter(texte):
    meta = {}
    if texte.startswith("---"):
        fin = texte.find("\n---", 3)
        if fin > 0:
            for ligne in texte[3:fin].strip().splitlines():
                if ":" in ligne:
                    k, v = ligne.split(":", 1)
                    meta[k.strip().lower()] = v.strip()
            texte = texte[fin + 4:]
    return meta, texte

def en_blocs(texte):
    blocs, titre = [], None
    for brut in texte.splitlines():
        l = brut.strip()
        if not l:
            continue
        if l.startswith("# ") and titre is None:
            titre = l[2:].strip(); continue
        if l.startswith("#"):
            blocs.append({"t": "h", "x": l.lstrip("#").strip()}); continue
        m = re.match(r"^\d+[\.\)]\s+(.*)", l)
        if m:
            blocs.append({"t": "step", "x": m.group(1)}); continue
        if l[:2] in ("- ", "* "):
            blocs.append({"t": "li", "x": l[2:]}); continue
        if l.startswith(">"):
            x = l.lstrip("> ").strip()
            blocs.append({"t": "warn" if re.match(r"(?i)(attention|danger|⚠)", x) else "note", "x": x}); continue
        blocs.append({"t": "p", "x": l})
    return blocs, titre

def liste_modeles(valeur):
    v = [x.strip().lower() for x in re.split(r"[,;]", valeur or "") if x.strip()]
    return v or ["tous"]

def lire_fiches(dossier_gamme, ids_modeles, cle):
    fiches, vus = [], set()
    for base, dirs, fichiers in os.walk(dossier_gamme):
        dirs[:] = sorted(d for d in dirs if not d.startswith(("_", ".")))
        for nom in sorted(fichiers):
            if not nom.lower().endswith(".md") or nom.startswith("_"):
                continue
            chemin = os.path.join(base, nom)
            rel = os.path.relpath(chemin, dossier_gamme).replace("\\", "/")
            parts = rel.split("/")
            with open(chemin, encoding="utf-8") as f:
                meta, corps = front_matter(f.read())
            blocs, titre = en_blocs(corps)
            titre = meta.get("titre") or titre or humaniser(os.path.splitext(nom)[0])
            # catégorie : commun/guide/<cat>/..., commun/notes, modeles/<id>/...
            if parts[0] == "commun" and len(parts) > 2 and parts[1] == "guide" and len(parts) > 3:
                cat = parts[2]
            elif parts[0] == "commun" and len(parts) > 1 and parts[1] == "notes":
                cat = "notes"
            elif parts[0] == "modeles":
                cat = "notes"
            else:
                cat = parts[-2] if len(parts) > 1 else "autres"
            modeles = liste_modeles(meta.get("modeles"))
            if parts[0] == "modeles" and len(parts) > 2 and not meta.get("modeles"):
                modeles = [parts[1].lower()]
            for m in modeles:
                if m != "tous" and m not in ids_modeles:
                    avertissements.append(f"{rel} : modèle inconnu « {m} » (modèles de la gamme : {', '.join(ids_modeles) or 'aucun'})")
            if "verifie" not in meta:
                avertissements.append(f"{rel} : ligne « verifie: oui/non » absente (comptée comme non vérifiée)")
            if not meta.get("source"):
                avertissements.append(f"{rel} : ligne « source: … » absente")
            zones = [int(z) for z in re.findall(r"\d+", meta.get("zones", ""))]
            fid = cle + "/" + os.path.splitext(rel)[0]
            if fid in vus:
                avertissements.append(f"{rel} : nom en double")
            vus.add(fid)
            texte = titre + ". " + " ".join(b["x"] for b in blocs)
            fiches.append({"id": fid, "titre": titre, "cat": cat, "modeles": modeles, "zones": zones,
                           "verifie": meta.get("verifie", "non").lower() in ("oui", "true", "1", "vrai"),
                           "source": meta.get("source", ""), "blocks": blocs, "texte": texte})
    return fiches

def main():
    catalogue = {"genere": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"), "marques": []}
    scenes = ["/* Fichier généré par construire.bat : ne pas modifier à la main. */\n"]
    if not os.path.isdir(MARQUES):
        print("Dossier « marques » introuvable."); sys.exit(1)
    for mid in sorted(os.listdir(MARQUES)):
        dm = os.path.join(MARQUES, mid)
        if not os.path.isdir(dm) or mid.startswith(("_", ".")):
            continue
        mj = lire_json(os.path.join(dm, "marque.json"), {}) or {}
        marque = {"id": mid, "nom": mj.get("nom", humaniser(mid)), "gammes": []}
        for gid in sorted(os.listdir(dm)):
            dg = os.path.join(dm, gid)
            if not os.path.isdir(dg) or gid in ("commun",) or gid.startswith(("_", ".")):
                continue
            gj = lire_json(os.path.join(dg, "gamme.json"), None)
            if gj is None:
                avertissements.append(f"marques/{mid}/{gid} : gamme.json absent (dossier ignoré)"); continue
            modeles = []
            dmod = os.path.join(dg, "modeles")
            if os.path.isdir(dmod):
                for sid in sorted(os.listdir(dmod)):
                    mj2 = lire_json(os.path.join(dmod, sid, "modele.json"), None)
                    if mj2 is None:
                        if os.path.isdir(os.path.join(dmod, sid)):
                            avertissements.append(f"marques/{mid}/{gid}/modeles/{sid} : modele.json absent")
                        continue
                    modeles.append({"id": sid.lower(), "nom": mj2.get("nom", sid.upper()), "ordre": mj2.get("ordre", 99),
                                    "caracteristiques": mj2.get("caracteristiques", [])})
            modeles.sort(key=lambda m: (m["ordre"], m["id"]))
            ids = [m["id"] for m in modeles]
            cle = mid + "/" + gid
            fiches = lire_fiches(dg, ids, cle)
            zones = lire_json(os.path.join(dg, "3d", "zones.json"), []) or []
            nz = {z["n"] for z in zones}
            for f in fiches:
                for z in f["zones"]:
                    if z not in nz:
                        avertissements.append(f"{f['id']} : zone {z} inconnue (voir 3d/zones.json)")
            cats = {}
            cats.update(gj.get("categories", {}))
            cats.setdefault("notes", "Notes")
            marque["gammes"].append({"id": gid, "nom": gj.get("nom", humaniser(gid)), "description": gj.get("description", ""),
                                     "categories": cats, "modeles": modeles, "zones": zones, "fiches": fiches})
            sc = os.path.join(dg, "3d", "scene.js")
            if os.path.isfile(sc):
                with open(sc, encoding="utf-8") as f:
                    scenes.append(f"\n/* ===== {cle} ===== */\n" + f.read() + "\n")
            nv = sum(1 for f in fiches if f["verifie"])
            print(f"  {marque['nom']} / {gj.get('nom', gid)} : {len(modeles)} modèles, {len(fiches)} fiches ({nv} vérifiées), {len(zones)} zones")
        catalogue["marques"].append(marque)
    with open(os.path.join(RACINE, "catalogue.js"), "w", encoding="utf-8") as f:
        f.write("/* Fichier généré par construire.bat : ne pas modifier à la main. */\nwindow.CATALOGUE=" + json.dumps(catalogue, ensure_ascii=False) + ";\n")
    with open(os.path.join(RACINE, "scenes.js"), "w", encoding="utf-8") as f:
        f.write("".join(scenes))
    print()
    if avertissements:
        print("À corriger :")
        for a in avertissements:
            print("  ⚠ " + a)
    else:
        print("Aucun problème détecté.")
    print("\ncatalogue.js et scenes.js créés. Ouvrez index.html.")

main()
