<template>
 <div class = "loading hidden" id = "loadSpinner">
    <strong>Loading {{key}}...</strong>
    <div class="spinner-border" role="status">
    </div>
  </div>
</template>

<script>
export default {
  name: 'Spinner',
  props: {
    description: String
  },
  data: () => ({
    key: "Prediction",
  }),
  mounted: function() {
    this.$root.$on('loading', (key) => {
      this.key = key;
    })
  }
}
</script>

<style>
.hidden {
  display: none;
}
</style>