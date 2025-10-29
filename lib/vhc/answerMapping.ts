// Mapping for VHC answer values to descriptive titles
export const VHC_VALUE_MAPPING = {
  1: 'Critical/Unsafe',
  2: 'Needs Attention',
  3: 'Acceptable',
  4: 'Good Condition',
  5: 'Optimal/Like New',
} as const;

export const VHC_TITLE_MAPPING = {
  'Critical/Unsafe': 1,
  'Needs Attention': 2,
  Acceptable: 3,
  'Good Condition': 4,
  'Optimal/Like New': 5,
} as const;

/**
 * Converts a numeric VHC answer value to its descriptive title
 */
export function getVHCTitle(
  value: number | string | boolean | undefined,
): string | number | boolean | undefined {
  if (typeof value === 'number' && value in VHC_VALUE_MAPPING) {
    return VHC_VALUE_MAPPING[value as keyof typeof VHC_VALUE_MAPPING];
  }
  return value;
}

/**
 * Converts a descriptive VHC title back to its numeric value
 */
export function getVHCValue(
  title: number | string | boolean | undefined,
): number | string | boolean | undefined {
  if (typeof title === 'string' && title in VHC_TITLE_MAPPING) {
    return VHC_TITLE_MAPPING[title as keyof typeof VHC_TITLE_MAPPING];
  }
  return title;
}

/**
 * Converts an array of answers from descriptive titles to numeric values for storage
 */
export function convertAnswersForStorage(
  answers: { itemId: string; value: number | string | boolean }[],
) {
  return answers.map((answer) => ({
    ...answer,
    value: getVHCValue(answer.value),
  }));
}
