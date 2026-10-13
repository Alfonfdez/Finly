import type { Config } from '../database/types';

/** Which form is being rendered: the add/edit transaction form or the create/edit rule form. */
export type FormMode = 'add' | 'modify' | 'createRule' | 'editRule';

export interface FormFieldVisibility {
  labels: boolean;
  comments: boolean;
  photo: boolean;
}

/**
 * Resolves which optional sections a form shows, per screen: Add and Modify
 * transaction have their own flags, as do New and Edit recurring rule. Rule
 * forms never show a photo (a rule has none).
 */
export function formFieldVisibility(config: Config, mode: FormMode): FormFieldVisibility {
  switch (mode) {
    case 'modify':
      return { labels: config.modifyShowLabels, comments: config.modifyShowComments, photo: config.modifyShowPhoto };
    case 'createRule':
      return { labels: config.createRecurringShowLabels, comments: config.createRecurringShowComments, photo: false };
    case 'editRule':
      return { labels: config.editRecurringShowLabels, comments: config.editRecurringShowComments, photo: false };
    case 'add':
    default:
      return { labels: config.addShowLabels, comments: config.addShowComments, photo: config.addShowPhoto };
  }
}
