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

  getTemplate(id: string): VHCTemplate | null {
    return this.db.templates.find((t) => t.id === id) || null;
  }

  listResponses(params?: {
    status?: string;
    assignedTo?: string;
    vehicleId?: string;
    powertrain?: string;
    createdBy?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    startDate?: string;
    endDate?: string;
  }) {
    let rs = [...this.db.responses]; // Create a copy to avoid mutating original

    // Apply filters
    if (params?.status) rs = rs.filter((r) => r.status === params.status);
    if (params?.assignedTo)
      rs = rs.filter((r) => r.assignedTo === params.assignedTo);
    if (params?.vehicleId)
      rs = rs.filter((r) =>
        r.vehicleId.toLowerCase().includes(params.vehicleId.toLowerCase())
      );
    if (params?.powertrain)
      rs = rs.filter((r) => r.powertrain === params.powertrain);
    if (params?.createdBy)
      rs = rs.filter((r) =>
        r.createdBy.toLowerCase().includes(params.createdBy.toLowerCase())
      );

    // Apply date filters
    if (params?.startDate) {
      const startDate = new Date(params.startDate);
      rs = rs.filter((r) => new Date(r.createdAt) >= startDate);
    }
    if (params?.endDate) {
      const endDate = new Date(params.endDate);
      endDate.setHours(23, 59, 59, 999); // End of day
      rs = rs.filter((r) => new Date(r.createdAt) <= endDate);
    }

    // Apply sorting
    if (params?.sortBy) {
      rs.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (params.sortBy) {
          case "createdAt":
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case "updatedAt":
            aValue = new Date(a.updatedAt).getTime();
            bValue = new Date(b.updatedAt).getTime();
            break;
          case "vehicleId":
            aValue = a.vehicleId.toLowerCase();
            bValue = b.vehicleId.toLowerCase();
            break;
          case "status":
            aValue = a.status;
            bValue = b.status;
            break;
          case "powertrain":
            aValue = a.powertrain;
            bValue = b.powertrain;
            break;
          case "score":
            aValue = a.scores?.total || 0;
            bValue = b.scores?.total || 0;
            break;
          default:
            aValue = a.createdAt;
            bValue = b.createdAt;
        }

        if (aValue < bValue) return params.sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return params.sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedResults = rs.slice(startIndex, endIndex);

    return {
      data: paginatedResults,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(rs.length / limit),
        totalItems: rs.length,
        itemsPerPage: limit,
      },
    };
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
    // Calculate proper weighted scores based on answer values and section weights
    const template = this.db.templates.find((t) => t.id === res.templateId);
    const activeSections =
      template?.sections.filter(
        (s) => !s.applicable_to || s.applicable_to.includes(res.powertrain)
      ) || [];

    const sectionScores: Record<string, number> = {};
    let totalWeightedScore = 0;
    let totalWeight = 0;

    // Calculate section scores
    for (const section of activeSections) {
      const sectionAnswers = res.answers.filter((answer) =>
        section.items.some((item) => item.id === answer.itemId)
      );

      if (sectionAnswers.length === 0) {
        sectionScores[section.id] = 0;
        continue;
      }

      // Calculate weighted average for this section
      let sectionWeightedScore = 0;
      let sectionTotalWeight = 0;

      for (const answer of sectionAnswers) {
        const item = section.items.find((item) => item.id === answer.itemId);
        if (item && typeof answer.value === "number") {
          // Normalize answer value (1-5) to 0-1 scale, then apply item weight
          const normalizedValue = (answer.value - 1) / 4; // 1->0, 2->0.25, 3->0.5, 4->0.75, 5->1
          const itemScore = normalizedValue * item.weight;
          sectionWeightedScore += itemScore;
          sectionTotalWeight += item.weight;
        }
      }

      const sectionScore =
        sectionTotalWeight > 0 ? sectionWeightedScore / sectionTotalWeight : 0;
      sectionScores[section.id] = sectionScore;

      // Add to total weighted score
      totalWeightedScore += sectionScore * section.weight;
      totalWeight += section.weight;
    }

    const overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;

    const answered = res.answers.filter(
      (a) => a.value !== undefined && a.value !== null
    ).length;
    const total = activeSections.reduce((acc, s) => acc + s.items.length, 0);

    res.scores = { section: sectionScores, total: overallScore };
    res.progress = { answered, total };
    writeDB(this.db);
    return res;
  }
}

export const vhcRepo = VHCMockRepo.getInstance();
