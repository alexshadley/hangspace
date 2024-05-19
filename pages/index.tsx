import React, { useState } from 'react'
import styles from '../styles/home.module.css'
import { InferGetServerSidePropsType } from 'next'
import {pgClient} from '../util/PgClient'

// getServerSideProps is a magic function name, next.js looks for it and does
// some special stuff: https://nextjs.org/docs/pages/building-your-application/data-fetching/get-server-side-props
export const getServerSideProps = async () => {
  // this postgres library seems dirt-simple :)
  const posts = await pgClient.query(`
    SELECT users.name, posts.content FROM posts
    JOIN users ON posts.user_id = users.id;
  `);

  return {props: {messages: posts.rows.map(r => 
    ({userName: r.name, content: r.content})
  )}}
}

const Home = ({
  messages,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [count, setCount] = useState(0)

  return (
    <main className={styles.main}>
      <h1>Hangspace!</h1>
      {messages.map(m => <div><b>{m.userName}:</b> {m.content}</div>)}
    </main>
  )
}

export default Home
