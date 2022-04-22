<template>
  <div class="wrap-tutorial">
    <strong>Instructions for how to use the demo:</strong><br><br>
    <ol>
      <li>Choose a model.</li>
      <li>Select a data set, which is used to aid in the classification of images.</li>
      <li>Then, click 'Run Neural Network'.
      <li>Select an attack method.</li>
      <li>Decide what the attack will change the image into.</li>
      <li>Click 'Generate'</li>
    </ol>

    You can cycle through preset images using 'Next Image', or you can choose to upload your own image using 'Upload Image'.
    <br>Once the model has been ran, you can choose to 'Download Image' to save what you generated.
  </div>
</template>

<script>

export default {
  name: 'Tutorial'
}

</script>

<style>
.wrap-tutorial {
  font-family: "Raleway";
  background-color: #FFFFFF;
  font-size: calc(14px + .2vw);
  width: 85%;
  max-width: 1300px;
  height: fit-content;
  margin: auto;
  margin-top: 6vh;
  padding: 2vw;
}
</style>
