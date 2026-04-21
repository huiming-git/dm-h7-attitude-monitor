# Monitor 统一通讯协议 v1.0

本文档定义了 Monitor 上位机与嵌入式设备之间的通讯协议。任何设备只要按照此协议通过串口（USB CDC / UART）发送数据，即可接入 Monitor 进行实时姿态可视化。

## 1. 物理层

| 参数 | 默认值 | 说明 |
|------|--------|------|
| 接口 | USB CDC 虚拟串口 | 也支持物理 UART + USB 转串口 |
| 波特率 | 115200 | 上位机可选，设备端需匹配 |
| 数据位 | 8 | |
| 停止位 | 1 | |
| 校验位 | None | |
| 字节序 | Little-Endian | 所有多字节数据均为小端 |

## 2. 帧格式

所有数据以帧为单位传输，帧格式如下：

```
┌────────┬──────┬──────┬─────────────┬───────┐
│ Header │ Type │ Len  │   Payload   │ CRC16 │
│ 2 byte │ 1 B  │ 1 B  │   Len byte  │ 2 B   │
│ AA 55  │      │      │             │       │
└────────┴──────┴──────┴─────────────┴───────┘
```

| 字段 | 偏移 | 长度 | 说明 |
|------|------|------|------|
| Header | 0 | 2 | 固定 `0xAA 0x55`，用于帧同步 |
| Type | 2 | 1 | 帧类型，见下方定义 |
| Len | 3 | 1 | Payload 长度（字节数），不含 Header/Type/Len/CRC |
| Payload | 4 | Len | 数据内容，格式取决于 Type |
| CRC16 | 4+Len | 2 | 校验范围：Header ~ Payload（不含 CRC 自身），小端存储 |

**单帧最大长度：** 4 (头) + 255 (Payload) + 2 (CRC) = 261 字节

## 3. CRC16 算法

CRC-16/MODBUS，多项式 `0xA001`，初值 `0xFFFF`。

```c
uint16_t crc16(const uint8_t *data, uint16_t len) {
    uint16_t crc = 0xFFFF;
    for (uint16_t i = 0; i < len; i++) {
        crc ^= data[i];
        for (uint8_t j = 0; j < 8; j++) {
            if (crc & 1)
                crc = (crc >> 1) ^ 0xA001;
            else
                crc >>= 1;
        }
    }
    return crc;
}
```

## 4. 帧类型定义

### 4.1 姿态数据帧 `TYPE = 0x01`

设备 → 上位机。包含姿态解算结果和角速度。

**Payload 长度：28 字节**

| 偏移 | 长度 | 类型 | 字段 | 说明 |
|------|------|------|------|------|
| 0 | 4 | float32 | q0 (w) | 四元数标量部分 |
| 4 | 4 | float32 | q1 (x) | 四元数 x |
| 8 | 4 | float32 | q2 (y) | 四元数 y |
| 12 | 4 | float32 | q3 (z) | 四元数 z |
| 16 | 4 | float32 | gx | 角速度 X，单位 rad/s |
| 20 | 4 | float32 | gy | 角速度 Y，单位 rad/s |
| 24 | 4 | float32 | gz | 角速度 Z，单位 rad/s |

**四元数约定：**
- 单位四元数，满足 q0² + q1² + q2² + q3² = 1
- q0 为标量 (w)，q1/q2/q3 为矢量 (x/y/z)
- 表示从 body 坐标系到 world 坐标系的旋转

**欧拉角换算（上位机计算）：**
```
roll  = atan2(2(q0·q1 + q2·q3), 1 - 2(q1² + q2²))
pitch = asin(2(q0·q2 - q3·q1))
yaw   = atan2(2(q0·q3 + q1·q2), 1 - 2(q2² + q3²))
```

### 4.2 原始 IMU 数据帧 `TYPE = 0x02`

设备 → 上位机。原始传感器数据，未经解算。

**Payload 长度：24 字节**

| 偏移 | 长度 | 类型 | 字段 | 说明 |
|------|------|------|------|------|
| 0 | 4 | float32 | ax | 加速度 X，单位 m/s² |
| 4 | 4 | float32 | ay | 加速度 Y，单位 m/s² |
| 8 | 4 | float32 | az | 加速度 Z，单位 m/s² |
| 12 | 4 | float32 | gx | 角速度 X，单位 rad/s |
| 16 | 4 | float32 | gy | 角速度 Y，单位 rad/s |
| 20 | 4 | float32 | gz | 角速度 Z，单位 rad/s |

### 4.3 设备信息帧 `TYPE = 0x10`

设备 → 上位机。设备连接后主动发送一次，用于上位机识别设备。

**Payload 长度：可变（最大 64 字节）**

| 偏移 | 长度 | 类型 | 字段 | 说明 |
|------|------|------|------|------|
| 0 | 1 | uint8 | protocol_ver | 协议版本，当前为 `0x01` |
| 1 | 1 | uint8 | device_type | 设备类型（见下表） |
| 2 | 2 | uint16 | sample_rate | 采样率 Hz |
| 4 | 16 | char[16] | device_name | 设备名称，UTF-8，不足补 0x00 |
| 20 | 4 | uint32 | firmware_ver | 固件版本 major.minor.patch 打包为 `(major<<16)|(minor<<8)|patch` |

**设备类型 device_type：**

