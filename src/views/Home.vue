<template>
  <div>
    <!-- <a-modal
      title="Title"
      :visible="visible"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <p>{{ ModalText }}</p>
    </a-modal> -->
    <div class="home">
        <serial-port 
        class="port" 
        :isOpen="isOpen" 
        :portNames="comList" 
        :portName="com" 
        :baudRate="baud" 
        @serialport-open-click="onSerailportOpenClick"
        @serialport-baud-change="onSerailportBaudChange"
        @serialport-port-change="onSerailportPortChange"></serial-port>
        <base-option 
        class="base" 
        :addr.sync="addr" 
        :id.sync="id" 
        @option-read-address-click="readDeviceAddress"
        @option-write-address-click="writeDeviceAddress"
        @option-read-id-click="readDeviceId"
        @option-write-id-click="writeDeviceId"></base-option>
        <common-option 
        class="common"
        :interv.sync="interval"
        :option.sync="obj"
        :current.sync="currentCoef"
        @common-change-status="changgeStatus"
        @common-write-interval="writeInterval"
        @common-read-status="readDeviceConf"
        @common-write-current="writeCurrentCoeff"
        ></common-option>
        <Coeff 
        class="coeff"
        :coeff="coeff"
        :max.sync="maxLayer"
        @read-coef-click="readDeviceCoeff"
        @write-coef-click="writeDeviceCoeff"
        @write-layer-click="writeMaxLayer"
        @write-clear-click="clearDisplayCoeff"
        ></Coeff>
        <read-freq
        class="freq"
        :freq="freqs"
        @freq-read-click="readDeviceFreq"></read-freq>
    </div>
    <notify 
    :port="getPortInfo"
    :info="getCommInfo"></notify>
  </div>
</template>

<script lang="ts">
// @ is an alias to /src
const {clipboard, remote} = require('electron')
import { Component, Vue } from 'vue-property-decorator'
import SerialPort from '@/components/main/SerialPort.vue'
import BaseOption from '@/components/main/BaseOption.vue'
import CommonOption from '@/components/main/CommonOption.vue'
import Coeff from '@/components/main/Coeff.vue'
import ReadFreq from '@/components/main/ReadFreq.vue'

import Notify from '@/components/main/Notify.vue'
import * as serial from "@/app/serial"
import {crc16modbus} from 'crc';

import {opObjInterface, CoeffTableDataInterface, HomeNotifyInfoInterface} from "@/app/types"

@Component({
  components: {
    SerialPort,
    BaseOption,
    CommonOption,
    Coeff,
    Notify,
    ReadFreq
  }
})
export default class Home extends Vue {
  private addr: string = '200'
  private id: string = '15061101'

  private comList: string[] = []
  private com: string = ''
  private baud: number = 9600
  private isOpen: boolean = false
  private info:HomeNotifyInfoInterface ={op:'', target:'', result:''}

  private interval: string = '600'
  private currentCoef: number = 0
  private maxLayer: number = 4
  private obj:Array<opObjInterface> = [{
      name: '低功耗模式',
      value: 'on',
      fun: this.writeLowPowerMode
  },{
      name: '打印模式',
      value: 'off',
      fun: this.writeDebugMode
  },{
      name: '主动上传模式',
      value: 'on',
      fun: this.writeDataMode
  }]

  private coeff: CoeffTableDataInterface[] = []
  private freqs: number[] = []

  //全局提示框
  private visible:boolean = true

  private timeoutHandle:NodeJS.Timeout|null = null;
  private defaultAddr: number = 0
  private defaultTimeOut: number = 5000

