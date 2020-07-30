import serial from 'serialport'
import InterByteTimeout from '@serialport/parser-inter-byte-timeout';

//  const serial = require('serialport')

let port: serial

//支持
//1.  'reciev'=> fun()
let onEvent = new Map<string, Function>()


export function open(com: string, options?: serial.OpenOptions) {
    return new Promise((resolve, reject) => {
        port = new serial(com, options, (err) => {
            if (err) { // 打开错误
              reject(err);
            } else {
                const parser = port.pipe(
                    new InterByteTimeout({
                        interval: 50
                    })
                )

                resolve();

                parser.on('data', (data: any) => {
                    console.log(data)
                    const fun = onEvent.get('receive')
                    !!fun && fun(data)
                })
            }
        })
    })
}

export function getSerialPort() {
  return port
}

export function getComList() {
  return serial.list()
}

// 关闭当前串口
export function close() {
  if (port !== undefined) {
    port.close();
    // port = undefined;
  }
}

// 修改当前串口参数
export function update(options: serial.OpenOptions) {
  if (port !== undefined) {
    port.update(options)
  }
}

// 串口是否开启
export function isOpen() {
    if (port !== undefined) {
        return port.isOpen;
    }
    return false;
}

export function send(data: number[]){
    console.log(data)
    if(isOpen()){
        port.write(data)
    }
}

export function on(event: string, callback: Function){
  onEvent.set(event, callback)
}