| 值 | 设备 |
|----|------|
| 0x01 | DM_MC02 H7 (STM32H723 + BMI088) |
| 0x02 | 通用 STM32 + MPU6050 |
| 0x03 | 通用 STM32 + ICM42688 |
| 0x04 | ESP32 + BMI270 |
| 0x10 | 通用设备（仅发送姿态帧） |
| 0xFF | 未知 |

新设备接入时自行选取或申请一个 device_type 值。

### 4.4 配置帧 `TYPE = 0x20`

上位机 → 设备。用于运行时调整设备参数。

**Payload 长度：4 字节**

| 偏移 | 长度 | 类型 | 字段 | 说明 |
|------|------|------|------|------|
| 0 | 1 | uint8 | config_id | 配置项 ID |
| 1 | 1 | uint8 | reserved | 保留，填 0 |
| 2 | 2 | uint16 | value | 配置值 |

**config_id 定义：**

| ID | 配置项 | value 含义 |
|----|--------|-----------|
| 0x01 | 采样率 | Hz (100 / 200 / 500 / 1000) |
| 0x02 | 数据模式 | 0=姿态帧, 1=原始帧, 2=两者都发 |
| 0x03 | LED | 0=关, 1=开 |

### 4.5 配置应答帧 `TYPE = 0x21`

设备 → 上位机。对配置帧的应答。

**Payload 长度：3 字节**

| 偏移 | 长度 | 类型 | 字段 | 说明 |
|------|------|------|------|------|
| 0 | 1 | uint8 | config_id | 对应的配置项 ID |
| 1 | 1 | uint8 | result | 0=成功, 1=不支持, 2=参数无效 |
| 2 | 1 | uint8 | reserved | 保留 |

## 5. 通讯流程

```
设备上电
  │
  ├─ USB CDC 枚举完成
  │
  ├─ 发送 设备信息帧 (0x10) ──→ 上位机识别设备，显示名称和类型
  │
  ├─ 开始周期性发送 姿态数据帧 (0x01) ──→ 上位机 3D 渲染 + 数据面板
  │                 和/或 原始数据帧 (0x02) ──→ 上位机波形图
  │
  │  （可选）上位机发送 配置帧 (0x20) ──→ 设备调整参数
  │          设备回复 应答帧 (0x21)  ──→ 上位机确认
  │
  └─ 断开连接
```

## 6. 接入新设备

接入一个新设备只需要：

1. **实现 CRC16 和帧打包函数**（参考第 3 节）
2. **上电后发送一帧设备信息帧** (0x10)
3. **周期性发送姿态数据帧** (0x01)，推荐 100~500 Hz
4. （可选）同时发送原始数据帧 (0x02)
5. （可选）处理配置帧 (0x20) 并回复应答

### C 语言参考实现

```c
#include <stdint.h>
#include <string.h>

#define FRAME_HEADER_0  0xAA
#define FRAME_HEADER_1  0x55
#define TYPE_ATTITUDE   0x01
#define TYPE_RAW_IMU    0x02
#define TYPE_DEVICE_INFO 0x10

// 发送一帧数据（需自行实现 uart_send）
void send_frame(uint8_t type, const uint8_t *payload, uint8_t len) {
    uint8_t buf[261];
    buf[0] = FRAME_HEADER_0;
    buf[1] = FRAME_HEADER_1;
    buf[2] = type;
    buf[3] = len;
    memcpy(&buf[4], payload, len);

    uint16_t crc = crc16(buf, 4 + len);
    buf[4 + len] = crc & 0xFF;
    buf[5 + len] = (crc >> 8) & 0xFF;

    uart_send(buf, 6 + len);
}

// 发送姿态帧
void send_attitude(float q[4], float gyro[3]) {
    uint8_t payload[28];
    memcpy(&payload[0],  &q[0], 4);
    memcpy(&payload[4],  &q[1], 4);
    memcpy(&payload[8],  &q[2], 4);
    memcpy(&payload[12], &q[3], 4);
    memcpy(&payload[16], &gyro[0], 4);
    memcpy(&payload[20], &gyro[1], 4);
    memcpy(&payload[24], &gyro[2], 4);
    send_frame(TYPE_ATTITUDE, payload, 28);
}

// 发送设备信息帧
void send_device_info(void) {
    uint8_t payload[24] = {0};
    payload[0] = 0x01;            // protocol version
    payload[1] = 0x01;            // device type: DM_MC02
    payload[2] = 200 & 0xFF;     // sample rate low
    payload[3] = (200 >> 8);     // sample rate high
    strncpy((char *)&payload[4], "DM_MC02_H7", 16);
    uint32_t fw = (1 << 16) | (0 << 8) | 0;  // v1.0.0
    memcpy(&payload[20], &fw, 4);
    send_frame(TYPE_DEVICE_INFO, payload, 24);
}
```

## 7. 字节序示例

以姿态帧为例，四元数 q0=1.0, q1=0, q2=0, q3=0，角速度全零：

```
AA 55 01 1C                          ← Header + Type(0x01) + Len(28)
00 00 80 3F                          ← q0 = 1.0 (IEEE 754 LE)
00 00 00 00                          ← q1 = 0.0
00 00 00 00                          ← q2 = 0.0
00 00 00 00                          ← q3 = 0.0
00 00 00 00                          ← gx = 0.0
00 00 00 00                          ← gy = 0.0
00 00 00 00                          ← gz = 0.0
XX XX                                ← CRC16 (对前 32 字节计算)
```
