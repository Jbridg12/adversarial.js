<template>
  <div>
  <span v-show="loading" class="spinner-border hidden" role="status"> </span>
  <p v-show="loading">
    Loading... {{key}}
  </p>
  </div>
</template>

<script>
export default {
  name: 'Spinner',
  props: {
    description: String
  },
  mounted: function() {
    this.$root.$on('loading', (text) => {
      this.loading = true
      this.key = text
    }),
    this.$root.$on('loaded', () => {
      this.loading = false
    })
  },
  data: () => ({
    key: "Prediction",
    loading: false
  }),
}
</script>

<style>

</style>