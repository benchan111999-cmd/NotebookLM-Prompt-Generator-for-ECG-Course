import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_CUSTOM_FOCUS_LENGTH, sanitizeCustomFocus } from './sanitize';

test('sanitizeCustomFocus removes control chars, collapses whitespace, and truncates deterministically', () => {
  const suffix = 'x'.repeat(MAX_CUSTOM_FOCUS_LENGTH);
  const input = `\u0000  ECG\n\tfocus\r\n  plan  ${suffix}`;
  const cleaned = sanitizeCustomFocus(input);

  assert.equal(cleaned, `ECG focus plan ${'x'.repeat(MAX_CUSTOM_FOCUS_LENGTH - 'ECG focus plan '.length)}`);
  assert.equal(cleaned.length, MAX_CUSTOM_FOCUS_LENGTH);
});
