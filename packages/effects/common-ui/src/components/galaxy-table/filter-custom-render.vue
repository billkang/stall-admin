<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    render: {
      type: Function,
      required: true,
    },
  },
  setup(props) {
    return () => (!!props.render ? props.render() : undefined);
  },
});
</script>
