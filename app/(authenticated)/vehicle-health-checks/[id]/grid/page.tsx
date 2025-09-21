"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import VHCSectionGrid from "@/components/vhc/VHCSectionGrid";
import {
  VHC_VALUE_MAPPING,
  getVHCTitle,
  convertAnswersForStorage,
} from "@/lib/vhc/answerMapping";

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

export default function VHCGridPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [tpl, setTpl] = useState<Template | null>(null);
  const [resp, setResp] = useState<ResponseData | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
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

  const currentValues = useMemo(() => {
    const values: Record<string, number | string | boolean | undefined> = {};
    if (resp?.answers) {
      resp.answers.forEach((answer) => {
        values[answer.itemId] = getVHCTitle(answer.value);
      });
    }
    return values;
  }, [resp]);

  const saveAnswers = useCallback(
    async (partial: { itemId: string; value: number | string | boolean }[]) => {
      if (!resp) return;
      setSaving(true);
      try {
        // Convert descriptive titles back to numeric values for storage
        const convertedPartial = convertAnswersForStorage(partial);

        const res = await fetchWithAuth(`/api/vhc/responses/${resp.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers: convertedPartial }),
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

  const handleSelect = useCallback(
    (itemId: string, value: number | string) => {
      saveAnswers([{ itemId, value }]);
    },
    [saveAnswers]
  );

  // Calculate question numbers across all sections
  const getQuestionStartNumber = (sectionIndex: number) => {
    let count = 1;
    for (let i = 0; i < sectionIndex; i++) {
      count += sections[i]?.items.length || 0;
    }
    return count;
  };

  if (!tpl || !resp || sections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-600">
        Loading...
      </div>
    );
  }

  const currentSection = sections[currentSectionIndex];

  // Convert section to VHCSection format
  const vhcSection = {
    id: currentSection.id,
    title: currentSection.title,
    items: currentSection.items.map((it) => ({
      id: it.id,
      label: it.label,
      helperText: undefined,
      options:
        (it as { options?: number[] }).options
          ?.map((v: number) => ({
            value: VHC_VALUE_MAPPING[v as keyof typeof VHC_VALUE_MAPPING],
            label: VHC_VALUE_MAPPING[v as keyof typeof VHC_VALUE_MAPPING],
          }))
          .reverse() ||
        [1, 2, 3, 4, 5]
          .map((v) => ({
            value: VHC_VALUE_MAPPING[v as keyof typeof VHC_VALUE_MAPPING],
            label: VHC_VALUE_MAPPING[v as keyof typeof VHC_VALUE_MAPPING],
          }))
          .reverse(),
    })),
    illustrationCaption: undefined,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/vehicle-health-checks")}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to VHC List
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Vehicle Health Check - Grid View
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                {saving ? "Saving..." : "Saved"}
              </div>
              <div className="text-sm text-gray-600">
                Section {currentSectionIndex + 1} of {sections.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-3 overflow-x-auto">
            {sections.map((section, index) => {
              const isCompleted = section.items.every(
                (item) => currentValues[item.id] !== undefined
              );
              const isCurrent = index === currentSectionIndex;

              return (
                <button
                  key={section.id}
                  onClick={() => setCurrentSectionIndex(index)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isCurrent
                      ? "bg-blue-100 text-blue-700 border border-blue-200"
                      : isCompleted
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isCompleted && <span className="text-green-600">✓</span>}
                    <span>
                      {index + 1}. {section.title}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <VHCSectionGrid
          section={vhcSection}
          currentValues={currentValues}
          onSelect={handleSelect}
          startQuestionNumber={getQuestionStartNumber(currentSectionIndex)}
        />
      </div>

      {/* Navigation Footer */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => setCurrentSectionIndex((i) => Math.max(0, i - 1))}
              disabled={currentSectionIndex === 0}
              className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Previous Section
            </button>

            <div className="text-sm text-gray-600">
              {currentSectionIndex + 1} of {sections.length} sections
            </div>

            <button
              onClick={() => {
                if (currentSectionIndex >= sections.length - 1) {
                  // All sections completed, navigate to report page
                  router.push(`/vehicle-health-checks/${params.id}/report`);
                } else {
                  setCurrentSectionIndex((i) =>
                    Math.min(sections.length - 1, i + 1)
                  );
                }
              }}
              disabled={false}
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              {currentSectionIndex >= sections.length - 1
                ? "View Report"
                : "Next Section"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
