import { IJsonModel } from "flexlayout-react";

export const defaultLayout: IJsonModel = {
  global: {
    tabEnableClose: false,
    tabEnableRename: false,
    tabEnableDrag: false,       // 禁止拖拽移动 tab
    tabSetEnableMaximize: true,
    tabSetEnableDrop: false,    // 禁止 drop
    tabSetEnableDrag: false,    // 禁止拖拽 tabset
    tabSetMinWidth: 120,
    tabSetMinHeight: 80,
    borderEnableDrop: false,
    splitterSize: 5,
    splitterExtra: 4,
  },
  borders: [],
  layout: {
    type: "row",
    weight: 100,
    children: [
      {
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
        type: "row",
        weight: 35,
        children: [
          {
            type: "tabset",
            weight: 34,
            children: [
              { type: "tab", name: "Euler Angles", component: "euler" },
            ],
          },
          {
            type: "tabset",
            weight: 33,
            children: [
              { type: "tab", name: "Quaternion", component: "quaternion" },
            ],
          },
          {
            type: "tabset",
            weight: 33,
            children: [
              { type: "tab", name: "Angular Velocity", component: "angular-velocity" },
            ],
          },
        ],
      },
    ],
  },
};
