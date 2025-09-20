"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import VehicleHealthStepper, {
  VHCSection,
} from "@/components/vhc/VehicleHealthStepper";

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

  if (!tpl || !resp || !current || !currentFlat) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-600">
        Loading...
      </div>
    );
  }

  // Prepare props for the stepper component
  const compSections: VHCSection[] = sections.map((s) => ({
    id: s.id,
    title: s.title,
    items: s.items.map((it) => ({
      id: it.id,
      label: it.label,
      helperText: undefined,
      options:
        (it as { options?: number[] }).options?.map((v: number) => ({
          value: v,
          label: String(v),
        })) || [1, 2, 3, 4, 5].map((v) => ({ value: v, label: String(v) })),
    })),
    illustrationCaption: undefined,
  }));

  const sectionStatuses: ("done" | "current" | "todo")[] = sections.map(
    (s, idx) => {
      const ids = new Set(s.items.map((it) => it.id));
      const done = (resp.answers || []).some((a) => ids.has(a.itemId));
      if (idx === currentIndex) return "current";
      return done ? "done" : "todo";
    }
  );

  const currentVal = getAnswer(currentFlat.item.id);

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
        <VehicleHealthStepper
          sections={compSections}
          stepIndex={flatIndex}
          stepCount={flatItems.length}
          sectionIndex={currentIndex}
          sectionStatuses={sectionStatuses}
          currentItem={{
            id: currentFlat.item.id,
            label: currentFlat.item.label,
            helperText: undefined,
            options:
              (currentFlat.item as { options?: number[] }).options?.map(
                (v: number) => ({ value: v, label: String(v) })
              ) || [1, 2, 3, 4, 5].map((v) => ({ value: v, label: String(v) })),
          }}
          currentValue={currentVal}
          onSelect={(v) =>
            saveAnswers([{ itemId: currentFlat.item.id, value: v }])
          }
          onPrev={() => {
            setFlatIndex((i) => Math.max(0, i - 1));
            const prev = flatItems[Math.max(0, flatIndex - 1)];
            if (prev) setCurrentIndex(prev.sectionIdx);
          }}
          onNext={() => {
            setFlatIndex((i) => Math.min(flatItems.length - 1, i + 1));
            const next =
              flatItems[Math.min(flatItems.length - 1, flatIndex + 1)];
            if (next) setCurrentIndex(next.sectionIdx);
          }}
          onJumpToSection={(idx) => {
            setCurrentIndex(idx);
            const first = flatItems.findIndex((fi) => fi.sectionIdx === idx);
            if (first >= 0) setFlatIndex(first);
          }}
          onExit={(action) => {
            if (action === "save") {
              // Save is already handled by the autosave functionality
              router.push("/vehicle-health-checks");
            } else if (action === "exit") {
              // Exit without saving - just navigate away
              router.push("/vehicle-health-checks");
            }
            // For "cancel", do nothing (dialog will close)
          }}
          showIllustration
        />
        <div className="text-right text-xs text-gray-500 pt-3">
          {saving ? "Saving..." : "Saved"}
        </div>
      </div>
    </div>
  );
}
