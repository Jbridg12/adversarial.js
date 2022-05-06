<template>
	<div class="wrapper">
		<input class="button" type="button" v-model=value @click = "onClick()" :disabled="isDisabled"> 
		<div class="uploader">
			<input id="fileid" type="file" accept="image/*" @change = "upload()" hidden/>
		</div>
	</div>
</template>

<script>
import {nextImage, uploadImage, predictImg, attack, changeDataset, download, resetNoise, resetAdv, showLoader} from "../../public/js/intro.js"
export default {
  name: 'Button',
  props: {
    value: String,
    description: String
  },
  methods: {
    onClick(){
      if(this.description == "next-image"){
        resetNoise()
        resetAdv()
        nextImage()
      }
      else if(this.description == "predict") {
        this.$root.$emit('datasetChange', 2)
        this.$root.$emit('datasetChange', 3)
        this.$root.$emit('loading', "Prediction")
        predictImg()
      }
      else if(this.description == "adv"){
        this.$root.$emit('loading', "Adversarial")
        showLoader()
        if (document.getElementById("loadSpinner").style.display == "block") attack()
        this.$root.$emit('buttonPressed', 0)
      }
      else if(this.description == "download"){
        download();
      }
      else if(this.description == "upload-image"){
        resetNoise()
        resetAdv()
        this.$root.$emit('imageUploaded', 'ImageNet (object recognition, large)')
        changeDataset('imagenet')
        this.$emit('changeDataset', 'imagenet')
        this.$emit('uploadedImage', 'imagenet')
        this.$root.$emit('dropdownChange', 1)
        this.$root.$emit('buttonPressed', 2)
        document.getElementById('fileid').click()
      }
    },
    upload(){
      uploadImage()
    }
  },
  data() {
    return {
        checks: {0:false,1:false,2:false,3:false},
        conditions: {0:false, 1:false, 2:false, 3:false},
    } 
  },
  mounted: function() {
    this.$root.$on('dropdownChange', (text) => {
      this.checks[text] = true
    })
    this.$root.$on('buttonPressed', (text) => {
      this.conditions[text] = true
    })
    this.$root.$on('datasetChange', (text) => {
      this.conditions[text] = false
    })
  },
  computed: {
    isDisabled() {
      let returnValue = false
      for(var key in this.checks){
        if(this.checks[key] == false) {
          returnValue = true
        }
      }
      if(this.description == 'next-image' || this.description == 'upload-image') {
        return false
      }
      else if (this.description == 'predict') {
        if (this.checks[3] == true && this.checks[1] == true) return false
        else return returnValue
      }
      else if (this.description == 'download') {
        if (this.conditions[0] == true) return false
        else return true
      }
      else if (this.description == 'adv') {
        if (this.conditions[2] == true && this.conditions[3] == true) return true
        else return returnValue
      }
      else{
        return returnValue
      }
      
    }
  }
  
}
</script>

<style>
.button {
  background-color: #EBF2FC;
  color: #000000;
  font-family: "Raleway-italic";
  font-weight: bold;
  font-size: calc(10px + .4vw);
  width: 22vw;
  height: 7vh;
  box-shadow: 1px 2px 4px #8c8c8c;
  border-radius: 0;
  border: 0;
  white-space: normal;
  word-wrap: break-word;
}

.button:disabled {
  cursor: not-allowed;
  pointer-events: none;
  background: #999;
  color: #555;
}

.button:active {
  background: #ced7e2;
  -webkit-box-shadow: inset 0px 0px 5px #c1c1c1;
     -moz-box-shadow: inset 0px 0px 5px #c1c1c1;
          box-shadow: inset 0px 0px 5px #c1c1c1;
   outline: none;
}
</style>