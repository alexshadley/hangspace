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

  const currentUser = users.find((user) => user.id === userId);
  const username = currentUser?.name;

  useEffect(() => {
    // runs this function every 1s
    const id = setInterval(() => handleRefresh(), 1000);

    // not important
    return () => clearInterval(id);
  }, []);

  async function handleSubmit() {
    // const myDict = {a: 1, b: "hello!"}
    // JSON.stringify({a: 1})
    const formData = JSON.stringify({ userId: userId, message: message });
    await fetch(`/api/newPost`, { method: "POST", body: formData });
    setMessage("");
    handleRefresh();
  }

  async function handleRefresh() {
    var data = await fetch(`/api/refresh`, { method: "GET" });

    var msg = await data.json();
    setMessages(msg.messages);

  }

  //console.log([1, 2].map(v => v + 1))

  if (!userId) {
    return <SelectUser onSetUserId={(newVal) => setUserId(newVal)} />;
  }

  return (
    <main className={styles.main}>
      <h1>Hangspace!</h1>
      <h2>
        welcome user {userId} {username}
      </h2>
      {messages.map((m) => (
        <div>
          <b>{m.userName}:</b> {m.content} {m.created_ts}
        </div>
      ))}
      {/* onChange="funtion()";    */}
      <input
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      ></input>
      <button onClick={handleSubmit}> Send!</button>
    </main>
  );
};

export default Home;
