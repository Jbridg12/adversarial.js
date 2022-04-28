<template>
  <div v-if="attackDropdown">
    <button class="dropdown-button dropdown-toggle" type="button" id="select-attack" data-bs-toggle="dropdown" aria-expanded="false" value="">
      {{key}}
    </button>
      <ul class="dropdown-menu" aria-labelledby="select-attack">
        <li v-for="option in attackDropdown.options" :key="option.key">
          <a class="dropdown-item" @click="onClick(option.value); key = option.key; value = option.value" href="javascript: void(0)">{{option.key}}</a>
        </li>
      </ul>
  </div>
</template>

<script>
import {changeAttack} from "../../public/js/intro.js"
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap"
export default {
  name: 'AttackDropDown',
  id: 'select-attack',
  props: {
    description: String,
    newDataset: String,
  },
  data: () => ({
    datasets: [
      {id: 'mnist', 
        options: [
          { key: "Jacobian-based Saliency Map Attack", value: 'jsma' },
          { key: "Jacobian-based Saliency Map Attack 1-Pixel (stronger)", value: 'jsmaOnePixel' },
          { key: "Basic Iterative Method (stronger)", value: 'bimTargeted' }, 
          { key: "Fast Gradient Sign Method (weak)", value: 'fgsmTargeted'}
        ]
      },
      {id: 'fmnist',
        options: [
          { key: "Jacobian-based Saliency Map Attack", value: 'jsma' },
          { key: "Jacobian-based Saliency Map Attack 1-Pixel (stronger)", value: 'jsmaOnePixel' },
          { key: "Basic Iterative Method (stronger)", value: 'bimTargeted' }, 
          { key: "Fast Gradient Sign Method (weak)", value: 'fgsmTargeted'}
        ]
      },
      {id: 'cifar',
        options: [
          { key: "Jacobian-based Saliency Map Attack", value: 'jsma' },
          { key: "Jacobian-based Saliency Map Attack 1-Pixel (stronger)", value: 'jsmaOnePixel' },
          { key: "Basic Iterative Method (stronger)", value: 'bimTargeted' }, 
          { key: "Fast Gradient Sign Method (weak)", value: 'fgsmTargeted'}
        ]
      },
      {id: 'imagenet',
        options: [
          { key: "Jacobian-based Saliency Map Attack 1-Pixel (stronger)", value: 'jsmaOnePixel' },
          { key: "Basic Iterative Method (stronger)", value: 'bimTargeted' }, 
          { key: "Fast Gradient Sign Method (weak)", value: 'fgsmTargeted'}
        ]
      }
    ],
    key: "Select Attack",
    value: ""
  }),
  methods: {
	onClick(value){
    this.$root.$emit('dropdownChange', 0)
		changeAttack(value)
	}
  },
  computed: {
    attackDropdown() {
      return (this.newDataset)
        ? this.datasets.find(x => x.id === this.newDataset)
        : this.datasets.find(x => x.id === "mnist")
    }
  },
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