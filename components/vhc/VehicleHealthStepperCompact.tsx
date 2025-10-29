'use client';

import React, { useState } from 'react';

export type VHCRadioOption = {
  value: number | string;
  label: string;
  icon?: React.ReactNode;
};

export type VHCItem = {
  id: string;
  label: string;
  helperText?: string;
  options: VHCRadioOption[];
};

export type VHCSection = {
  id: string;
  title: string;
  items: VHCItem[];
  illustrationCaption?: string;
};

export type SectionStatus = 'done' | 'current' | 'todo';

type Props = {
  sections: VHCSection[];
  stepIndex: number; // 0-based flat index across all items
  stepCount: number;
  sectionIndex: number; // current section index
  sectionStatuses: SectionStatus[]; // per section
  currentItems: VHCItem[]; // 2 items at a time
  currentValues: Record<string, number | string | boolean | undefined>; // values for current items
  onSelect: (itemId: string, value: number | string) => void;
  onPrev: () => void;
  onNext: () => void;
  onJumpToSection: (index: number) => void;
  onExit: (action: 'save' | 'exit' | 'cancel') => void;
};

export function VehicleHealthStepperCompact({
  sections,
  stepIndex,
  stepCount,
  sectionIndex,
  sectionStatuses,
  currentItems,
  currentValues,
  onSelect,
  onPrev,
  onNext,
  onJumpToSection,
  onExit,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="h-full w-full flex flex-col">
      {/* Top bar: stepper with progress */}
      <div className="flex items-center justify-between gap-4 pb-4">
        <div aria-live="polite" className="text-sm md:text-base text-gray-700">
          Step {stepIndex + 1} of {stepCount} – {sections[sectionIndex]?.title}
        </div>
        <button
          onClick={() => setConfirmOpen(true)}
          className="text-sm md:text-base text-gray-600 hover:text-gray-900 underline"
        >
          Exit
        </button>
      </div>

      <nav aria-label="Progress" className="pb-4" role="group">
        <ol className="flex items-center gap-2">
          {sections.map((s, idx) => {
            const status = sectionStatuses[idx] ?? 'todo';
            const color =
              status === 'done'
                ? 'bg-green-500'
                : status === 'current'
                  ? 'bg-orange-500'
                  : 'bg-gray-300';
            return (
              <li key={s.id} className="flex items-center gap-2">
                <button
                  type="button"
                  aria-current={status === 'current' ? 'step' : undefined}
                  aria-label={`Go to ${s.title}`}
                  onClick={() => onJumpToSection(idx)}
                  className={`h-3.5 w-3.5 rounded-full ${color}`}
                />
                {idx < sections.length - 1 && (
                  <span className="w-10 h-0.5 bg-gray-200" aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Content */}
      <div className="flex-1 bg-gray-50 rounded-md p-4 md:p-6 flex flex-col">
        <div className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-semibold leading-tight">
            {sections[sectionIndex]?.title}
          </h2>

          {/* Questions Grid - 2 questions at a time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentItems.map((item, index) => {
              const groupName = `question-${item.id}-${index}`;
              const currentValue = currentValues[item.id];

              return (
                <div key={item.id} className="space-y-3">
                  <div>
                    <p className="text-lg md:text-xl font-medium">
                      {item.label}
                    </p>
                    {item.helperText && (
                      <p className="text-sm md:text-base text-gray-600 mt-1">
                        {item.helperText}
                      </p>
                    )}
                  </div>

                  {/* Radio options */}
                  <fieldset>
                    <legend className="sr-only">
                      Select an option for {item.label}
                    </legend>
                    <div className="flex flex-col gap-2">
                      {item.options.map((opt) => (
                        <label
                          key={String(opt.value)}
                          className={`flex items-center gap-3 rounded-md px-3 py-2 cursor-pointer border transition-colors ${
                            currentValue === opt.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-transparent hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="radio"
                            aria-labelledby={`${groupName}-${String(
                              opt.value,
                            )}`}
                            className="h-5 w-5 accent-blue-600"
                            name={groupName}
                            checked={currentValue === opt.value}
                            onChange={() => onSelect(item.id, opt.value)}
                          />
                          {opt.icon && <span aria-hidden>{opt.icon}</span>}
                          <span
                            id={`${groupName}-${String(opt.value)}`}
                            className="text-[1.1rem]"
                          >
                            {opt.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
              );
            })}
          </div>

          {/* Single question centered (for odd numbers) */}
          {currentItems.length === 1 && (
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                {/* Question content is already rendered above */}
              </div>
            </div>
          )}
        </div>

        {/* Bottom navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            type="button"
            onClick={onPrev}
            className="px-4 py-2 rounded-md border bg-white hover:bg-gray-50 text-sm md:text-base"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onNext}
            className="px-5 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow text-sm md:text-base"
          >
            Next
          </button>
        </div>
      </div>

      {/* Exit confirm dialog */}
      {confirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setConfirmOpen(false)}
          />
          <div className="relative bg-white rounded-md shadow p-4 md:p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Exit Health Check</h3>
            <p className="text-sm text-gray-600 mb-4">
              Do you want to save before exiting?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                className="px-3 py-2 rounded-md border bg-white hover:bg-gray-50 text-sm"
                onClick={() => {
                  setConfirmOpen(false);
                  onExit('cancel');
                }}
              >
                Cancel
              </button>
              <button
                className="px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-sm"
                onClick={() => {
                  setConfirmOpen(false);
                  onExit('exit');
                }}
              >
                Exit Without Saving
              </button>
              <button
                className="px-3 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm"
                onClick={() => {
                  setConfirmOpen(false);
                  onExit('save');
                }}
              >
                Save & Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VehicleHealthStepperCompact;
