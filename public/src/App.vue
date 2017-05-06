<template>
  <div id="app">
    <h1>JPG.Cool</h1>
    <div>
      <h2>Enter a search:</h2>
      <input type="text" placeholder="fish gif or netflix cat" v-model="query" v-on:keyup.enter="followURL()"/>
      <br />
      <h4>Get a URL: <a :href="url" target="_blank">{{url}}</a></h4>
      <br />
      <a class="subtle" href="https://abe.today/share/twitter">by @abeisgreat</a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      query: "",
      url: "jpg.cool"
    }
  },
  methods: {
    followURL() {
        document.location = this.url;
    }
  },
  watch: {
    query (query) {
      let url = "https://jpg.cool/"
      url += query.split(" ").join(".");
      this.url = url;
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

h2 {
  font-weight: normal;

}

input {
  padding: 10px;
  width: 250px;
}

a {
  color: #42b983;

  &.subtle {
    color: #999;
    text-decoration: none;
    padding: 4px 4px 6px 4px;
    border-top: 1px solid #999;
  }
}
</style>
