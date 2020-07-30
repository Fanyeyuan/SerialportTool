<template>
    <my-label :value="value">
      <div class="coeff"  v-on:keyup.ctrl.86="onClick" v-if="data.length">
        <!-- :rowClassName="setRowClassName"
        :custom-row="customRow" -->
        <a-table 
        size="small" 
        bordered 
        :columns="columns" 
        :data-source="data" 
        :pagination="false" 
        :row-selection="rowSelection" 
        :key="selections.length">
          <template
          v-for="col in ['coef', 'power', 'air', 'water']"
          :slot="col"
          slot-scope="text, record, index"
          >
          <div :key="col" @dblclick="ondblclick(record.key)">
              <a-input
              v-if="record.editable"
              style="margin: -5px 0"
              :value="text"
              @change="e => handleChange(e.target.value, record.key, col)"
              />
              <template v-else>
              {{ text }}
              </template>
          </div>
          </template>
          <template slot="operation" slot-scope="text, record, index">
          <div class="editable-row-operations">
            <span v-if="record.editable">
            <a @click="() => save(record.key)"><a-icon type="check" /></a>
            <a-popconfirm title="Sure to cancel?" @confirm="() => cancel(record.key)">
                <a><a-icon type="close" /></a>
            </a-popconfirm>
            </span>
            <span v-else>
            <a :disabled="editingKey !== ''" @click="() => edit(record.key)"><a-icon type="edit" /></a>
            </span>
          </div>
          </template>
        </a-table>
        <div class="button">
          <a-select v-model="coefNum" size="small">
              <a-select-option :value="-1">
                  {{`旧版参数`}}
              </a-select-option>
              <a-select-option :value="index" v-for="(num,index) in 5" :key="index">
                  {{`第${num}套参数`}}
              </a-select-option>
          </a-select>
          <a-button type="primary" size="small" :loading="false" @click="onReadCoefClick(coefNum)">
              读取
          </a-button>
          <a-button type="primary" size="small"  :loading="false" @click="onWriteCoefClick(coefNum)">
              写入
          </a-button>
          <a-button type="primary" size="small"  :loading="false" @click="onWriteLayerClick(maxLayer)">
              写最大层数
          </a-button>
          <a-button type="primary" size="small"  :loading="false" @click="onWriteClearClick(maxLayer)">
              显示系数清0
          </a-button>
        </div>
      </div>
    </my-label>
</template>

<script lang="ts">
import { Component, Vue, Emit, PropSync, Watch } from 'vue-property-decorator'
import MyLabel from '@/components/common/MyLabel.vue'

import {CoeffTableDataInterface} from "@/app/types"

interface CoeffTableTitleInterface{
    title: string,
    dataIndex: string,
    scopedSlots: { customRender: string },
    width?: string,
    align?: string,
}

@Component({
  components: {
    MyLabel
  }
})
export default class Coeff extends Vue {
  @PropSync('coeff', {required: true, type: Array}) private data!: CoeffTableDataInterface[]
  @PropSync('max',{ required: true, type: Number }) private maxLayer!: number
  private coefNum: number = -1
  private selectedRowId: string = ''
  private selections: string[]= []

  private value = '写土湿系数'
  private columns:CoeffTableTitleInterface[] = [{
    title: '系数',
    dataIndex: 'coef',
    align: 'center',
    width: '20%',
    scopedSlots: { customRender: 'coef' },
  },{
    title: '幂',
    dataIndex: 'power',
    align: 'center',
    width: '20%',
    scopedSlots: { customRender: 'power' },
  },{
    title: '空气值',
    dataIndex: 'air',
    align: 'center',
    width: '20%',
    scopedSlots: { customRender: 'air' },
  },{
    title: '水中值',
    dataIndex: 'water',
    align: 'center',
    width: '20%',
    scopedSlots: { customRender: 'water' },
  }, {
    title: '操作',
    align: 'center',
    width: '20%',
    dataIndex: 'operation',
    scopedSlots: { customRender: 'operation' }
  }]
  private editingKey:string=""
  // private cacheData:any = []

