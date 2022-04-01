<template>
	<div class="wrapper">
			<input class="button btn btn-primary" type="button" value="Click here" @click = "onClick()"/>
		<div class="uploader">
			<input id="fileid" type="file" accept="image/*" @change = "upload()" hidden/>
		</div>
	</div>
</template>

<script>
import {nextImage, uploadImage, predictImg, attack} from "../../public/js/intro.js"
export default {
  name: 'Button',
  props: {
    description: String
  },
  methods: {
    onClick(){
		if(this.description == "next-image"){ nextImage()}
        else if(this.description == "predict") {predictImg()}
        else if(this.description == "adv") {attack()}
		else if(this.description == "upload-image") {document.getElementById('fileid').click()}
	},
	upload(){
		uploadImage()
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
  width: 15em;
  border-radius: 0;
  border: 0;
}
</style>