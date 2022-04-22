<template>
  <div class="dropdown">
    <button class="dropdown-button dropdown-toggle" type="button" id="select-model" data-bs-toggle="dropdown" aria-expanded="false" value = "">
      {{key}}
    </button>
      <ul class="dropdown-menu" aria-labelledby="select-model">
        <li v-for="option in options" :key="option.key">
          <a class="dropdown-item" @click="onClick(option.value); key = option.key; value = option.value" href="javascript: void(0)">{{option.key}}</a>
        </li>
      </ul>
  </div>
</template>
  
<script>
import {changeArchitecture} from "../../public/js/intro.js"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"
export default {
  name: 'ModelDropDown',
  id: 'select-model',
  props: {
    description: String
  },
  data: () => ({
    options: [
      { key: "VGG-16", value: 'vgg16' }, 
      { key: "ResNet", value: 'resnet' }, 
      { key: "Xception", value: 'xception'},
      { key: "MobileNet", value: 'mobilenet' }
      ],
    key: "Select Architecture",
    value: ""
  }),
  methods: {
	onClick(value){
		changeArchitecture(value)
	}
  }
} 
</script>

<style>
.dropdown-button {
background-color: #FFFFFF;
color: #000000;
font-family: "Raleway";
font-size: calc(13px + .2vw);
width: 25vw;
height: 8vh;
box-shadow: 1px 2px 4px #cecece;
border-radius: .3em;
text-align: left;
white-space: normal;
word-wrap: break-word;
}

.dropdown-toggle::after {
  float: right !important;
  vertical-align: middle !important;
}

@media (max-width: 280px) {
  .dropdown-button {
    font-size: 5vw;
  }
}

@media (max-width: 600px) {
  .dropdown-button {
    width: calc(10em + 20vw);
  }
}
</style>