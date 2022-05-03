import { useState, useEffect, useCallback } from "react";

const useModalState = (modalState_initialValue: modalState) => {
  const [modalState, setModalState] = useState<modalState>(
    modalState_initialValue
  );

  const handleModalState = useCallback((t: modalState) => {
    //t.active = falseだった場合：modalStateをリセットする
    if (!t.active) {
      setModalState(modalState_initialValue);
      return;
    }

    //その他：引数に従ってモーダルを起動
    if (t.active && t.name !== "" && t.content !== {}) {
      setModalState({
        active: true,
        name: t.name,
        content: t.content,
      });
      return;
    }

    //正しく引数が指定されていない場合はエラー
    throw new Error(
      "handleModal argument type error in App.js: you need to include active, name, content properties those are truthy."
    );
  }, []);

  return { modalState, setModalState, handleModalState };
};

export default useModalState;