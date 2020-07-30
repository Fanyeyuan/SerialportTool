<template>
    <my-label :value="value" >
      <div class="serial">
        <div>
          <span>串口号: </span>
          <a-select :default-value="portName" style="width: 120px" @change="handlePortChange">
            <a-select-option :value="value" v-for="(value,index) in portNames" :key="index">
              {{value}}
            </a-select-option>
          </a-select>
        </div>
        <div>
          <span>波特率: </span>
          <a-select :default-value="baudRate" style="width: 120px" @change="handleRateChange">
            <a-select-option :value="value" v-for="(value,index) in baudRates" :key="index">
              {{value}}
            </a-select-option>
          </a-select>
        </div>
        <div>
          <a-icon class="open" type="check-circle" v-if="isOpen"/>
          <a-icon class="close" type="close-circle" v-else/>
        </div>
        <div>
          <a-button type="primary" :loading="load" @click="onOpenPortClick">
            <!-- {{打开}} -->
            {{isOpen ? '关闭' : '打开'}}
          </a-button>
        </div>
      </div>
    </my-label>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit, Watch } from 'vue-property-decorator'
import MyLabel from '@/components/common/MyLabel.vue'
// import serial from '@/app/serial'

@Component({
  components: {
    MyLabel
  }
})
export default class SerialPort extends Vue {
  @Prop({ required: true, type: Boolean }) private isOpen!: boolean
  @Prop({ required: true, type: Array }) private portNames!: string[]

  @Prop({ required: true, type: String }) private portName!: string
  @Prop({ required: true, type: Number }) private baudRate!: number

  private load: Boolean = false

  private value = '串口'
  private baudRates: number[] = [115200, 57600, 38400, 19200, 9600, 4800, 2400, 1800, 1200, 600, 300, 200, 150, 134, 110, 75, 50]

  @Emit('serialport-port-change')
  private handlePortChange (port: string) {
    // console.log(e)
    // this.portName = port
    return port
  }

  @Emit('serialport-baud-change')
  private handleRateChange (rate: number) {
    // this.baudRate = rate
    return rate
  }

  @Emit('serialport-open-click')
  private onOpenPortClick () {
    this.load = true
    setTimeout(()=>{
      this.load = false
    }, 3000)
    return !this.isOpen
  }

  @Watch('isOpen', { immediate: true, deep: false })
  private loading(value: boolean){
    console.log(this.isOpen, value)
    this.load = false;
  }

  mounted () {
    // this.portName = this.portNames[0] ?? ''
  }
}
</script>

<style lang="scss" scoped>
.serial{
  display: flex;
  justify-content: space-around;
  // padding: 10px 3px;

  .close{
    color: red;
  }
  .open{
    color: green;
  }
}
</style>
