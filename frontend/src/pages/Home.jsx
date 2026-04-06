import React, { useState, useEffect } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const APP_URL = import.meta.env.VITE_APP_URL || "http://localhost:5173";

export const Home = () => {
  const [groupName, setGroupName] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [groups, setGroups] = useState([]);

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API_URL}/groups`);
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      console.error("Error fetching groups: ", err);
    }
  };

  const createGroup = async () => {
    if (!groupName.trim()) return;

    try {
      const res = await fetch(`${API_URL}/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: groupName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Create group failed", data);
        return;
      }

      // Show invite link
      const link = `${APP_URL}/group/${data.groupId}`;
      setInviteLink(link);

      // Refresh groups list
      fetchGroups();
      setGroupName("");
    } catch (err) {
      console.error("Error creating group: ", err);
    }
  };

  const deleteGroup = async (groupId) => {
    try {
      await fetch(`${API_URL}/groups/${groupId}`, {
        method: "DELETE",
      });

      // Refresh groups list after deletion
      setGroups((prev) => prev.filter((g) => g.groupId !== groupId));
    } catch (err) {
      console.error("Error deleting group: ", err);
    }
  };

  const openLink = () => {
    if (!inviteLink) return;
    window.open(inviteLink, "_blank");
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="homeMain">

      <div className="container homeSectionA">
        <div className="row g-5">
          <div className="col-lg-6 col-sm-12">

            <h3> Create a new group </h3>
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="inputBox"
            />
            <button onClick={createGroup} className="inputBtn"> Create Group </button>

            {inviteLink && (
              <div>
                <button className="goToGroupBtn" onClick={openLink}> Go to group </button>
              </div>
            )}
            
          </div>
          <div className="col-lg-6 col-sm-12 allSpan order-first order-md-2">
            <span className="spanA">Anonymous</span><br/>
            <span className="spanB">Group</span><br/>
            <span className="spanC">Chat <i class="bi bi-chat-dots"></i></span><br/>
            <span className="spanD">Contribute to groupchat anonymously</span>
          </div>
        </div>
      </div>

      <div className="homeSectionB">
        <h3> Available Groups: </h3>
        <ul>
          {groups.map((g) => (
            <li key={g._id}>
              <b> Group name: </b>{g.name}
              <button className="groupBtn1"
                onClick={() =>
                  window.open(`${APP_URL}/group/${g.groupId}`, "_blank")
                }
              >
                Open
              </button>
              <button className="groupBtn2" onClick={() => deleteGroup(g.groupId)}>Delete</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
