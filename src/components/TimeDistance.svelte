<script lang="ts">
    import dayjs from 'dayjs';
    import 'dayjs/locale/nl';
    import relativeTime from 'dayjs/plugin/relativeTime';
    dayjs.extend(relativeTime);
    dayjs.locale('nl');
    
    export let timestamp: number;
    
    const date = dayjs(timestamp);
    const dateDistance = date.fromNow()
</script>

<small>{dateDistance}</small>