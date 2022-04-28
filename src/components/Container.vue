<template>
  <div class="wrap">
    <div class="options">
      <div class="label">Select a Model</div>
      <div class="drop-down"><ModelDropDown/></div>
      <div class="label">Select a Dataset</div>
      <div class="drop-down"><DatasetDropDown @changeDataset = "updateDropdowns"/></div>
      <div class="label">Select an Attack</div>
      <div class="drop-down"><AttackDropDown/></div>
      <div class="label">Turn This Image Into A/An:</div>
      <div class="drop-down"><ImageDropDown :newDataset="newDataset"/></div>
    </div>
    <div class="imageContainer">
      <ImageContainer />
      <PredictionData />
    </div>
    <div class="buttonDiv">
      <div class="generate">
        <Button value = "Run Neural Network" id = "predict" description="predict"/>
        <br>
        <Button value = "Generate" id = "adv" description="adv"/>
      </div>
      <div class="upload">
        <Button value = "Upload Image" description="upload-image" @uploadedImage = "uploadedDataset" @changeDataset = "updateDropdowns"/>
        <br>
        <Button value = "Next Image" description="next-image"/>
        <br>
        <Button value = "Download Image"/>
      </div>
    </div>
  </div>
</template>

<script>
import Button from './Button.vue'
import DatasetDropDown from './DatasetDropDown.vue'
import ModelDropDown from './ModelDropDown.vue'
import AttackDropDown from './AttackDropDown.vue'
import ImageDropDown from './ImageDropDown.vue'
import ImageContainer from './ImageContainer.vue'
import PredictionData from './PredictionData.vue'

export default {
  name: 'Container',
  components: {
    Button,
    ModelDropDown,
    DatasetDropDown,
    AttackDropDown,
    ImageDropDown,
    ImageContainer,
    PredictionData
  },
  methods: {
    updateDropdowns(val) {
      this.newDataset = val
    },
    uploadedDataset(val) {
      this.newDataset = val
    }
  },
  data() { return { newDataset: "mnist" } }
}

</script>

<style>
.mainImage {
  max-width: 100%;
  height: auto;
}

.wrap {
  background-color: #FFFFFF;
  width: 85%;
  max-width: 1300px;
  height: fit-content;
  margin: auto;
  margin-top: 4em;
  padding: 1em;
  display: flex;
  flex-flow: row wrap;
  text-align: center;
}

.options {
  width: 45%;
  height: fit-content;
  padding: 1em;
  text-align: left;
}

.generate {
  width: 45%;
  height: fit-content;
  padding: 1em;
}

.imageContainer {
  width: 55%;
  height: fit-content;
  padding-top: 4em;
}

.upload {
  width: 55%;
  height: fit-content;
  padding: 1em;
}

.label {
  text-align: left;
  font-weight: 600;
  font-family: "Raleway";
  padding-top: 1em;
  padding-bottom: .5em;
}

.drop-down {
  margin: auto;
  text-align: center;
}

.buttonDiv {
  width:100%;
  display:flex;
}

@media (max-width: 600px) {
  .wrap {
    margin-top: .5em;
    padding: .1em;
    flex-direction: column;
  }

  .options {
    width: 100%;
    padding: .5em;
    text-align: center;    
  }

  .generate {
    width: 50%;
    margin:0em;
  }

  .label {
    display: inline-block;
    vertical-align: top;
    padding-top: 25px;
  }

  .imageContainer {
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding:1em
  }

  .upload {
    width: 50%;
  }

  .label {
    padding-top: .8em;
    padding-bottom: .3em;
  }

  .drop-down {
    width: 100%;
  }
}
</style>

