import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPrompt } from './buildPrompt';
import { MAX_CUSTOM_FOCUS_LENGTH, sanitizeCustomFocus } from '@/shared/sanitize';

const moduleName = 'Module 1: Foundations of Cardiac Electrophysiology & Public Health';
const firstTopic = 'Heart Disease Burden: Overview and impact of Coronary Heart Disease';

test('returns placeholder when no topics are selected', () => {
  const result = buildPrompt({
    selectedModule: moduleName,
    selectedTopics: [],
    mode: 'lecture',
    useStyle: true,
    customFocus: '',
  });

  assert.equal(result, 'Please select at least one topic to generate a prompt...');
});

test('includes lecture-specific sections and additional focus', () => {
  const result = buildPrompt({
    selectedModule: moduleName,
    selectedTopics: [firstTopic],
    mode: 'lecture',
    useStyle: true,
    customFocus: '  focus\n\n on differences  ',
  });

  assert.match(result, /### TASK: LECTURE SLIDES/);
  assert.match(result, /### STYLE GUIDELINES/);
  assert.match(result, /### ADAPTIVE SLIDE REQUIREMENTS/);
  assert.match(result, /### ADDITIONAL FOCUS\nfocus on differences/);
});

test('generates exercise prompt without style section when disabled', () => {
  const result = buildPrompt({
    selectedModule: moduleName,
    selectedTopics: [firstTopic, 'Anatomy and Physiology of the Heart: Chambers, valves, and circulation mechanics'],
    mode: 'exercise',
    useStyle: false,
    customFocus: '',
  });

  assert.match(result, /### TASK: EXERCISE GENERATION/);
  assert.doesNotMatch(result, /### STYLE GUIDELINES/);
  assert.match(result, /Generate 8 high-quality clinical exercise questions/);
});

test('sanitizeCustomFocus normalizes whitespace and enforces max length', () => {
  const noisy = `\u0000A\n\nB\t C ${'x'.repeat(MAX_CUSTOM_FOCUS_LENGTH + 10)}`;
  const cleaned = sanitizeCustomFocus(noisy);

  assert(!cleaned.includes('\u0000'));
  assert.equal(cleaned.length, MAX_CUSTOM_FOCUS_LENGTH);
});
