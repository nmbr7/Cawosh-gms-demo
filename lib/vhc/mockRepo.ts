import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { VHCResponse, VHCTemplate, Powertrain, VHCAnswer } from "@/types/vhc";

type DBShape = { templates: VHCTemplate[]; responses: VHCResponse[] };

const DB_FILE = path.join(process.cwd(), "mock-db", "vhc.json");

function readDB(): DBShape {
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw) as DBShape;
  } catch {
    return { templates: [], responses: [] };
  }
}

function writeDB(db: DBShape) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

class VHCMockRepo {
  private static instance: VHCMockRepo;
  private db: DBShape;

  private constructor() {
    this.db = readDB();
  }

  static getInstance(): VHCMockRepo {
    if (!VHCMockRepo.instance) VHCMockRepo.instance = new VHCMockRepo();
    return VHCMockRepo.instance;
  }

  getActiveTemplate(): VHCTemplate | null {
    return this.db.templates.find((t) => t.isActive) || null;
  }

  listResponses(params?: {
    status?: string;
    assignedTo?: string;
    vehicleId?: string;
  }) {
    let rs = this.db.responses;
    if (params?.status) rs = rs.filter((r) => r.status === params.status);
    if (params?.assignedTo)
      rs = rs.filter((r) => r.assignedTo === params.assignedTo);
    if (params?.vehicleId)
      rs = rs.filter((r) => r.vehicleId === params.vehicleId);
    return rs;
  }

  getResponse(id: string) {
    return this.db.responses.find((r) => r.id === id) || null;
  }

  createResponse(input: {
    templateId: string;
    powertrain: Powertrain;
    vehicleId: string;
    bookingId?: string;
    serviceIds?: string[];
    assignedTo?: string;
    dueAt?: string;
    createdBy: string;
  }): VHCResponse {
    const template = this.db.templates.find((t) => t.id === input.templateId);
    if (!template) throw new Error("Template not found");
    const now = new Date().toISOString();
    const response: VHCResponse = {
      id: randomUUID(),
      templateId: template.id,
      templateVersion: template.version,
      powertrain: input.powertrain,
      status: "in_progress",
      vehicleId: input.vehicleId,
      bookingId: input.bookingId,
      serviceIds: input.serviceIds,
      assignedTo: input.assignedTo,
      dueAt: input.dueAt,
      answers: [],
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
    };
    this.db.responses.unshift(response);
    writeDB(this.db);
    return response;
  }

  updateAnswers(id: string, answers: VHCAnswer[]) {
    const res = this.getResponse(id);
    if (!res) throw new Error("Response not found");
    const map = new Map(res.answers.map((a) => [a.itemId, a] as const));
    for (const a of answers)
      map.set(a.itemId, { ...map.get(a.itemId), ...a } as VHCAnswer);
    res.answers = Array.from(map.values());
    res.updatedAt = new Date().toISOString();
    // naive scoring: count answered/total; total score as proportion of max (will be replaced by real weighting)
    const template = this.db.templates.find((t) => t.id === res.templateId);
    const activeSections =
      template?.sections.filter(
        (s) => !s.applicable_to || s.applicable_to.includes(res.powertrain)
      ) || [];
    const totalItems = activeSections.reduce(
      (acc, s) => acc + s.items.length,
      0
    );
    const answered = res.answers.filter(
      (a) => a.value !== undefined && a.value !== null
    ).length;
    const total = totalItems || 1;
    const ratio = Math.min(1, answered / total);
    res.scores = { section: {}, total: ratio };
    res.progress = { answered, total };
    writeDB(this.db);
    return res;
  }
}

export const vhcRepo = VHCMockRepo.getInstance();
