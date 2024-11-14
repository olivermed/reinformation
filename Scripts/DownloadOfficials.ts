import { writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs';
import * as path from 'path';
import AdmZip from 'adm-zip';

// URL du fichier ZIP à télécharger
const url = 'https://data.assemblee-nationale.fr/static/openData/repository/17/amo/deputes_actifs_mandats_actifs_organes/AMO10_deputes_actifs_mandats_actifs_organes.json.zip';

// Dossier de destination
const destinationFolder = path.join(process.cwd(), 'DB');

// Fonction pour télécharger le fichier ZIP
async function downloadZip(url: string, outputPath: string): Promise<void> {
  console.log('Téléchargement en cours...');
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erreur de téléchargement : ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(outputPath, buffer);
  console.log(`Fichier téléchargé et enregistré dans : ${outputPath}`);
}

// Fonction pour extraire le fichier ZIP
function extractZip(zipPath: string, outputFolder: string): void {
  console.log('Extraction en cours...');
  const zip = new AdmZip(zipPath);
  zip.extractAllTo(outputFolder, true);
  console.log(`Fichiers extraits dans : ${outputFolder}`);
}

// Fonction principale
export async function downloadOfficials() {
  try {
    // Créer le dossier de destination s'il n'existe pas
    if (!existsSync(destinationFolder)) {
      mkdirSync(destinationFolder);
    }

    // Chemin pour le fichier ZIP temporaire
    const zipPath = path.join(destinationFolder, 'deputes_actifs_mandats_actifs_organes.zip');

    // Télécharger et extraire le fichier
    await downloadZip(url, zipPath);
    extractZip(zipPath, destinationFolder);

    // Supprimer le fichier ZIP après extraction
    unlinkSync(zipPath);
    console.log('Fichier ZIP supprimé après extraction.');
  } catch (error) {
    console.error('Erreur:', error);
  }
}
