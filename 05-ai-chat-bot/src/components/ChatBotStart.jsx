import './ChatBotStart.css';

const ChatBotStart = ({ onStartChat }) => {
  return (
    <div>
      <div className="start-page">
        <button className="start-page-btn" onClick={onStartChat}>
          Chat AI
        </button>
      </div>
    </div>
  );
};

export default ChatBotStart;
