import { describe, it, expect } from 'vitest';
import { FORM_MODES, formFieldVisibility } from '../../src/utils/formFieldVisibility';
import { DEFAULT_CONFIG } from '../../src/database/configDefaults';

describe('formFieldVisibility', () => {
  it('uses the add flags for the add-transaction form', () => {
    const config = { ...DEFAULT_CONFIG, addShowLabels: false, addShowComments: true, addShowPhoto: false };
    expect(formFieldVisibility(config, 'add')).toEqual({ labels: false, comments: true, photo: false });
  });

  it('uses the modify flags for the modify-transaction form', () => {
    const config = { ...DEFAULT_CONFIG, modifyShowLabels: false, modifyShowComments: false, modifyShowPhoto: true };
    expect(formFieldVisibility(config, 'modify')).toEqual({ labels: false, comments: false, photo: true });
  });

  it('uses the create-recurring flags and never shows a photo on the new-rule form', () => {
    const config = { ...DEFAULT_CONFIG, createRecurringShowLabels: false, createRecurringShowComments: true };
    expect(formFieldVisibility(config, 'createRule')).toEqual({ labels: false, comments: true, photo: false });
  });

  it('uses the edit-recurring flags and never shows a photo on the edit-rule form', () => {
    const config = { ...DEFAULT_CONFIG, editRecurringShowLabels: true, editRecurringShowComments: false };
    expect(formFieldVisibility(config, FORM_MODES.editRule)).toEqual({ labels: true, comments: false, photo: false });
  });

  it('pins the form mode vocabulary', () => {
    expect(FORM_MODES).toEqual({
      add: 'add',
      modify: 'modify',
      createRule: 'createRule',
      editRule: 'editRule',
    });
  });
});
