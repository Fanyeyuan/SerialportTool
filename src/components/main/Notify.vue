<template>
    <a-row class="notify" type='flex' :gutter='8' justify="space-around" >
      <a-col class="gutter-row" :span="7">
        <my-label value="" >
            {{port}}
        </my-label>
      </a-col>
      <a-col class="gutter-row" :span="7">
        <my-label value="" >
            {{info}}
        </my-label>
      </a-col>
      <a-col class="gutter-row" :span="7">
        <my-label value="" >
            {{time}}
        </my-label>
      </a-col>
    </a-row>
</template>

<script lang="ts">
import { Component, Vue, Emit, Prop } from 'vue-property-decorator'
import MyLabel from '@/components/common/MyLabel.vue'

@Component({
  components: {
    MyLabel
  }
})
export default class Notify extends Vue {
    private time:string = ''
    @Prop({required: true, type: String}) private port!:string
    @Prop({required: true, type: String}) private info!:string

    private timeHandle:NodeJS.Timeout =setInterval(()=>{},1000)

    private getTimes(){
        let data = new Date()
        return `${data.getFullYear()}-${data.getMonth()}-${data.getDay()} ${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`
    }
    
    private mounted(){
      clearInterval(this.timeHandle)
      this.timeHandle = setInterval(()=>{
          this.time = this.getTimes()
          // console.log(this.time)
      }, 1000)
    }
}
</script>

<style lang="scss" scoped>
.notify{
    width: 100%;
    padding-top: 10px;
    box-sizing: border-box;
.gutter-example >>> .ant-row > div {
  background: transparent;
  border: 0;
}
}
</style>