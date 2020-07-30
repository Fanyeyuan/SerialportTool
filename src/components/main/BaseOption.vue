<template>
    <my-label :value="value" >
      <div class="option">
        <my-label class="label" value="" >
            <div class="element">
              <div>
                <a-button type="primary" :loading="false" @click="onReadAddressClick">
                    读地址
                </a-button>
                <a-button type="primary" :loading="false" @click="onWriteAddressClick">
                    写地址
                </a-button>
                </div>
                <div>
                    <a-input placeholder="请输入设备地址" allow-clear v-model="address" />
                </div>
            </div>
        </my-label>
        <my-label value="" >
            <div class="element">
              <div>
                <a-button type="primary" :loading="false" @click="onReadIdClick">
                    读ID
                </a-button>
                <a-button type="primary" :loading="false" @click="onWriteIdClick">
                    写ID
                </a-button>
                </div>
                <div>
                    <a-input placeholder="请输入设备ID" allow-clear v-model="identity" />
                </div>
            </div>
        </my-label>
      </div>
    </my-label>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Emit } from 'vue-property-decorator'
import MyLabel from '@/components/common/MyLabel.vue'

@Component({
  components: {
    MyLabel
  }
})
export default class BaseOption extends Vue{
  private value = '基本操作'

  @PropSync('addr',{ required: true, type: String }) address!: String
  @PropSync('id',{ required: true, type: String }) identity!: String

    @Emit('option-read-address-click')
  private onReadAddressClick(){}

    @Emit('option-write-address-click')
  private onWriteAddressClick(){
    return this.address
  }

    @Emit('option-read-id-click')
  private onReadIdClick(){}

    @Emit('option-write-id-click')
  private onWriteIdClick(){
    return this.identity
  }
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
        // display: flex;
        // justify-content: center;
        // flex-wrap: wrap;

        >div {
            display: flex;
            justify-content: space-around;
            padding: 2px 10px;
        }
    }
}
</style>