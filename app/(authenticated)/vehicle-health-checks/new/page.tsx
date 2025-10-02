"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { notify } from "@/lib/notify";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

const powertrains = [
  { value: "ice", label: "ICE (Petrol/Diesel)" },
  { value: "ev", label: "EV" },
  { value: "hybrid", label: "Hybrid" },
];

export default function NewVehicleHealthCheckPage() {
  const router = useRouter();
  const [reg, setReg] = useState("");
  const [clientName, setClientName] = useState("");
  const [powertrain, setPowertrain] = useState("ice");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reg.trim()) {
      notify("Registration number is required", "error");
      return;
    }
    setSubmitting(true);
    try {
      const tplRes = await fetchWithAuth("/api/vhc/templates/active", {
        method: "GET",
      });
      const template = await tplRes.json();
      const createRes = await fetchWithAuth("/api/vhc/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: template.id,
          powertrain,
          vehicleId: reg.trim(),
          createdBy: clientName || "technician",
        }),
      });
      if (!createRes.ok) {
        const err = await createRes.json();
        throw new Error(err?.error || "Failed to create health check");
      }
      const created = await createRes.json();
      notify("Health check started", "success");
      router.push(`/vehicle-health-checks/${created.id}`);
    } catch (error) {
      notify(error instanceof Error ? error.message : "Failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Start Vehicle Health Check</h1>
      <form
        onSubmit={onSubmit}
        className="space-y-6 bg-white p-6 md:p-8 rounded-lg shadow"
      >
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Registration Number
          </label>
          <input
            value={reg}
            onChange={(e) => setReg(e.target.value)}
            placeholder="e.g. RE24 FGH"
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Client (optional)
          </label>
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Customer name"
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Fuel / Powertrain
          </label>
          <select
            value={powertrain}
            onChange={(e) => setPowertrain(e.target.value)}
            className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {powertrains.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Starting..." : "Start Check"}
          </button>
        </div>
      </form>
    </div>
  );
}
