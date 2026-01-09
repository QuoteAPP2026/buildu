import Dexie, { Table } from "dexie";

export type LeadStatus = "new" | "contacted" | "quoted" | "won" | "lost";

export type Lead = {
  id?: number;
  createdAt: string;
  updatedAt: string;

  name: string;
  phone?: string;
  email?: string;
  address?: string;
  jobType?: string;
  notes?: string;

  status: LeadStatus;
};

export type QuoteStatus = "draft" | "sent" | "accepted" | "declined";

export type QuoteLine = {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
};

export type Quote = {
  id?: number;
  createdAt: string;
  updatedAt: string;

  // link back to a lead (optional)
  leadId?: number;

  customerName: string;
  address?: string;
  notes?: string;

  /* V1 voice support */
  transcript?: string;
  source?: "voice" | "manual";

  status: QuoteStatus;
  lines: QuoteLine[];
};

export type JobStage = "booked" | "on_site" | "in_progress" | "completed" | "invoiced";

export type Job = {
  id?: number;
  createdAt: string;
  updatedAt: string;

  // link back to quote/lead (optional)
  leadId?: number;
  quoteId?: number;

  customerName: string;
  address?: string;
  notes?: string;

  stage: JobStage;
  scheduledFor?: string; // ISO date/time
};

export type Settings = {
  id: "default";
  businessName?: string;
  phone?: string;
  email?: string;
  address?: string;
  terms?: string;
  updatedAt?: string;
};

class BuildUDb extends Dexie {
  leads!: Table<Lead, number>;
  quotes!: Table<Quote, number>;
  jobs!: Table<Job, number>;
  settings!: Table<Settings, "default">;

  constructor() {
    super("buildu");

    // v1: leads
    this.version(1).stores({
      leads: "++id, createdAt, updatedAt, status, name, phone, jobType",
    });

    // v2: quotes
    this.version(2).stores({
      leads: "++id, createdAt, updatedAt, status, name, phone, jobType",
      quotes: "++id, createdAt, updatedAt, status, customerName, leadId",
    });

    // v3: jobs
    this.version(3).stores({
      leads: "++id, createdAt, updatedAt, status, name, phone, jobType",
      quotes: "++id, createdAt, updatedAt, status, customerName, leadId",
      jobs: "++id, createdAt, updatedAt, stage, customerName, quoteId, leadId, scheduledFor",
    });

    // v4: settings (quote template)
    this.version(4).stores({
      leads: "++id, createdAt, updatedAt, status, name, phone, jobType",
      quotes: "++id, createdAt, updatedAt, status, customerName, leadId",
      jobs: "++id, createdAt, updatedAt, stage, customerName, quoteId, leadId, scheduledFor",
      settings: "id",
    });
  }
}

export const db = new BuildUDb();
