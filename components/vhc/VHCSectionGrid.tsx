"use client";

import React from "react";

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

type Props = {
  section: VHCSection;
  currentValues: Record<string, number | string | boolean | undefined>;
  onSelect: (itemId: string, value: number | string) => void;
  startQuestionNumber?: number;
};

export function VHCSectionGrid({
  section,
  currentValues,
  onSelect,
  startQuestionNumber = 1,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Questions Grid */}
      <div className="max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-2">
          {section.items.map((item, index) => {
            const questionNumber = startQuestionNumber + index;
            const currentValue = currentValues[item.id];

            return (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                {/* Question Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-700">
                        {questionNumber}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 leading-tight">
                        {item.label}
                      </h3>
                      {item.helperText && (
                        <p className="text-sm text-gray-600 mt-1">
                          {item.helperText}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Answer Options */}
                <div className="p-4">
                  <fieldset>
                    <legend className="sr-only">
                      Select an option for question {questionNumber}
                    </legend>
                    <div className="space-y-2">
                      {item.options.map((opt) => (
                        <label
                          key={String(opt.value)}
                          className={`flex items-center gap-3 rounded-lg px-3 py-3 cursor-pointer border transition-all duration-200 ${
                            currentValue === opt.value
                              ? "border-blue-500 bg-blue-50 shadow-sm"
                              : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            aria-labelledby={`${item.id}-${String(opt.value)}`}
                            className="h-4 w-4 accent-blue-600"
                            name={item.id}
                            checked={currentValue === opt.value}
                            onChange={() => onSelect(item.id, opt.value)}
                          />
                          {opt.icon && (
                            <span aria-hidden className="text-gray-500">
                              {opt.icon}
                            </span>
                          )}
                          <span
                            id={`${item.id}-${String(opt.value)}`}
                            className="text-sm font-medium text-gray-900 flex-1"
                          >
                            {opt.label}
                          </span>
                          {currentValue === opt.value && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Section Progress</span>
          <span className="font-medium text-gray-900">
            {
              Object.keys(currentValues).filter((key) =>
                section.items.some(
                  (item) => item.id === key && currentValues[key] !== undefined
                )
              ).length
            }{" "}
            / {section.items.length} answered
          </span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${
                (Object.keys(currentValues).filter((key) =>
                  section.items.some(
                    (item) =>
                      item.id === key && currentValues[key] !== undefined
                  )
                ).length /
                  section.items.length) *
                100
              }%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default VHCSectionGrid;
