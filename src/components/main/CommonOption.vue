<template>
    <my-label :value="value" >
      <div class="option">
        <my-label class="label" :value="item.name" v-for="(item, index) in obj" :key="index">
            <div class="element">
                <a-radio-group v-model="item.value" @change="onChange(item)">
                    <a-radio value="on">
                        开
                    </a-radio>
                    <a-radio value="off">
                        关
                    </a-radio>
                </a-radio-group>
            </div>
        </my-label>
        <my-label class="label" value="上传时间间隔">
            <div class="interval">
                <a-input placeholder="请输入上传时间间隔" allow-clear v-model="interval" suffix="s"/>
                <a-button type="primary" :loading="false" @click="onWriteIntervalClick(interval)">
                    写入
                </a-button>
            </div>
        </my-label>
        <my-label class="label" value="当前系数">
            <div class="interval">
                <a-select v-model="currentCoef" size="small">
                    <a-select-option :value="index" v-for="(num,index) in 5" :key="index">
                        {{`第${num}套参数`}}
                    </a-select-option>
                </a-select>
                <a-button type="primary" :loading="false" @click="onWriteCurrentClick(currentCoef)">
                    写入
                </a-button>
            </div>
        </my-label>
        <a-button type="primary" :loading="false" @click="onReadStatusClick">
            读工作状态
        </a-button>
      </div>
    </my-label>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Emit } from 'vue-property-decorator'
import MyLabel from '@/components/common/MyLabel.vue'

import {opObjInterface} from "@/app/types"

@Component({
  components: {
    MyLabel
  }
})
export default class BaseOption extends Vue{
  private value = '操作'
  @PropSync('interv',{ required: true, type: String }) private interval!: string
  @PropSync('option',{ required: true, type: Array }) private obj!: []
  @PropSync('current',{ required: true, type: Number }) private currentCoef!: number

//   @PropSync('addr',{ required: true, type: Number }) address!: number
//   @PropSync('id',{ required: true, type: Number }) identity!: number

    @Emit('common-change-status')
    private onChange(item:opObjInterface){
        // console.log(item)
        // return item
    }

    @Emit('common-write-interval')
    private onWriteIntervalClick(interval:string){
        // console.log(interval)
        // return interval
    }

    @Emit('common-write-current')
    private onWriteCurrentClick(current:number){
        // console.log(current)
        // return current
    }

    @Emit('common-read-status')
  private onReadStatusClick(){}
}
</script>

<style lang="scss" scoped>
.option{
    width: 100%;
    padding: 3px 3px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    
    .label{
        margin: 8px 0;
    }
    .element{
        padding: 2px;
    }
    .interval{
        display: flex;
        justify-content: space-around;
        align-items: center;
        padding: 2px 10px;
    }
}
</style>