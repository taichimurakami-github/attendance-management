import "../styles/modules/Top.scss";

interface TopMessageView {
  msg: string;
  activateNewsModal: () => void;
}

export const TopMessage = (props: TopMessageView) => {
  return (
    <div onClick={props.activateNewsModal} className="top-message-wrapper">
      <h2 className="title">お知らせ</h2>
      <div className="inner">
        <p className="message">{props.msg}</p>
      </div>
    </div>
  );
};
