import { useState } from "react"
import { LoginButton } from "../components/LoginButton"

function HomePage() {
  const [id, setId] = useState("")
  const [input, setInput] = useState("")

  async function getGroups() {
    const data = await fetch("/api/groups", {
      method: "get",
    }).then((res) => res.json())

    console.log(data)
  }

  async function createGroup() {
    const data = await fetch("/api/groups", {
      method: "post",
      body: JSON.stringify({
        title: input,
      }),
    }).then((res) => res.json())

    console.log(data)
  }

  async function getGroup() {
    const data = await fetch(`/api/groups/${id}`, {
      method: "get",
    }).then((res) => res.json())

    console.log(data)
  }

  async function deleteGroup() {
    const data = await fetch(`/api/groups/${id}`, {
      method: "delete",
    })
      .then((res) => res.json())
      .catch((error) => error)

    console.log(data)
  }

  async function updateGroup() {
    const data = await fetch(`/api/groups/${id}`, {
      method: "put",
      body: JSON.stringify({
        title: input,
      }),
    })
      .then((res) => res.json())
      .catch((error) => error)

    console.log(data)
  }

  async function createWishlist() {
    const data = await fetch("/api/wishlists", {
      method: "post",
      body: JSON.stringify({
        title: input,
        groups: id.split(","),
      }),
    }).then((res) => res.json())

    console.log(data)
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "15px",
        maxWidth: "400px",
        marginInline: "auto",
      }}
    >
      <input
        value={id}
        onChange={(event) => setId(event.target.value)}
        placeholder="ID"
      />
      <input
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Input"
      />
      <button onClick={getGroups}>Get groups</button>
      <button onClick={getGroup}>Get group</button>
      <button onClick={createGroup}>Create group</button>
      <button onClick={deleteGroup}>Delete group</button>
      <button onClick={updateGroup}>Update group</button>
      <button onClick={createWishlist}>Create wishlist</button>
      Hello, World! <LoginButton />
    </div>
  )
}

export default HomePage
