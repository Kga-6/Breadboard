export default async function FriendDetails({
    params,
}:{
    params: Promise<{friendId: string}>;
}){
    const friendId = (await params).friendId
    return <h1>Friend detail {friendId}</h1>
}