export const MAX_CUSTOM_FOCUS_LENGTH = 600;

export const sanitizeCustomFocus = (value: string): string => {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_CUSTOM_FOCUS_LENGTH);
};
