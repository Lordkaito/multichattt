import "./App.css";
import { useEffect, useState } from "react";
function App() {
  const [channels, setChannels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [messages, setMessages] = useState<any[]>([]);
  const nick = "MultiChattt";
  const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");
  const oAuth = import.meta.env.VITE_OAUTH_ID;
  const host = import.meta.env.VITE_HOST;

  useEffect(() => {
    socket.addEventListener("open", () => {
      socket.send(`PASS ${oAuth}`);
      socket.send(`NICK ${nick}`);
      channels.forEach((channel) => {
        socket.send(`JOIN #${channel}`);
      });
      socket.send(`CAP REQ :twitch.tv/tags`);
      setIsLoading(false);
    });

    socket.addEventListener("message", (event) => {
      if (isLoading) return;
      if (event.data.includes("PING")) {
        socket.send("PONG :tmi.twitch.tv");
        return;
      }
      if (event.data.includes("Welcome, GLHF!")) return;
      const message = event.data;

      const messageContent = message.split(":").slice(2).join(":");
      if (messageContent === "") return;
      if (messageContent === "twitch.tv/tags\r\n") return;
      if (messageContent.includes("tmi.twitch.tv")) return;

      const parts = message.split(" ")[0].split("!")[0].substring(1).split(";");

      const obj: any = {};
      parts.forEach((part: any) => {
        const key = part.split("=")[0];
        const value = part.split("=")[1];
        obj[key] = value;
      });
      obj["message"] = messageContent;
      return setMessages((messages) => [...messages, obj]);
    });
  }, [channels]);

  const handleNewChannel = (e: any) => {
    if (e.code !== "Enter") return;
    if (e.target.value === "") return;
    if (channels.length >= 9) {
      alert(
        "You have reached the maximum number of channels allowed. Please refresh the page to start over."
      );
      return;
    }
    e.preventDefault();
    const newChannel: string = e.target.value;
    setChannels([...channels, newChannel]);
    e.target.value = "";
  };
  return (
    <>
      {channels.length === 0 ? (
        <>
          <h1 className="multichat-alpha">
            multiChattt <i>alpha</i>
          </h1>
          <div className="modal-container">
            <div className="modal">
              <p>
                Welcome to MultiChattt. To start, please enter a Twitch channel
                in the box on your right and hit enter. You can add up to 9
                channels and watch them at the same time. Enjoy!
              </p>
            </div>
            <div className="chat-container">
              <label htmlFor="twitch channel" className="twich-channel-input">
                <input
                  type="text"
                  onKeyDown={(e) => handleNewChannel(e)}
                  placeholder="Enter Twitch Channel"
                />
              </label>
              <div className="chat-messages"></div>
            </div>
          </div>
        </>
      ) : (
        <>
          <h1 className="multichat-alpha">
            multiChattt <i>alpha</i>
          </h1>
          <div className="multi-chat">
            <div
              id="streams"
              style={
                channels.length > 2
                  ? {
                      display: "grid",
                      maxWidth: "1100px",
                      width: "1100px",
                      height: "calc(100vh - 10rem)",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(300px, 1fr))",
                    }
                  : {
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "1100px",
                      height: "calc(100vh - 10rem)",
                    }
              }
            >
              {channels.map((channel, index) => {
                return (
                  <iframe
                    key={index}
                    src={`https://player.twitch.tv/?channel=${channel}&parent=${host}&muted=true`}
                    height="100%"
                    width="100%"
                    allowFullScreen
                  ></iframe>
                );
              })}
            </div>
            <div className="chat-container">
              <label htmlFor="twitch channel" className="twich-channel-input">
                <input
                  type="text"
                  onKeyDown={(e) => handleNewChannel(e)}
                  placeholder="Enter Twitch Channel"
                />
              </label>
              <div className="chat-messages">
                {messages.map((message) => {
                  return (
                    <div className="message" key={message.id}>
                      <span className="username">
                        {message["display-name"]}:{" "}
                      </span>
                      <span className="message-content">
                        {message["message"]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default App;
