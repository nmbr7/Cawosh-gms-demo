"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
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

export default function VHCFullscreen({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [tpl, setTpl] = useState<Template | null>(null);
  const [resp, setResp] = useState<ResponseData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
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

  // Flatten items for per-question navigation
  const flatItems = useMemo(() => {
    const arr: {
      sectionIdx: number;
      itemIdx: number;
      item: Template["sections"][number]["items"][number];
    }[] = [];
    sections.forEach((s, sectionIdx) => {
      s.items.forEach((item, itemIdx) =>
        arr.push({ sectionIdx, itemIdx, item })
      );
    });
    return arr;
  }, [sections]);

  const [flatIndex, setFlatIndex] = useState(0);

  const current = sections[currentIndex];
  const currentFlat = flatItems[flatIndex];
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
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-600">
        Loading...
      </div>
    );
  }

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
          `bg-white shadow ` +
          (isTabletLandscape
            ? "h-full w-full rounded-none p-4 md:p-6 flex flex-col"
            : "rounded-lg p-4 md:p-6 mx-auto w-full md:w-full lg:max-w-5xl")
        }
      >
        {/* Section indicators at top */}
        <div className="flex items-center gap-2 pb-4">
          {sections.map((s, idx) => {
            const ids = new Set(s.items.map((it) => it.id));
            const done = (resp.answers || []).some((a) => ids.has(a.itemId));
            const active = idx === currentIndex;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setCurrentIndex(idx);
                  const first = flatItems.findIndex(
                    (fi) => fi.sectionIdx === idx
                  );
                  if (first >= 0) setFlatIndex(first);
                }}
                className={`h-3.5 w-3.5 rounded-full ${
                  active ? "bg-blue-600" : done ? "bg-green-500" : "bg-gray-300"
                }`}
                aria-label={`Go to ${s.title}`}
              />
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full min-h-[420px]">
          {/* Left: Section content */}
          <div className="flex flex-col h-full space-y-6">
            <div className="text-2xl md:text-3xl font-semibold leading-tight">
              {current.title}
            </div>
            <p className="text-sm md:text-base text-gray-600 -mt-4">
              Please inspect the items in this section and record your findings
              below.
            </p>
            {currentFlat && (
              <div className="space-y-3">
                <div className="text-base md:text-lg font-medium">
                  {currentFlat.item.label}
                </div>
                {(!currentFlat.item.type ||
                  currentFlat.item.type === "radio") && (
                  <div className="flex flex-col items-start gap-2">
                    {(currentFlat.item.options || [1, 2, 3, 4, 5]).map(
                      (opt) => (
                        <label
                          key={opt}
                          className="inline-flex items-center gap-2 text-base md:text-lg"
                        >
                          <input
                            type="radio"
                            name={currentFlat.item.id}
                            className="h-4 w-4"
                            checked={getAnswer(currentFlat.item.id) === opt}
                            onChange={() =>
                              saveAnswers([
                                { itemId: currentFlat.item.id, value: opt },
                              ])
                            }
                          />
                          <span>{opt}</span>
                        </label>
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Prev/Next separate row (stick to bottom of card) */}
            <div className="flex items-center gap-2 pt-4 mt-auto">
              <button
                className="px-3 py-1.5 text-sm rounded-md border bg-white hover:bg-gray-50 disabled:opacity-50"
                onClick={() => {
                  setFlatIndex((i) => Math.max(0, i - 1));
                  const prev = flatItems[Math.max(0, flatIndex - 1)];
                  if (prev) setCurrentIndex(prev.sectionIdx);
                }}
                disabled={flatIndex === 0}
              >
                Back
              </button>
              <button
                className="px-3 py-1.5 text-sm rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                onClick={() => {
                  setFlatIndex((i) => Math.min(flatItems.length - 1, i + 1));
                  const next =
                    flatItems[Math.min(flatItems.length - 1, flatIndex + 1)];
                  if (next) setCurrentIndex(next.sectionIdx);
                }}
                disabled={flatIndex >= flatItems.length - 1}
              >
                Next
              </button>
            </div>

            {/* Section indicators moved to top */}
          </div>

          {/* Right: SVG placeholder (hidden on phones), fills card height */}
          <div className="hidden md:flex h-full">
            <div className="w-full bg-gray-200 rounded-md flex items-center justify-center text-gray-700 font-semibold h-full">
              SVG HERE
            </div>
          </div>
        </div>
        <div className="text-right text-xs text-gray-500 pt-3">
          {saving ? "Saving..." : "Saved"}
        </div>
      </div>
    </div>
  );
}
