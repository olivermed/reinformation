// migrateData.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import fs from "fs";
import { officials, professions, mandats, contact } from "Schemas";
import { config } from "dotenv";
import * as path from "path";

function getFileNames(dirPath: string): string[] {
  // Vérifie si le chemin existe et s'il s'agit d'un répertoire
  if (!fs.existsSync(dirPath) || !fs.lstatSync(dirPath).isDirectory()) {
    throw new Error(
      "Le chemin spécifié est invalide ou n’est pas un répertoire"
    );
  }

  return fs.readdirSync(dirPath).map((file) => path.join(dirPath, file));
}

import { downloadOfficials } from "./DownloadOfficials";

if (!process.env.DATABASE_URL) {
  console.error(
    "Erreur : la variable d'environnement DATABASE_URL n'est pas définie."
  );
  process.exit(1);
}

await downloadOfficials();

config({ path: ".env" });

const sql = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(sql);

async function migrateData(fileName: string) {
  try {
    const jsonData = fs.readFileSync(fileName, "utf-8");
    const data = JSON.parse(jsonData);

    const acteur = data.acteur;
    const etatCivil = acteur.etatCivil;
    const profession = acteur.profession.libelleCourant;

    const officialResult = await db
      .insert(officials)
      .values({
        acteurRef: acteur.uid["#text"],
        nom: etatCivil.ident.nom,
        prenom: etatCivil.ident.prenom,
        date_naissance: etatCivil.infoNaissance.dateNais,
        ville_naissance: etatCivil.infoNaissance.villeNais,
        departement_naissance: etatCivil.infoNaissance.deptNais,
        pays_naissance: etatCivil.infoNaissance.paysNais,
      })
      .returning({ id: officials.id });

    const officialId = officialResult[0].id;

    await db.insert(professions).values({
      official_id: officialId,
      libelle: profession,
      date_debut: null,
      date_fin: null,
    });

    for (const mandat of acteur.mandats.mandat) {
      await db.insert(mandats).values({
        official_id: officialId,
        type: mandat.typeMandat,
        date_debut: mandat.dateDebut,
        datePublication: mandat.datePublication || null,
        legislature: mandat.legislature,
        typeOrgane: mandat.typeOrgane,
        date_fin: mandat.dateFin,
        circonscription: mandat.circonscription || null,
        organeRef: mandat.organes.organeRef,
        mandatRef: mandat.uid,
      });
    }

    if (acteur.contacts) {
      for (const contactInfo of acteur.contacts) {
        await db.insert(contact).values({
          official_id: officialId,
          type_contact: contactInfo.type,
          valeur: contactInfo.valeur,
        });
      }
    }

    console.log(`Migration des données réussie pour ${fileName}`);
  } catch (error) {
    console.error(
      `Erreur lors de la migration pour le fichier ${fileName} :`,
      error
    );
  }
}

async function runMigrations() {
  const fileNames = getFileNames("/app/DB/json/acteur/");
  if (fileNames.length === 0) {
    console.error(
      "Erreur : veuillez fournir au moins un fichier JSON en argument."
    );
    process.exit(1);
  }
  for (const fileName of fileNames) {
    console.log(`Traitement du fichier : ${fileName}`);
    await migrateData(fileName);
  }

  sql.end();
}

runMigrations();
