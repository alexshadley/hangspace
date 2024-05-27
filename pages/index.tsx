import React, { useState, useEffect } from "react";
import styles from "../styles/home.module.css";
import { InferGetServerSidePropsType } from "next";
import { SelectUser } from "../components/SelectUser";
import { queryPosts } from "../util/queries";
import { pgClient } from "../util/PgClient";

// getServerSideProps is a magic function name, next.js looks for it and does
// some special stuff: https://nextjs.org/docs/pages/building-your-application/data-fetching/get-server-side-props
export const getServerSideProps = async () => {
  // this postgres library seems dirt-simple :)
  const users = await pgClient.query(`
    SELECT users.id, users.name FROM users;
`);
  const posts = await queryPosts();

  return {
    props: {
      initialMessages: posts,
      users: users.rows,
      // users,
    },
  };
};

const Home = ({
  initialMessages,
  users,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [messages, setMessages] = useState(initialMessages);

  const [userId, setUserId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("");

  const [showCount, setShowCount] = useState<number>(5);

  const currentUser = users.find((user) => user.id === userId);
  const username = currentUser?.name;

  useEffect(() => {
    // runs this function every 1s
    const id = setInterval(() => handleRefresh(showCount), 1000);

    // not important
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const userIdFromStorage = window.localStorage.getItem("logged-in-user-id")
      ? parseInt(localStorage.getItem("logged-in-user-id"))
      : null;
    if (userIdFromStorage) {
      setUserId(userIdFromStorage);
    }
  }, []);

  async function handleSubmit() {
    const formData = new FormData();
    formData.append("userId", userId.toString());
    formData.append("message", message);

    const fileInput = document.getElementById(
      "image-selector"
    ) as HTMLInputElement;
    formData.append(
      "file",
      fileInput.files.length > 0 ? fileInput.files[0] : null
    );

    await fetch(`/api/newPost`, { method: "POST", body: formData });
    setMessage("");
    handleRefresh(showCount);
  }

  async function handleRefresh(newShowCount) {
    var data = await fetch(`/api/refresh?showCount=${newShowCount}`, {
      method: "GET",
    });

    var msg = await data.json();
    setMessages(msg.messages);
  }

  function handleAttach() {}

  if (!userId) {
    return (
      <div>
        Who are you?
        <br />
        {users.map((u) => (
          <>
            <button
              onClick={() => {
                window.localStorage.setItem("logged-in-user-id", u.id);
                setUserId(u.id);
              }}
            >
              {u.name}
            </button>
            <br />
          </>
        ))}
      </div>
    );
  }

  return (
    <main className={styles.main}>
      <h1>Hangspace!</h1>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <h2>
          Welcome user: {userId} {username}
        </h2>
        <button
          onClick={() => {
            window.localStorage.setItem("logged-in-user-id", null);
            setUserId(null);
          }}
        >
          Logout
        </button>
      </div>
      <input
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      ></input>

      {/* <button onClick={handleAttach}>Attach image</button> */}
      <button onClick={handleSubmit}>Send!</button>
      <input type="file" id="image-selector" />

      <hr />
      <br />
      {messages.map((m) => (
        <div className={styles.card}>
          <b>{m.userName}:</b> {m.content}
          {/* conditionally show image*/}
          {m.s3Url && (
            <div className="reframe">
              <img src={m.s3Url} alt="m.s3Url" />
            </div>
          )}
          <br />
          {m.created_ts}
        </div>
      ))}

      <button
        onClick={() => {
          setShowCount(showCount + 5);
          handleRefresh(showCount + 5);
        }}
      >
        Show me more...
      </button>
    </main>
  );
};

export default Home;
