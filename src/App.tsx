//module import
import React, { useEffect, useState, useContext, createContext } from "react";
import {
  appConfig,
  appState_initialValue,
  studentsList_initialValue,
  attendanceState_initialValue,
  seatsState_initialValue,
  modalState_initialValue,
} from "./app.config";

//React components import
import { Top } from "./components/containers/Top";
import { SelectData } from "./components/containers/StudentDataSelector";
import { ModalWrapper } from "./components/containers/MordalRoot";
import { Config } from "./components/containers/Config";

//styles import
import "./components/styles/modules/Top.scss";
import "./components/styles/app.common.scss";
import { resolve } from "path";
import useSeatsState from "./hooks/useSeatsState";
import useAttendanceState from "./hooks/useAttendanceState";
import useStudentsListState from "./hooks/useStudentsListState";
import useAppState from "./hooks/useAppState";
import useEnterRecorder from "./hooks/useEnterRecorder";
import useRecordExit from "./hooks/useExitRecorder";
import useSeatsController from "./hooks/useSeatsController";
import useCancelController from "./hooks/useCancelController";
import useModalStateController from "./hooks/useModalStateController";
import useModalState from "./hooks/useModalState";

export const AppStatesContext = createContext({});

// export

const App: React.VFC = () => {
  /**
   * -------------------------------
   *    React Hooks declearation
   * -------------------------------
   */

  //アプリの動作状態を管理する変数
  const { appState, setAppState, resetAppState } = useAppState(
    appState_initialValue
  );

  //エクセルから取得した生徒情報(生徒名簿リストデータ)を格納しておく変数
  const { studentsList, setStudentsList } = useStudentsListState(
    studentsList_initialValue
  );

  //入退室記録のデータを保存しておく変数
  const { attendanceState, setAttendanceState } = useAttendanceState(
    attendanceState_initialValue
  );

  //現在の座席状況を管理する変数
  const { seatsState, setSeatsState } = useSeatsState(seatsState_initialValue);

  //モーダル管理変数
  // const [modalState, setModalState] = useState<modalState>(
  //   modalState_initialValue
  // );

  const { modalState, setModalState } = useModalState(modalState_initialValue);

  /**
   * function handleEraceAppData()
   *
   * 本日の分の、アプリのローカルデータを完全に削除する
   * ※削除されるのはアプリ起動日1日分のみ
   *
   */
  const handleEraceAppData = async () => {
    console.log("erace");
    await window.electron.ipcRenderer.invoke("handle_eraceAppLocalData");
    setModalState({
      active: true,
      name: appConfig.modalCodeList["1001"],
      content: {
        //アプリデータ削除完了
        confirmCode: appConfig.confirmCodeList["2005"],
      },
    });
  };

  /**
   * function handleModalState()
   *
   * モーダルの表示を管理する関数
   * 引数tはactive, nameキーと、モーダルごとに異なるcontentキーを持つオブジェクトとする
   *
   * @param {object} t
   * @returns {void}
   */
  const handleModalState = (t: modalState): void => {
    useModalStateController(t, setModalState);
  };

  /**
   * function handleSaveAttendanceForEnter()
   *
   * 入室記録を保存する関数
   *
   * @param {string} i : TARGET STUDENT ID (studentsList student.id)
   */
  const handleSaveAttendanceForEnter = (i: string) => {
    if (!seatsState || !attendanceState) {
      throw new Error("error: seatsState or attendanceState is null");
    }

    useEnterRecorder(
      i,
      appState,
      seatsState,
      attendanceState,
      resetAppState,
      setSeatsState,
      setModalState,
      setAttendanceState
    );
  };

  /**
   * function handleSaveAttendanceForExit()
   *
   * 退室記録を保存する関数
   *
   * @param {string} i : SELECTED SEAT ID
   */
  const handleSaveAttendanceForExit = (i: string) => {
    /**
     * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
     * エラー！seatsState or attendanceStateが読み込めていません
     * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
     */
    if (!seatsState || !attendanceState) {
      return setModalState({
        active: true,
        name: appConfig.modalCodeList["1002"],
        content: {},
      });
    }

    useRecordExit(
      i,
      seatsState,
      attendanceState,
      setAttendanceState,
      resetAppState,
      setSeatsState,
      setModalState
    );
  };

  /**
   * function handleSeatOperation()
   * @param {object}
   * {
   *    mode: {String},
   *    content: {Object}
   * }
   * @returns
   */
  const handleSeatOperation = (arg: { mode: string; content: any }): void => {
    if (!attendanceState || !seatsState) {
      return;
    }

    console.log("activate fn handleSeatOperation()");

    useSeatsController(
      arg,
      seatsState,
      attendanceState,
      setSeatsState,
      setAttendanceState,
      setModalState
    );
  };

  /**
   * function handleCancelOparation()
   *
   * 一つ前の操作を取り消す関数
   * 今の所、一旦取り消したらもとに戻すことはできないし、
   * 一つ前以上の操作を取り消すことはできない
   *
   * @returns {void}
   */
  const handleCancelOperation = () => {
    if (!attendanceState || !seatsState) {
      return;
    }

    console.log("launching cancel oparation...");

    useCancelController(
      appState,
      seatsState,
      attendanceState,
      resetAppState,
      setSeatsState,
      setModalState,
      setAttendanceState
    );
  };

  /**
   * function handleChangeAppLocalConfig()
   *
   * appLocalConfigに保存するデータを変更する
   * 複数項目の変更を考慮し、変更項目と変更内容を格納したオブジェクトを引数に渡す
   *
   * @param {array} args
   *
   * {
   *   target: array
   * }
   */
  const handleChangeAppLocalConfig = async (arg: {
    fn_id?: string;
    fn_status?: string;
    fn_value?: boolean;
    msg?: string;
  }) => {
    const newAppLocalConfig = await window.electron.ipcRenderer.invoke(
      "handle_loadAppLocalConfig",
      { mode: "write", content: arg }
    );
    //変更を反映
    setAppState({
      ...appState,
      localConfig: { ...newAppLocalConfig.appConfig },
    });

    resolve();
  };

  //appState, seatStateを変更する
  const handleAppState = (d: { [index: string]: any }) =>
    setAppState({ ...appState, ...d });
  // const handleSeatsState = (d: { [index: string]: any }) =>
  //   setSeatsState({ ...seatsState, ...d });

  /**
   * function handleComponent()
   *
   * render()内のReact Componentを、appStateの変更に合わせて動的に返す
   *
   * @returns {void}
   */
  const handleComponent = () => {
    switch (appState.now) {
      case "TOP":
        return (
          <Top
            onHandleAppState={handleAppState}
            // onHandleSeatsState={handleSeatsState}
            onHandleModalState={handleModalState}
            appState={appState}
            seatsState={seatsState as seatsState}
            studentsList={studentsList as studentsList}
          />
        );

      case "STUDENT":
        return (
          <SelectData
            onSaveAttendance={handleSaveAttendanceForEnter}
            onResetAppState={resetAppState}
            onHandleModalState={handleModalState}
            appState={appState}
            studentsList={studentsList as studentsList}
            seatsState={seatsState as seatsState}
          />
        );

      case "CONFIG":
        return (
          <Config
            onHandleStudentFile={setStudentsList}
            onHandleAppState={handleAppState}
            onReadStudentsList={setStudentsList}
            onHandleModalState={handleModalState}
            onHandleChangeAppLocalConfig={handleChangeAppLocalConfig}
            appState={appState}
          />
        );

      default:
        throw new Error(
          "an Error has occured in App.js: unexpected appState.now case"
        );
    }
  };

  /**
   * -------------------------------
   *      useEffect functions
   * -------------------------------
   */

  //生徒情報ファイルが読み込まれていない時は、エラーモーダルを最初に表示
  useEffect(() => {
    if (!studentsList) {
      setModalState({
        active: true,
        name: appConfig.modalCodeList["1002"],
        content: {
          errorCode: appConfig.errorCodeList["1001"],
        },
      });
    } else {
      modalState.active &&
        modalState.name === appConfig.modalCodeList["1002"] &&
        modalState.content.errorCode === appConfig.errorCodeList["1001"] &&
        setModalState({
          active: false,
          name: "",
          content: {},
        });
    }
  }, [studentsList]);

  //バックアップ兼記録ファイル 自動書き出し
  useEffect(() => {
    (async () => {
      //attendanceState書き出し
      attendanceState &&
        (await window.electron.ipcRenderer.invoke("handle_attendanceState", {
          mode: "write",
          data: JSON.stringify(attendanceState),
        }));

      //seatsState書き出し
      seatsState &&
        (await window.electron.ipcRenderer.invoke("handle_seatsState", {
          mode: "write",
          data: JSON.stringify(seatsState),
        }));
    })();
  }, [attendanceState, seatsState]);

  return (
    <div className="App">
      <AppStatesContext.Provider
        value={{
          appState,
          setAppState,
          seatsState,
          setSeatsState,
          attendanceState,
          setAttendanceState,
          studentsList,
          setStudentsList,
          modalState,
          setModalState,
        }}
      >
        {handleComponent()}
        <ModalWrapper
          onHandleAppState={handleAppState}
          onHandleModalState={handleModalState}
          onSaveForEnter={handleSaveAttendanceForEnter}
          onSaveForExit={handleSaveAttendanceForExit}
          onEraceAppData={handleEraceAppData}
          onCancelOperation={handleCancelOperation}
          onHandleSeatOperation={handleSeatOperation}
          studentsList={studentsList}
          modalState={modalState}
          seatsState={seatsState}
          appState={appState}
        />
      </AppStatesContext.Provider>
    </div>
  );
};

