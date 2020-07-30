<template>
    <my-label :value="value" >
        <a-row class="freq" type='flex' align="middle" justify="center" >
            <a-col :span="21">
                <a-tag color="#2db7f5" v-for="(value, index) in freq" :key="index">
                    {{value}} Hz
                </a-tag>
            </a-col>
            <a-col :span="3">
                <a-button type="primary" :loading="false" @click="onReadFreqClick">
                    读频率
                </a-button>
            </a-col>
        </a-row>
    </my-label>
</template>

<script lang="ts">
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'
import MyLabel from '@/components/common/MyLabel.vue'

@Component({
  components: {
    MyLabel
  }
})
export default class ReadFreq extends Vue{
  private value = '频率'

//   @Prop({ default: 10, type: Number }) private max!:number
  @Prop({ required: true, type: Array }) private freq!:number[]

 @Emit('freq-read-click')
 private onReadFreqClick(){}
}
</script>

<style lang="scss" scoped>
.freq{
    width: 100%;
    height: 100%;
}
</style>