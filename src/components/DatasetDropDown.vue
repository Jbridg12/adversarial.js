<template>
  <div class="dropdown">
    <button class="dropdown-button dropdown-toggle" type="button" id="select-dataset" data-bs-toggle="dropdown" aria-expanded="false">
      {{key}}
    </button>
      <ul class="dropdown-menu" aria-labelledby="select-dataset">
        <li v-for="option in options" :key="option.key" :value="option.value">
          <a class="dropdown-item" @click="onClick(option.value); key = option.key; value = option.value" href="javascript: void(0)">{{option.key}}</a>
        </li>
      </ul>
  </div>
</template>
  
<script>
import {changeDataset} from "../../public/js/intro.js"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"
export default {
  name: 'ModelDropDown',
  id: 'select-dataset',
  props: {
    description: String,
  },
  data: () => ({
    options: [
      { key: "MNIST (digit recognition)", value: 'mnist' },
      { key: "Fashion-MNIST (articles of clothing)", value: 'fmnist' }, 
      { key: "CIFAR-10 (object recognition, small)", value: 'cifar' }, 
      { key: "ImageNet (object recognition, large)", value: 'imagenet'}
      ],
    key: "Select Dataset",
    value: "mnist",
  }),
  methods: {
	onClick(value){
		changeDataset(value)
    this.$emit('changeDataset', value)
	},
  }
}  
</script>

<style>
.dropdown-button {
background-color: #FFFFFF;
color: #000000;
font-family: "Raleway";
font-size: calc(13px + .2vw);
width: 33vmin;
height: 8vh;
box-shadow: 1px 2px 4px #cecece;
border-radius: .3em;
border: 0;
text-align: left;
white-space: normal;
word-wrap: break-word;
}

.dropdown-toggle::after {
  float: right !important;
  vertical-align: middle !important;
}

@media (max-width: 600px) {
  .dropdown-button {
    width: calc(10em + 20vw);
  }
}
</style>