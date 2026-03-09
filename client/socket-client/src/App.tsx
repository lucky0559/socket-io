import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

type ReceiveMessage = {
  message: string;
};

const socket = io("http://localhost:3001");
function App() {
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messageReceived, setMessageReceived] = useState("");
  const [typingUser, setTypingUser] = useState("");

  const typingTimeout = useRef<number | null>(null);

  const joinRoom = () => {
    if (room) socket.emit("join_room", room);
  };

  const sendMessage = () => {
    socket.emit("send_message", {
      message,
      room
    });
  };

  const handleTyping = () => {
    socket.emit("typing", { user: "User", room });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = window.setTimeout(() => {
      socket.emit("stop_typing", { room });
    }, 2000);
  };

  useEffect(() => {
    const handler = (data: ReceiveMessage) => {
      alert(data.message);
    };

    const typingHandler = (data: { user: string }) => {
      setTypingUser(data.user);
    };

    const stopTypingHandler = () => {
      setTypingUser("");
    };

    socket.on("receive_message", data => {
      setMessageReceived(data.message);
    });

    socket.on("user_typing", typingHandler);
    socket.on("user_stop_typing", stopTypingHandler);

    return () => {
      socket.off("receive_message", handler);
      socket.off("user_typing", typingHandler);
      socket.off("user_stop_typing", stopTypingHandler);
    };
  }, []);

  return (
    <div>
      <input placeholder="Room" onChange={e => setRoom(e.target.value)} />
      <button onClick={joinRoom}>Join room</button>
      <input
        placeholder="Message"
        onChange={e => {
          setMessage(e.target.value);
          handleTyping();
        }}
      />
      <button onClick={sendMessage}>Send message</button>
      <div>
        {typingUser && <p>{typingUser} is typing...</p>}
        <span>{messageReceived}</span>
      </div>
    </div>
  );
}

export default App;
