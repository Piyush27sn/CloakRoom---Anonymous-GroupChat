import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import "./Home.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const getMemberId = (groupId) => {
  const key = `anonMemberId_${groupId}`;   // store per group
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const newId = Math.random().toString(36).substring(2, 12);
  localStorage.setItem(key, newId);
  return newId;
};

export const GroupChat = () => {
  const { groupId } = useParams();
  const memberId = useMemo(() => getMemberId(groupId), [groupId]);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [members, setMembers] = useState([]);
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    const socket = io(API_URL);
    socketRef.current = socket;

    // Join group via socket (persists member in backend)
    socket.emit("joinGroup", { groupId, memberId }, (ack) => {
      if (!ack?.ok) {
        console.warn("joinGroup not acknowledged", ack);
      }
      // Fetch old messages on initial load
      fetch(`${API_URL}/messages/${groupId}`)
        .then((res) => res.json())
        .then((data) => setMessages(data))   // <-- added line
        .catch((err) => console.error("Error fetching messages:", err));

      // initial load
      fetch(`${API_URL}/members/${groupId}`)
        .then((res) => res.json())
        .then((data) => setMembers(data));
    });


    // replace with full updated list broadcast from backend
    socket.on("membersUpdated", (updatedMembers) => {
      setMembers(updatedMembers);   // <-- updated line
    });

    // Listen for new messages (unchanged)
    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });


    // fetch group details
    fetch(`${API_URL}/groups`)
      .then((res) => res.json())
      .then((groups) => {
        const g = groups.find((grp) => grp.groupId === groupId);
        if (g) setGroupName(g.name);
      })
      .catch((err) => console.error("Error fetching group: ", err));

    return () => {
      socket.off("membersUpdated"); // <-- updated line
      socket.off("newMessage");
      socket.disconnect();
    };
  }, [groupId, memberId]);

  // Auto-scroll message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behaviour: "smooth" });
    }
  }, [messages]);

  const sendMessage = () => {
    if (text.trim() === "") return;

    const socket = socketRef.current;
    if (!socket) return;

    socket.emit("sendMessage", { groupId, text });
    setText("");
  };

  const leaveGroup = () => {
    // disconnect socket cleanly
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    // close the current tab
    window.close();
  };


  return (
    <div className="chatMain">
      <div className="chatMainHead">
      <h3> Group: {groupName || groupId} </h3>
      <button onClick={leaveGroup}> Leave Group </button>
      </div>
      <div className="chatMessage">
        {messages.map((m, i) => (
          <p key={m._id ?? i}>
            <strong>Anonymous: </strong>
            {m.text}
          </p>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message ... "
        className="chatInputBox"
      />
      <button className="chatSendBtn" onClick={sendMessage}> Send </button>

      <div className="chatSectionB">
        <h4> Members </h4>
        <ul>
          {members.map((m, i) => (
            <li key={m._id ?? i}> Anonymous - {i + 1} </li>
          ))}
        </ul>
      </div>

    </div>
  );
};
