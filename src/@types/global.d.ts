import { ipcRenderer } from "electron";

declare global {
  interface Window {
    electron: {
      ipcRenderer: ipcRenderer
    }
  }

  interface appState {
    selectedElement: null | HTMLElement
    selectedSeat: string,
    now: string,
    localConfig: any,
    appLog: any,
  }

  interface studentsList {
    [index: string]: array[{ [index: string]: string }]
  }

  interface attendanceState {
    [index: string]: array[{ [index: string]: string }]
  }

  interface modalState {
    active: boolean,
    name: string,
    content: {
      // confirmCode?: string,
      // errorCode?: string,

      // //App.tsx
      // studentID?: string
      // nextSeatID?: string,

      // //Top.tsx
      // studentName?: string,
      // currentOperation?: string,
      [index: string]: string
    }
  }

  interface seatsState {
    [index: string]: {
      active: boolean,
      enterTime: string,
      studentID: string,
    }
  }

  interface appConfig {
    localConfigTemplate: {
      fn: {
        nightly: {} | { [index: string]: any }
        stable: {} | { [index: string]: any }
      },
    },
    fn: any,
    appMode: {
      development: string,
      production: string
    },
    modalCodeList: {
      [index: string]: string,
    },
    confirmCodeList: {
      [index: string]: string,
    },
    errorCodeList: {
      [index: string]: string,
    },
    seatOperationCodeList: {
      [index: string]: string,
    },
    seatsModalModeList: {
      [index: string]: string,
    }
  }

}