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

  const formattedDate = date.format('HH:mm');
  const dateDistance = date.isBefore(dayjs()) ? null : date.fromNow();
</script>

<div class="date-wrapper">
  <span class:strikethrough={!dateDistance}>
    {formattedDate}
  </span>
  <!-- {#if dateDistance}
    <small>{dateDistance}</small>
  {/if} -->
</div>

<style scoped>
  .date-wrapper {
    display: grid;
  }
</style>
