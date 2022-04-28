<template>
	<div class="wrapper">
		<input class="button" type="button" v-model=value @click = "onClick()" :disabled="isDisabled">
		<div class="uploader">
			<input id="fileid" type="file" accept="image/*" @change = "upload()" hidden/>
		</div>
	</div>
</template>

<script>
import {nextImage, uploadImage, predictImg, attack, changeDataset} from "../../public/js/intro.js"
export default {
  name: 'Button',
  props: {
    value: String,
    description: String
  },
  methods: {
    onClick(){
      if(this.description == "next-image"){nextImage()}
      else if(this.description == "predict") {
        let predict = document.getElementById('predict')
        let adv = document.getElementById('adv')
        predict.disabled = true
        adv.disabled = true
        predictImg()
        predict.disabled = false
        adv.disabled = false
      }
      else if(this.description == "adv"){
        let predict = document.getElementById('predict')
        let adv = document.getElementById('adv')
        predict.disabled = true
        adv.disabled = true
        attack()
        predict.disabled = false
        adv.disabled = false
      }
      else if(this.description == "upload-image"){
        let tmp = document.getElementById('select-dataset')
        tmp.innerHTML = "ImageNet (object recognition, large)"
        changeDataset('imagenet')
        this.$emit('changeDataset', 'imagenet')
        this.$emit('uploadedImage', 'imagenet')
        this.$root.$emit('dropdownChange', 1)
        document.getElementById('fileid').click()
      }
    },
    upload(){
      uploadImage()
    }
  },
  data() {
    return {
        checks: {0:false,1:false,2:false,3:false
      }
    } 
  },
  mounted: function() {
    this.$root.$on('dropdownChange', (text) => {
      this.checks[text] = true
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
</style>