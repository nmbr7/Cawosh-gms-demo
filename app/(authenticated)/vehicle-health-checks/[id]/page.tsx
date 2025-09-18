"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

type Template = {
  id: string;
  sections: {
    id: string;
    title: string;
    weight: number;
    applicable_to?: string[];
    items: { id: string; label: string; type: string; options?: number[] }[];
  }[];
};

type ResponseData = {
  id: string;
  powertrain: string;
  answers: { itemId: string; value?: number | string | boolean }[];
};

export default function VehicleHealthCheckEditorPage() {
  const params = useParams();
  const id = params?.id as string;
  const [tpl, setTpl] = useState<Template | null>(null);
  const [resp, setResp] = useState<ResponseData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetchWithAuth(`/api/vhc/responses/${id}`, {
      method: "GET",
    });
    const data = await res.json();
    setResp({
      id: data.id,
      powertrain: data.powertrain,
      answers: data.answers || [],
    });
    const tRes = await fetchWithAuth(`/api/vhc/templates/active`, {
      method: "GET",
    });
    const template = await tRes.json();
    setTpl(template);
  }, [id]);

  useEffect(() => {
    if (id) {
      load();
    }
  }, [id, load]);

  const sections = useMemo(() => {
    if (!tpl || !resp) return [] as Template["sections"];
    return tpl.sections.filter(
      (s) => !s.applicable_to || s.applicable_to.includes(resp.powertrain)
    );
  }, [tpl, resp]);

  const current = sections[currentIndex];

  const getAnswer = (itemId: string) =>
    resp?.answers.find((a) => a.itemId === itemId)?.value;

  const saveAnswers = useCallback(
    async (partial: { itemId: string; value: number | string | boolean }[]) => {
      if (!resp) return;
      setSaving(true);
      try {
        const res = await fetchWithAuth(`/api/vhc/responses/${resp.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: partial }),
        });
        const updated = await res.json();
        setResp(() => ({
          id: updated.id,
          powertrain: updated.powertrain,
          answers: updated.answers || [],
        }));
      } finally {
        setSaving(false);
      }
    },
    [resp]
  );

  if (!tpl || !resp || !current) {
    return <div className="text-sm text-gray-600">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Vehicle Health Check</h1>
        <div className="text-xs text-gray-500">
          {saving ? "Saving..." : "Saved"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Controls */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-medium">{current.title}</div>
            <div className="space-x-2">
              <button
                className="px-3 py-1.5 text-sm rounded-md border bg-white hover:bg-gray-50 disabled:opacity-50"
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
              >
                Back
              </button>
              <button
                className="px-3 py-1.5 text-sm rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                onClick={() =>
                  setCurrentIndex((i) => Math.min(sections.length - 1, i + 1))
                }
                disabled={currentIndex >= sections.length - 1}
              >
                Next
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {current.items.map((it) => (
              <div key={it.id} className="space-y-2">
                <div className="text-sm font-medium text-gray-800">
                  {it.label}
                </div>
                {/* Radio scale 1..5 default */}
                {(!it.type || it.type === "radio") && (
                  <div className="flex items-center gap-4">
                    {(it.options || [1, 2, 3, 4, 5]).map((opt) => (
                      <label
                        key={opt}
                        className="inline-flex items-center gap-2 text-sm"
                      >
                        <input
                          type="radio"
                          name={it.id}
                          className="h-4 w-4"
                          checked={getAnswer(it.id) === opt}
                          onChange={() =>
                            saveAnswers([{ itemId: it.id, value: opt }])
                          }
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Diagram placeholder */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 flex items-center justify-center">
          <svg viewBox="0 0 200 120" className="w-full h-64 text-gray-400">
            <rect
              x="10"
              y="40"
              width="180"
              height="40"
              rx="8"
              fill="currentColor"
              opacity="0.1"
            />
            <circle cx="40" cy="90" r="12" fill="currentColor" opacity="0.2" />
            <circle cx="160" cy="90" r="12" fill="currentColor" opacity="0.2" />
            <text
              x="100"
              y="25"
              textAnchor="middle"
              fontSize="12"
              fill="#6B7280"
            >
              {current.title}
            </text>
          </svg>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex flex-wrap gap-2">
        {sections.map((s, idx) => (
          <button
            key={s.id}
            className={
              "px-3 py-1.5 text-xs rounded-md border " +
              (idx === currentIndex
                ? "bg-blue-50 border-blue-600 text-blue-700"
                : "bg-white hover:bg-gray-50")
            }
            onClick={() => setCurrentIndex(idx)}
          >
            {idx + 1}. {s.title}
          </button>
        ))}
      </div>
    </div>
  );
}
