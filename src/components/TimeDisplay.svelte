<script lang="ts">
  import dayjs from 'dayjs';
  import 'dayjs/locale/nl';
  import relativeTime from 'dayjs/plugin/relativeTime';
  import type { Language } from '~/i18n/ui';

  export let lang: Language;
  export let timestamp: number;

  dayjs.extend(relativeTime);
  dayjs.locale(lang);

  const date = dayjs(timestamp);
  const formattedDate = date.format('dd DD MMMM, HH:mm');
</script>

<small>{formattedDate}</small>
