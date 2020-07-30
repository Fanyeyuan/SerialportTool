<template>
    <div class="label" :style="borderThick">
        <p :style="labelPos">{{value}}</p>
        <div :style="contentPos">
            <slot/>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class MyLabel extends Vue {
    @Prop({ required: true, type: String }) private readonly value!: string
    @Prop({ default: 'left', type: String }) private readonly direction!: string
    @Prop({ default: 10, type: Number }) private readonly distance!: number
    @Prop({ default: 1, type: Number }) private readonly thick!: number
    @Prop({ default: 12, type: Number }) private readonly size!: number

    get borderThick () {
      return {
        'border-width': `${this.thick}px`
      }
    }

    get labelPos () {
      let style: {} = {}
      switch (this.direction) {
        case 'left':
          {
            style = {
                padding: `0 ${this.size/2}px`,
                'font-size': `${this.size}px`,
              top: `${-this.size/2 - this.thick}px`,
              left: `${this.distance}px`
            }
          }
          break
        case 'right':
          {
            style = {
                padding: `0 ${this.size/2}px`,
                'font-size': `${this.size}px`,
              top: `${-this.size/2 - this.thick}px`,
              right: `${this.distance}px`
            }
          }
          break
      }
      return style
    }

    get contentPos () {
        return {
            padding: `${this.size / 2 + this.thick}px 0`,
        }
    }
}
</script>

<style lang="scss" scoped>
.label{
    position: relative;
    border: solid 1px gray;
    border-radius: 3px;

    >p{
      padding: 0 5px;
      font-size: 24px;
      background-color: white;
      position: absolute;
      margin: 0;
      // top: -10px;
      // left: 0;
    }
    >div{
      width: 100%;
      height: 100%;
    }
}
</style>
