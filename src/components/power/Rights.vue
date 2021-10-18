<template>
    <div>
        <input type="text" v-model="firstName">
        <input type="text" v-model="lastName">
        <span>{{computedFullName}}</span>
        <span>{{computedFullName}}</span>
        <button @click="computedFullName">计算全名</button>
    </div>
</template>

<script>
export default {
  data () {
    return {
      firstName: '张',
      lastName: '万里',
      fullName: ''
    }
  },
  methods: {
  },
  computed: {
    computedFullName () {
      console.log('computedFullName')
      return this.firstName + this.lastName
    }
  }
}
</script>

<style lang="less" scoped>

</style>
