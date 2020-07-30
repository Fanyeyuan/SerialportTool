
//commonOption 相关状态 接口
export interface opObjInterface{
    name:string, 
    value:string,
    fun:(state:boolean) => void
}

//coeff 系数类型 接口
export interface CoeffTableDataInterface{
    key: string,
    coef: string,
    power: string,
    air: string,
    water: string
}

//home 通讯提示信息 接口
export interface HomeNotifyInfoInterface{
    op: string, 
    target:string, 
    result: string, 
    content?:any
}