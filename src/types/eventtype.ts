import type { EventType } from './index';

export const TypeToIconMap: Record<string, string> = {
  practice: 'material-symbols:model-training',
  free_practice: 'material-symbols:model-training',
  qualifying: 'material-symbols:format-list-numbered',
  sprint_qualifying: 'material-symbols:format-list-numbered',
  sprint: 'material-symbols:sprint-rounded',
  superpole_qualifying: 'material-symbols:stylus-laser-pointer',
  superpole_race: 'material-symbols:stylus-laser-pointer',
  race: 'material-symbols:workspace-premium',
  warm_up: 'material-symbols:heat',
} satisfies Record<EventType, string>;

export const TypeToNameMap: Record<string, string> = {
  sprint: 'Sprint',
  race: 'Race',
  superpole_race: 'Superpole',
};