  private onSerailportOpenClick(state: boolean){
    // this.isOpen = state
    // console.log(this.isOpen, state)
    if(state){
      let timeHand = setTimeout(()=>{
        if(!this.isOpen){
          this.$message.error('操作超时')
        }
      }, 3000)
      serial.open(this.com, {
        baudRate: this.baud,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        rtscts: false
      }).then((data:any) => {
        this.isOpen = true
        // this.receiveHandle(data)
        serial.on('receive', this.receiveHandle)
      })
      .catch((err:any) => {
        this.isOpen= false
        clearTimeout(timeHand)
        console.log(err,timeHand)
        this.$message.error(err.toString())
      })
    } else {
      serial.close()
      this.isOpen = false
    }
  }
  private onSerailportBaudChange(baud: number){
    this.baud = baud
    this.serialportChange({
        baudRate: this.baud,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        rtscts: false
      })
  }
  private onSerailportPortChange(com: string){
    this.com = com
    this.serialportChange({
        baudRate: this.baud,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        rtscts: false
      })
  }
  private serialportChange(option: any){
    if(serial.isOpen()){
      serial.close()
      serial.open(this.com, {
        baudRate: this.baud,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        rtscts: false
      }).then(() => {
        this.isOpen = true
      })
      .catch((err:any) => console.log)
    }
  }
  private changgeStatus(item: opObjInterface){
    !!item && item.fun(item.value==="on"? true: false)
  }
  private clearDisplayCoeff(){
    for (const coef of this.coeff) {
      this.$set(coef, 'coef', '0')
      this.$set(coef, 'power', '0')
      this.$set(coef, 'air', '0')
      this.$set(coef, 'water', '0')
    }
  }

