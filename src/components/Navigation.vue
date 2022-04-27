<template>
  <div class="banner">
    <div class="headers title">Adversarial Education - {{ pageTitle }}</div>
    <div class="links">
      <a href="../../public/index.html" class="nav">Home</a>
      <a href="https://github.com/Jbridg12/adversarial.js" target="_blank" class="nav">GitHub</a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Navigation',
  props: {
    pageTitle: String
  }
}
</script>

<style>
.banner {
  display: flex;
  align-content: center;
  align-items: center;
  width: 100%;
  height: 12vmin;
  background-color: #D3DAE4;
}

.headers {
  display: inline-block;
  color: #333333;
  font-weight: bolder;
  font-family: "Raleway-italic";
  font-size: calc(12px + 2vw);
  margin-right: 1vw;
}

.title {
  margin-left: 3vw;
}

.links {
  margin-left: auto;
}

a.nav {
  color: #333333;
  font-family: "Montserrat";
  font-size: calc(12px + .2vw);
  text-decoration: none;
  margin-right: 2vw;
  display: inline-block; 
}

a.nav:hover {
  color: #0C68BE;
}

a.nav:active {
  font-weight: bold;
}
</style>

