import Dexie, { Table } from "dexie";

export type LeadStatus = "new" | "contacted" | "quoted" | "won" | "lost";

export type Lead = {
  id?: number;
  createdAt: string;
  updatedAt: string;
  userId?: string;

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
  userId?: string;

  leadId?: number;

  customerName: string;
  address?: string;
  notes?: string;

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
  userId?: string;

  leadId?: number;
  quoteId?: number;

  customerName: string;
  address?: string;
  notes?: string;

  stage: JobStage;
  scheduledFor?: string;
};

export type Settings = {
  id: "default";
  businessName?: string;
  phone?: string;
  email?: string;
  address?: string;
  terms?: string;
  updatedAt?: string;
  userId?: string;
};

// NEW: usage counters that do not decrease on deletes
export type Usage = {
  id: string; // `${userId}:usage`
  userId: string;
  quotesCreated: number;
  updatedAt: string;
};

class BuildUDb extends Dexie {
  leads!: Table<Lead, number>;
  quotes!: Table<Quote, number>;
  jobs!: Table<Job, number>;
  settings!: Table<Settings, "default">;

  // NEW
  usage!: Table<Usage, string>;

  constructor() {
    super("buildu");

    this.version(1).stores({
      leads: "++id, createdAt, updatedAt, status, name, phone, jobType",
    });

    this.version(2).stores({
      leads: "++id, createdAt, updatedAt, status, name, phone, jobType",
      quotes: "++id, createdAt, updatedAt, status, customerName, leadId",
    });

    this.version(3).stores({
      leads: "++id, createdAt, updatedAt, status, name, phone, jobType",
      quotes: "++id, createdAt, updatedAt, status, customerName, leadId",
      jobs: "++id, createdAt, updatedAt, stage, customerName, quoteId, leadId, scheduledFor",
    });

    this.version(4).stores({
      leads: "++id, createdAt, updatedAt, status, name, phone, jobType",
      quotes: "++id, createdAt, updatedAt, status, customerName, leadId",
      jobs: "++id, createdAt, updatedAt, stage, customerName, quoteId, leadId, scheduledFor",
      settings: "id",
    });

    this.version(5).stores({
      leads: "++id, createdAt, updatedAt, userId, status, name, phone, jobType",
      quotes: "++id, createdAt, updatedAt, userId, status, customerName, leadId",
      jobs: "++id, createdAt, updatedAt, userId, stage, customerName, quoteId, leadId, scheduledFor",
      settings: "id, userId",
    });

    // v6: usage counters
    this.version(6).stores({
      leads: "++id, createdAt, updatedAt, userId, status, name, phone, jobType",
      quotes: "++id, createdAt, updatedAt, userId, status, customerName, leadId",
      jobs: "++id, createdAt, updatedAt, userId, stage, customerName, quoteId, leadId, scheduledFor",
      settings: "id, userId",
      usage: "id, userId",
    });
  }
}

export const db = new BuildUDb();
