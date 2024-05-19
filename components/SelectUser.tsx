import React, { useState } from 'react'
export function SelectUser(
    {onSetUserId}:
    {onSetUserId: (newUserId: number) => void}
) {

    const [userId, setUserId] = useState<string | null>(null)


    return <div>

    <div>Which user are you?</div>
    <div>enter your number</div>
    <input value={userId} onChange={e => setUserId(e.target.value)}></input>
    <button onClick={()=> onSetUserId(parseInt(userId))}>Hit</button>

    {userId}
    </div>
}

