import { Database } from "./database.types";

export type InsertDocumentDto =
  Database["public"]["Tables"]["Documents"]["Insert"];

export type InsertSectionDto =
  Database["public"]["Tables"]["Sections"]["Insert"];

export type InsertSectionRevisionDto =
  Database["public"]["Tables"]["SectionRevisions"]["Insert"];

export type InsertHashtagDto =
  Database["public"]["Tables"]["Hashtags"]["Insert"];

export type CreateDocumentRpcArgs =
  Database["public"]["Functions"]["create_document_full_transaction"]["Args"];

export type CreateDocumentDto = CreateDocumentRpcArgs & {
  doc_category: string;
};