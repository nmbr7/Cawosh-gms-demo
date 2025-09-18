"use client";

import { useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { notify } from "@/lib/notify";

type VHCListItem = {
  id: string;
  vehicleId: string;
  status: string;
  powertrain: string;
  scores?: { total: number };
  updatedAt: string;
};

export default function VehicleHealthChecksPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reg, setReg] = useState("");
  const [clientName, setClientName] = useState("");
  const [powertrain, setPowertrain] = useState("ice");
  const [data, setData] = useState<VHCListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // we navigate to new page, no local creating state needed

  const columns = useMemo(
    () => [
      { header: "VHC ID", accessorKey: "id" as const, width: "w-48" },
      { header: "Vehicle", accessorKey: "vehicleId" as const },
      { header: "Status", accessorKey: "status" as const },
      { header: "Powertrain", accessorKey: "powertrain" as const },
      {
        header: "Score",
        accessorKey: "scores" as const,
        cell: (row: VHCListItem) =>
          row.scores?.total !== undefined
            ? `${Math.round(row.scores.total * 100)}%`
            : "—",
      },
      {
        header: "Updated",
        accessorKey: "updatedAt" as const,
        cell: (row: VHCListItem) => new Date(row.updatedAt).toLocaleString(),
        width: "w-56",
      },
    ],
    []
  );

  const fetchList = async () => {
    setIsLoading(true);
    try {
      const res = await fetchWithAuth("/api/vhc/responses", { method: "GET" });
      const json = await res.json();
      setData(json.data || []);
    } catch {
      notify("Failed to load vehicle health checks", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const onCreate = async () => {
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Vehicle Health Checks</h1>
        <button
          onClick={onCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          New Test
        </button>
      </div>

      <DataTable<VHCListItem>
        columns={columns}
        data={data}
        isLoading={isLoading}
        emptyMessage="No health checks found"
        emptySubMessage="Start by creating a new vehicle health check"
        emptyAction={{ label: "New Test", onClick: onCreate }}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-semibold">Start Vehicle Health Check</h2>
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
              <option value="ice">ICE (Petrol/Diesel)</option>
              <option value="ev">EV</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm rounded-md border bg-white hover:bg-gray-50"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                if (!reg.trim()) {
                  return alert("Registration is required");
                }
                try {
                  const tRes = await fetchWithAuth(
                    "/api/vhc/templates/active",
                    { method: "GET" }
                  );
                  const template = await tRes.json();
                  const cRes = await fetchWithAuth("/api/vhc/responses", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      templateId: template.id,
                      powertrain,
                      vehicleId: reg.trim(),
                      createdBy: clientName || "technician",
                    }),
                  });
                  if (!cRes.ok) {
                    const err = await cRes.json();
                    throw new Error(
                      err?.error || "Failed to create health check"
                    );
                  }
                  const created = await cRes.json();
                  setIsModalOpen(false);
                  setReg("");
                  setClientName("");
                  setPowertrain("ice");
                  router.push(`/vhc-fullscreen/${created.id}`);
                } catch (e) {
                  alert(e instanceof Error ? e.message : "Failed to create");
                }
              }}
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              type="button"
            >
              Start Check
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
