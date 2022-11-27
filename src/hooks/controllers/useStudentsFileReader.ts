import { useCallback, useContext } from "react";
import { appConfig } from "../../app.config";
import { AppStateContext } from "../../AppContainer";
import { useIpcEventsSender } from "./useIpcEventsSender";

const useStudentsFileReader = () => {
  const { readStudentsList, updateStudentsListPathConfig } =
    useIpcEventsSender();
  const { setStudentsList, handleModalState }: AppStateContext =
    useContext(AppStateContext);

  const studentsFileReader = useCallback(() => {
    const debugInput = document.createElement("input");
    // const acceptFileTypeList = [".xlsx", ".csv"];

    debugInput.type = "file";
    debugInput.click();
    debugInput.addEventListener("change", async (e) => {
      const input = e.target as HTMLInputElement;

      const studentsList_loadedData = await readStudentsList();
      console.log("useStudnetsFileReader read result:");
      console.log(studentsList_loadedData);
      studentsList_loadedData && setStudentsList(studentsList_loadedData);

      const pathConfigUpdateResult = await updateStudentsListPathConfig(
        input.files === null ? "" : input.files[0].path
      );
      console.log(pathConfigUpdateResult);
      pathConfigUpdateResult
        ? handleModalState({
            active: true,
            name: appConfig.modalCodeList["1001"],
            content: {
              confirmCode: appConfig.confirmCodeList["2004"],
            },
          })
        : handleModalState({
            active: true,
            name: appConfig.modalCodeList["1002"],
            content: {
              errorCode: appConfig.errorCodeList["2001"],
            },
          });
    });
  }, []);

  return studentsFileReader;
};

export default useStudentsFileReader;
