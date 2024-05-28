import React, { useState, useEffect, useRef } from "react";
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

  const showCount = useRef(5);

  const currentUser = users.find((user) => user.id === userId);
  const username = currentUser?.name;

  useEffect(() => {
    window.addEventListener("paste", (e) => {
      const fileInput = document.getElementById(
        "image-selector"
      ) as HTMLInputElement;
      fileInput.files = e.clipboardData.files;
    });
  }, []);

  useEffect(() => {
    // runs this function every 10s
    const id = setInterval(() => handleRefresh(), 10000);

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
    handleRefresh();
  }

  async function handleRefresh() {
    var data = await fetch(`/api/refresh?showCount=${showCount.current}`, {
      method: "GET",
    });

    var msg = await data.json();
    setMessages(msg.messages);
  }

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
      <textarea
        style={{ maxWidth: "100%", width: "400px", height: "120px" }}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <br />

      <button onClick={handleSubmit} style={{ marginRight: "8px" }}>
        Send!
      </button>
      <input type="file" id="image-selector" />

      <hr />
      <br />
      {messages.map((m) => (
        <div className={styles.card}>
          <div style={{ whiteSpace: "pre-line" }}>
            <b>{m.userName}:</b> {m.content}
          </div>
          <br />
          {/* conditionally show image*/}
          {m.s3Url && (
            <>
              <img style={{ maxWidth: "100%" }} src={m.s3Url} alt="m.s3Url" />
              <br />
            </>
          )}
          <div style={{ fontStyle: "italic" }}>
            {/* convert m.created_ts to format like May 5, 12:15 */}
            {new Date(m.created_ts).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      ))}

      <button
        onClick={() => {
          showCount.current = showCount.current + 5;
          handleRefresh();
        }}
      >
        Show me more...
      </button>
    </main>
  );
};

export default Home;
