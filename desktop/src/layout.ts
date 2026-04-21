import { IJsonModel } from "flexlayout-react";

// 默认布局：左侧 3D+波形，右侧数据面板（各个 section 作为 tab）
export const defaultLayout: IJsonModel = {
  global: {
    tabEnableClose: false,
    tabEnableRename: false,
    tabSetEnableMaximize: true,
    tabSetEnableDrop: true,
    tabSetEnableDrag: true,
    tabSetMinWidth: 160,
    tabSetMinHeight: 100,
    borderEnableDrop: true,
    splitterSize: 4,
    splitterExtra: 4,
  },
  borders: [],
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
        // 左侧：3D + 波形（上下分割）
        type: "row",
        weight: 65,
        children: [
          {
            type: "tabset",
            weight: 70,
            children: [
              { type: "tab", name: "3D Viewer", component: "3d-viewer" },
            ],
          },
          {
            type: "tabset",
            weight: 30,
            children: [
              { type: "tab", name: "Waveform", component: "waveform" },
            ],
          },
        ],
      },
      {
        // 右侧：数据面板各 section 作为独立 tab
        type: "tabset",
        weight: 35,
        children: [
          { type: "tab", name: "Euler Angles", component: "euler" },
          { type: "tab", name: "Quaternion", component: "quaternion" },
          { type: "tab", name: "Angular Velocity", component: "angular-velocity" },
        ],
      },
    ],
  },
};