export default App;

//デバッグ用コンソール表示関数
// useEffect(() => {
//   console.log("seatsState checker---------");
//   console.log(seatsState);
// }, [seatsState]);
// useEffect(() => {
//   if (studentsList) {
//     console.log("student list data has loaded");
//     console.log(studentsList);
//   }
// }, [studentsList]);
// useEffect(() => {
//   console.log("appState checker---------");
//   console.log(appState);
// }, [appState]);
// useEffect(() => {
//   console.log("appState checker---------");
//   console.log(modalState);
// }, [modalState]);
// useEffect(() => {
//   console.log("attendanceState checker........")
//   console.log(attendanceState);
// }, [attendanceState]);
//
//---------------------------
//
//起動時、もしくはリロード時に1回だけ行われる処理
// useEffect(() => {
//   console.log("バックアップファイルの読み込みを開始します");

//   const reloadProc = async () => {
// isFirstReadSeatsStateBCUP.current = false;
// isFirstReadAttendanceStateBCUP.current = false;
//アプリのローカルファイルからアプリデータを取得
// const appLocalConfigData = await window.electron.ipcRenderer.invoke(
//   "handle_loadAppLocalConfig",
//   { mode: "read" }
// );
// appConfig.fn = appLocalConfigData.fn;
// appConfig.msg = appLocalConfigData.msg;
// setAppState({
//   ...appState,
//   localConfig: appLocalConfigData,
// });
// console.log("appConfig loaded:", appConfig.fn);
// //生徒情報ファイルが存在していれば自動読み込み
// //grade, idが整数値で取得されるので、文字列型に変換しておく
// const studentsList_autoloadedData: studentsList =
//   await window.electron.ipcRenderer.invoke("handle_studentsList", {
//     mode: "read",
//   });
// if (studentsList_autoloadedData) {
//   // const convertedStudentsList = [];
//   //keyが数値のオブジェクトが手渡されるので、
//   //grade, idを文字列に変換
//   for (let i = 0; i < studentsList_autoloadedData.length; i++) {
//     studentsList_autoloadedData[i].grade = String(
//       studentsList_autoloadedData[i].grade
//     );
//     studentsList_autoloadedData[i].id = String(
//       studentsList_autoloadedData[i].id
//     );
//   }
//   setStudentsList(studentsList_autoloadedData);
//   // console.log(studentsList_autoloadedData);
// }
// //今日の分のseatsState記録が残っていれば読み込み
// const seatsState_bcup = await window.electron.ipcRenderer.invoke(
//   "handle_seatsState",
//   { mode: "read" }
// );
// console.log("read_seatsstate_bcup_result", seatsState_bcup);
// seatsState_bcup && setSeatsState(seatsState_bcup);
//今日の分のattendanceState記録が残っていれば読み込み
// const attendanceState_bcup = await window.electron.ipcRenderer.invoke(
//   "handle_attendanceState",
//   { mode: "read" }
// );
// console.log("attendanceState_bcup_result", attendanceState_bcup);
// attendanceState_bcup && setAttendanceState(attendanceState_bcup);
//初回読み込みを完了、フラグを変更
// isFirstReadSeatsStateBCUP.current = true;
// isFirstReadAttendanceStateBCUP.current = true;
//   };

//   reloadProc();
// }, []);
