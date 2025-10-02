"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function VHCFullscreen({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [tpl, setTpl] = useState<Template | null>(null);
  const [resp, setResp] = useState<ResponseData | null>(null);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [isTabletLandscape, setIsTabletLandscape] = useState(false);

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

  // Detect tablet landscape and toggle full-bleed card
  useEffect(() => {
    const evaluate = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isLandscape = width > height;
      const isTablet = width >= 768 && width <= 1400; // iPad Air/Pro range
      setIsTabletLandscape(isLandscape && isTablet);
    };
    evaluate();
    window.addEventListener("resize", evaluate);
    window.addEventListener(
      "orientationchange",
      evaluate as unknown as EventListener
    );
    return () => {
      window.removeEventListener("resize", evaluate);
      window.removeEventListener(
        "orientationchange",
        evaluate as unknown as EventListener
      );
    };
  }, []);

  const sections = useMemo(() => {
    if (!tpl || !resp) return [] as Template["sections"];
    return tpl.sections.filter(
      (s) => !s.applicable_to || s.applicable_to.includes(resp.powertrain)
    );
  }, [tpl, resp]);

  const current = sections[currentSectionIndex];

  const currentValues = useMemo(() => {
    const values: Record<string, number | string | boolean | undefined> = {};
    if (resp?.answers) {
      resp.answers.forEach((answer) => {
        values[answer.itemId] = getVHCTitle(answer.value);
      });
    }
    return values;
  }, [resp]);

  // Calculate question numbers across all sections
  const getQuestionStartNumber = (sectionIndex: number) => {
    let count = 1;
    for (let i = 0; i < sectionIndex; i++) {
      count += sections[i]?.items.length || 0;
    }
    return count;
  };

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

  if (!tpl || !resp || !current) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-600">
        Loading...
      </div>
    );
  }

  // Convert current section to VHCSection format
  const vhcSection = {
    id: current.id,
    title: current.title,
    items: current.items.map((it) => ({
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
    <div
      className={
        isTabletLandscape
          ? "h-screen w-screen bg-gray-100 overflow-hidden"
          : "min-h-screen bg-gray-100 p-3 md:p-4"
      }
    >
      <div
        className={
          isTabletLandscape
            ? "h-full w-full rounded-none p-4 md:p-6 bg-white shadow"
            : "rounded-lg p-4 md:p-6 mx-auto w-full md:w-full lg:max-w-5xl bg-white shadow"
        }
      >
        <div className="space-y-6">
          {/* Section Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/vehicle-health-checks")}
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                ← Back to VHC List
              </button>
              <span className="text-gray-400">|</span>
              <span className="text-sm text-gray-600">
                Section {currentSectionIndex + 1} of {sections.length}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {saving ? "Saving..." : "Saved"}
            </div>
          </div>

          {/* Section Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {sections.map((section, index) => {
              const isCompleted = section.items.every(
                (item) => currentValues[item.id] !== undefined
              );
              const isCurrent = index === currentSectionIndex;

              return (
                <button
                  key={section.id}
                  onClick={() => setCurrentSectionIndex(index)}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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

          {/* Grid Component */}
          <VHCSectionGrid
            section={vhcSection}
            currentValues={currentValues}
            onSelect={(itemId, value) => saveAnswers([{ itemId, value }])}
            startQuestionNumber={getQuestionStartNumber(currentSectionIndex)}
          />

          {/* Navigation Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
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
                  router.push(`/vhc-fullscreen/${id}/report`);
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
