import { pgTable, serial, text, date, integer } from "drizzle-orm/pg-core";

export const officials = pgTable("officials", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(),
  acteurRef: text("acteurRef").notNull().unique(),
  prenom: text("prenom").notNull(),
  date_naissance: date("date_naissance"),
  ville_naissance: text("ville_naissance"),
  departement_naissance: text("departement_naissance"),
  pays_naissance: text("pays_naissance"),
});

export type InsertOfficials = typeof officials.$inferInsert;
export type SelectOfficials = typeof officials.$inferSelect;

// Table Professions
export const professions = pgTable("professions", {
  id: serial("id").primaryKey(),
  official_id: integer("official_id").references(() => officials.id, {
    onDelete: "cascade",
  }),
  libelle: text("libelle"),
  date_debut: date("date_debut"),
  date_fin: date("date_fin"),
});

export type InsertProfessions = typeof professions.$inferInsert;
export type SelectProfessions = typeof professions.$inferSelect;

// Table Mandats
export const mandats = pgTable("mandats", {
  id: serial("id").primaryKey(),
  official_id: integer("official_id").references(() => officials.id, {
    onDelete: "cascade",
  }),
  type: text("type"),
  legislature: integer("legislature"),
  typeOrgane: text("typeOrgane"),
  date_debut: date("date_debut"),
  datePublication: date("datePublication"),
  date_fin: date("date_fin"),
  circonscription: text("circonscription"),
  organeRef: text("organeRef").notNull(),
  mandatRef: text("mandatRef").notNull(),
});

export type InsertMandats = typeof mandats.$inferInsert;
export type SelectMandats = typeof mandats.$inferSelect;

// Table Contact
export const contact = pgTable("contact", {
  id: serial("id").primaryKey(),
  official_id: integer("official_id").references(() => officials.id, {
    onDelete: "cascade",
  }),
  type_contact: text("type_contact"),
  valeur: text("valeur"),
});

export type InsertContact = typeof contact.$inferInsert;
export type SelectContact = typeof contact.$inferSelect;
