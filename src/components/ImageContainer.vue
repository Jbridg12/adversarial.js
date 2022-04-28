<template>
  <div>
    <canvas id="original" class="tableimg" max-width="224" height="224" data-bs-toggle="modal" data-bs-target="#compareModal"></canvas>
    <div class="modal fade" id="compareModal" tabindex="-1" aria-labelledby="compareModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="compareModalLabel">Compare the Images!</h5>
           <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class = "row g-1">
              <div class = "col">
              <p>Original</p>
              <canvas id="og" class="tableimg" max-width="224" height="224"></canvas>
              </div>
              <div class = "col">
              <p>Noise</p>
              <canvas id="adversarial-noise" class="tableimg" max-width="224" height="224"></canvas>
              </div>
              <div class = "col">
              <p>Adversarial Image</p>
              <canvas id="adversarial" class="tableimg" max-width="224" height="224"></canvas>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ImageContainer',
  methods: {
  }
}
</script>

<style>
.hideimage[src=""] {
  display: none;
}
</style>