  //通讯提示信息
  private notify( info:HomeNotifyInfoInterface ){
    this.info=info

    if(this.timeoutHandle){
      clearTimeout(this.timeoutHandle)
    }
    this.timeoutHandle = setTimeout(()=>{this.info.result="超时"}, this.defaultTimeOut)
  }
  //清空通讯提示信息
  private clearNotifyInfo(){
      this.$set(this.info, 'op', '')
      this.$set(this.info, 'target', '')
      this.$set(this.info, 'result', '')
      this.$set(this.info, 'content', '')

      if(!!this.timeoutHandle){
        clearTimeout(this.timeoutHandle)
        this.timeoutHandle = null
      }
  }
  //写操作时，提示信息
  private confimWriteCmd(content: string, title:string = 'Confirm'){
    return new Promise( (resolve, reject) => {
      this.$confirm({
        title,
        content: `是否确定${content}?`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          resolve(true)
        },
        onCancel: () => {
          resolve(false)
        }
      })
    })
  }
  //当前串口的发送函数
  private async send(data: number[], timeout: number = 10){
    if(!serial.isOpen()){
      this.$message.error('请先打开串口！！')
      
      this.clearNotifyInfo()

      return
    }

    if(this.info.op.indexOf('写') >= 0){
      const flag = await this.confimWriteCmd(this.info.op+this.info.target)
      if(!flag){
        return
      }
    }

    const crc = crc16modbus(Buffer.of(...data))
    data.push(crc & 0x00ff)
    data.push(crc >> 8)
    serial.send(data)
  }
  //读当前采集频率
  private readDeviceFreq(){
    const data = [this.defaultAddr, 0x03, 0x00, 0x40]
    this.notify({
      op: '读',
      target: '频率',
      result: '中……'
    })
    this.send(data)
  }
  //读设备地址
  private readDeviceAddress(){
    const data = [this.defaultAddr, 0x20]

    this.notify({
      op: '读',
      target: '地址',
      result: '中……'
    })

    this.send(data)
  }
  //写设备地址
  private writeDeviceAddress(add:string){
    const temp = Number(add)
    const data = [this.defaultAddr, 0x10, temp]
    this.notify({
      op: '写',
      target: '地址',
      result: '中……',
      content: add
    })
    this.send(data)
  }
  //读设备编号
  private readDeviceId(){
    const data = [this.defaultAddr, 0x50]
    this.notify({
      op: '读',
      target: '地址',
      result: '中……'
    })
    this.send(data)
  }
  //写设备编号
  private writeDeviceId(id:string){
    const ids = Number(id)
    const data = [this.defaultAddr, 0x60, ids/1000000, ids/10000%100, ids/100%100, ids%100]

    this.notify({
      op: '写',
      target: 'ID',
      result: '中……',
      content: id
    })
    this.send(data)
  }
  //读设备配置
  private readDeviceConf(){
    const data = [this.defaultAddr, 0x40]
    
    this.notify({
      op: '读',
      target: '配置',
      result: '中……'
    })
    this.send(data)
  }
  //写数据上传模式
  private writeDataMode(mode:boolean){
    const data = [this.defaultAddr, 0x92, 0, Number(mode)]
    
    this.notify({
      op: '写',
      target: '上传模式',
      result: '中……',
      content: mode?"被动": "主动"
    })
    this.send(data)
  }
  //写数据上传时间间隔
  private writeInterval(time:string){
    const temp = Number(time)
    const data = [this.defaultAddr, 0xA0, temp>>8, temp&0x00ff]
    
    this.notify({
      op: '写',
      target: '时间间隔',
      result: '中……',
      content: time
    })
    this.send(data)
  }
  //写当前使用系数
  private writeCurrentCoeff(num: number){
    const data = [this.defaultAddr, 0xA1, num]
    
    this.notify({
      op: '写',
      target: '当前系数',
      result: '中……',
      content: num
    })
    this.send(data)
  }
  //写最大层数
  private writeMaxLayer(num: number){
    const data = [this.defaultAddr, 0xA2, num]
    
    this.notify({
      op: '写',
      target: '最大层数',
      result: '中……',
      content: num
    })
    this.send(data)
  }
  //转换调试信息
  private writeDebugMode(mode:boolean){
    const data = [this.defaultAddr, 0x80, Number(mode)]
    
    this.notify({
      op: '写',
      target: '调试模式',
      result: '中……',
      content: mode?"调试": "正常"
    })
    this.send(data)
  }
  //低功耗模式
  private writeLowPowerMode(mode:boolean){
    const data = [this.defaultAddr, 0x30, Number(mode)]
    
    this.notify({
      op: '写',
      target: '低功耗模式',
      result: '中……',
      content: mode?"低功耗": "正常"
    })
    this.send(data)
  }
  //写入系数
  private writeDeviceCoeff(coeff:any, num:number){
    console.log(coeff)
    let temp:number[] = []
    coeff.forEach((value:CoeffTableDataInterface) => {
      temp.push(Number(value.coef))
      temp.push(Number(value.power)) 
      temp.push(Number(value.air)) 
      temp.push(Number(value.water))
    })
    const data = num >= 0 ? [this.defaultAddr,0x70, num, 80] : [this.defaultAddr,0x71, 80]
    temp.forEach(val => {
      data.push(val>>8)
      data.push(val&0xff)
    });
    
    this.notify({
      op: '写',
      target: '系数',
      result: '中……',
      content: num+1
    })
    this.send(data)
  }
  //读系数
  private readDeviceCoeff(num:number){
    const data = num >= 0 ? [this.defaultAddr, 0x90, num] : [this.defaultAddr, 0x91, 80]
    
    this.notify({
      op: '读',
      target: '系数',
      result: '中……',
      content: num+1
    })
    this.send(data)
  }
  //接受回调函数
  private receiveHandle(data:any){
    // console.log(data)
    if(!crc16modbus(data)){
      let flag: boolean = false       //数据配对成功
      switch(data[1]){
        case 0x03:{
          switch(data[3]){
            case 0x40:{
              flag = true
              this.freqs = []
              for (let index = 0; index < 10; index++) {
                this.freqs[index] = (data[4+index*2]<<8) + data[5+index*2]
              }
            }
              break;
            case 0x60:{
              flag = true
            }
              break;
            default:
              break;
          }
        }
        break;
        case 0x20:    //读地址
          this.addr = data[2].toString()

          flag = true
          break;
        case 0x10:
          console.log(data.byteLength === 5, typeof data , data.length)
          if(data.byteLength === 5){    //写地址
            flag = true
          }
        break;
        case 0x30:{   //写低功耗模式
          flag = true
        }
        break;
        case 0x40:{     //读参数
              const dataMode = this.obj.find(value => value.name === '主动上传模式')
              !!dataMode && (dataMode.value = data[2] ? 'off' : 'on')

              this.addr = data[3].toString()

              const lowpower = this.obj.find(value => value.name === '低功耗模式')
              !!lowpower && (lowpower.value = data[4] ? 'on' : 'off')

              this.interval = ((data[5] << 8) + data[6]).toString()

              const debugMode = this.obj.find(value => value.name === '打印模式')
              !!debugMode && (debugMode.value = data[7] ? 'on' : 'off')

              this.maxLayer = data[8]
              this.currentCoef = data[9]

              flag = true
            }
        break;
        case 0x50:{   //读ID 号
          const id = ((data[2]*100+data[3])*100 + data[4])*100 + data[5]
          this.id = id.toString()

          flag = true
        }
        break
        case 0x60:{   //写ID 号
          flag = true
        }
        break;
        case 0x70:{   //写系数
          flag = true
        }
        break;
        case 0x71:{   //写系数    旧版
          flag = true
        }
        break;
        case 0x80:{   //调试开关
          flag = true
        }
        break;
        case 0x90:{   //读系数    新版
          flag = true
        }
        // break;
        case 0x91:{   //读系数    旧版
          const size:number = data[2]>>3
          for (let index = 0; index < size; index++) {
            this.coeff[index].key = index.toString()
            this.coeff[index].coef = ((data[3+(index<<3)]<<8) | data[4+(index<<3)]).toString()
            this.coeff[index].power = ((data[5+(index<<3)])<<8 | data[6+(index<<3)]).toString()
            this.coeff[index].air = ((data[7+(index<<3)]<<8) | data[8+(index<<3)]).toString()
            this.coeff[index].water = ((data[9+(index<<3)]<<8) | data[10+(index<<3)]).toString()
          }
          flag = true
        }
        break;
        case 0x92:{   //修改工作模式
          flag = true
        }
        case 0xA0:{   //写上传时间间隔
          flag = true
        }
        case 0xA1:{   //写当前系数
          flag = true
        }
        case 0xA2:{   //写最大层数
          flag = true
        }
        break;
        default:
          break;
      }
      
      if(flag){
        this.info.result = '完成'
        if(!!this.timeoutHandle){
          clearTimeout(this.timeoutHandle)
          this.timeoutHandle = null
        }
      }
    } else {
      this.info.result = '校验错误'
    }
  }

  get getPortInfo(){
    return `${this.com} ${this.baud} `+ (this.isOpen?"已打开":"已关闭")
  }
  get getCommInfo(){
    return !this.info.op ? "u":this.info.op + this.info.target +(!this.info.content ? "": '('+ this.info.content +')')+ this.info.result
  }

  private async mounted(){
    let list = await serial.getComList()
    this.comList = list.map((val:any) => val.path)
    // this.com = this.comList.length ? this.comList[0] : ''

    //默认系数
    for (let i = 0; i < 10; i++) {
      this.coeff.push({
          key:i.toString(),
          coef:'0',
          power: '0',
          air:'0',
          water: '0'
      },);
    }

    console.log(this.comList, this.com, this.coeff)
  }

  private created(){
    remote.globalShortcut.register("CommandOrControl+V",()=>{
      var activename=document.activeElement; // 当前获取焦点的对象

      if(!!activename && activename.tagName === 'INPUT'){
        (<HTMLInputElement>activename).value = clipboard.readText()
      } else {
        //获取剪切板内容
        /**
         *  格式 1 2 3 4 \r\n5 6 7 8 \r\n
         */
        let clip = clipboard.readText().split(/\r\n/g)
        !clip[clip.length-1] && clip.pop()                      //删除最后多余 \r\n 导致的元素

        //以字符串分割，得到单个值
        let text = clip.map((value:string) => {
          return value.split(/\s/g)
        })
        text[text.length-1].length<4 && text.pop()              //删除最后多余的元素
        
        //判断每层是否都有四个元素
        let flag = text.every((val: string[]) => {
          return val.length === 4
        })

        if(!flag){
          this.$message.warning("粘贴内容格式不对！")
        }else if(text.length < this.maxLayer){                  //如果当前内容的层数小于最大层数
          this.$message.warning("粘贴内容层数不对！"+`最少${this.maxLayer}层`)
        }else {
          text.map((value:string[],index:number) => {
            this.$set(this.coeff[index], 'coef', value[0].slice(0,6))
            this.$set(this.coeff[index], 'power', value[1].slice(0,6))
            this.$set(this.coeff[index], 'air', value[2].slice(0,6))
            this.$set(this.coeff[index], 'water', value[3].slice(0,6))
          })
        }
      }
    })
  }

  private beforeDestroy(){
    remote.globalShortcut.unregisterAll()
  }
}
</script>

<style lang="scss" scope>
.home{
  width: 100%;
  // height: 100vh;
  display: grid;
  grid-template-columns: repeat(4, 24%);
  grid-template-rows: repeat(9, 50px);
  grid-row-gap: 10px;
  grid-column-gap: 1%;
  box-sizing: border-box;
  grid-template-areas:'sp sp sp bp'
                      'co co co bp'
                      'co co co bp'
                      'co co co bp'
                      'co co co op'
                      'co co co op'
                      'co co co op'
                      'co co co op'
                      'co co co op'
                      'fr fr fr op';

  .port{
    grid-area: sp;
  }
  .base{
    grid-area: bp;
  }
  .common{
    grid-area: op;
  }
  .coeff{
    grid-area: co
  }
  .freq{
    grid-area: fr
  }
}
</style>