  handleChange(value:string, key:string, column:string) {
    const newData: CoeffTableDataInterface[] = [...this.data];
    const target:any = newData.filter(item => key === item.key)[0];
    if (target) {
      target[column] = value;
      this.data = newData;
    }
  }

  edit(key:string) {
    const newData = [...this.data];
    const target:any = newData.filter(item => key === item.key)[0];
    this.editingKey = key;

    if (target) {
      // target.editable = true;
      this.$set(target, 'editable', true)
      this.data = newData;
    console.log(this.data, target, this.editingKey)
    }
  }
  save(key:string) {
      const newData = [...this.data];
      // const newCacheData = [...this.cacheData];
      const target:any = newData.filter(item => key === item.key)[0];
      // const targetCache = newCacheData.filter(item => key === item.key)[0];
      if (target) {
      // delete target.editable;
      this.$delete(target, 'editable', )
      this.data = newData;
      Object.assign(target);
      // this.cacheData = newCacheData;
      }
      this.editingKey = '';
  }
  cancel(key:string) {
    const newData = [...this.data];
    const target:any = newData.filter(item => key === item.key)[0];
    this.editingKey = '';
    if (target) {
      // Object.assign(target, this.cacheData.filter(item => key === item.key)[0]);
      // delete target.editable;
      this.$delete(target, 'editable', )
      this.data = newData;
    }
  }

  get rowSelection() {
    return {
      selectedRowKeys:this.selections,
      onChange: (selectedRowKeys:any, selectedRows:any) => {
        // console.log(this.selections)
        // selectedRows.pop()
        // this.selections = selectedRowKeys
        // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
        // this.selections.pop()
      },
      onSelect: (selected:any, selectedRows:any, changeRows:any) => {
        // selectedRowKeys.pop()
        // console.log('selected:', selected,'selectedRowKeys:', selectedRows, 'selectedRows:' ,  changeRows);
        // const flag = this.selections.every((val:CoeffTableDataInterface) => val.key === selected.key)
        // if(flag )
        if(selectedRows){
          if(Number(selected.key) === Number(this.selections.length) ){
            this.selections.push(selected.key)
            this.maxLayer ++;
          } else {
            this.$message.warn('只可以选择最后一层的下一层')
          }
        } else {
          if(Number(selected.key) === Number(this.selections.length)-1 ){
            this.selections.pop()
            this.maxLayer --;
          } else {
            this.$message.warn('只可以取消最后一层')
          }
        }
      },
      getCheckboxProps: (record:any) => ({
        props: {
          // disabled: Number(record.key) >= this.maxLayer, // Column configuration not to be checked
          // defaultChecked: Number(record.key) < this.maxLayer, 
          name: record.key,
        },
      }),
    };
  }

  // private customRow(record: any) {
  //   return {
  //     on: {
  //       click: (event: any) => {
  //         console.log(event, record)
  //         this.selectedRowId = record.key
  //       },
  //     }
  //   }
  // }
  // private setRowClassName(record:any){
  //   return record.key === this.selectedRowId ? 'clickRowStyle' : '';
  // }

  // private onClick(){
  //   console.log('1111')
  // }

  private ondblclick(key:string){
    if(Number(key) < this.maxLayer){
      if(this.editingKey === '')
        this.edit(key)
    } else {
      this.$message.warn('请先勾选')
    }
  }

  @Emit('read-coef-click')
  private onReadCoefClick(num:number){}
  @Emit('write-coef-click')
  private onWriteCoefClick(num:number){
      // console.log(this.data)
      return this.data
  }
  @Emit('write-layer-click')
  private onWriteLayerClick(layer:number){}
  @Emit('write-clear-click')
  private onWriteClearClick(layer:number){}

  @Watch('max', { immediate: true, deep: true })
  onMaxLayerChange(val:number){
    this.selections = []
    for (let index = 0; index < val; index++) {
      this.selections.push(index.toString())
    }
    console.log(this.selections)
    // this.selections
  }
}
</script>

<style lang="scss" scoped>
.coeff{
    padding: 5px;
    .button{
        margin-top: 5px;
        >button{
            margin-left: 20px;
        }
    }
}
</style>