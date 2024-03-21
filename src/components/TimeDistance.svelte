<script lang="ts">
  import dayjs from 'dayjs';
  import 'dayjs/locale/nl';
  import relativeTime from 'dayjs/plugin/relativeTime';
  import type { Language } from '~/i18n/ui';
  import { useTranslations } from '~/i18n/utils';

  export let lang: Language;
  export let timestamp: number;

  const t = useTranslations(lang);
  dayjs.extend(relativeTime);
  dayjs.locale(lang);

  const date = dayjs(timestamp);
  const today = date.isSame(new Date(), 'days');

  const formattedDate = date.format('dd DD MMMM, HH:mm');
  const dateDistance = today ? t('time.today') : date.isBefore(dayjs()) ? null : date.fromNow();
</script>

<div class="date-wrapper">
  <span class:strikethrough={!dateDistance}>{formattedDate}</span>

  {#if dateDistance}
    <small>{dateDistance}</small>
  {/if}
</div>

<style scoped>
  .date-wrapper {
    display: grid;
  }
</style>
