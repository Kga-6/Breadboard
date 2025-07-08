// export const liveblocksBibleRoomHandler = onRequest(async (request, response) => {
//     let event;
  
//     try {
//       try {
//         event = webhookHandler.verifyRequest({
//           headers: request.headers,
//           rawBody: JSON.stringify(request.body),
//         });
//       } catch (error) {
//         console.error("Webhook verification failed:", error);
//         response.status(400).send("Webhook verification failed.");
//         return;
//       }
  
//       if (!event) {
//         console.error("No event received from Liveblocks.");
//         response.status(400).send("No event received from Liveblocks.");
//         return;
//       }
  
//       console.log(`Received event: ${event.type}`);
  
  
//       if (event.type === "userLeft") {
//         const { roomId, userId } = event.data;
//         const ownerId = roomId.replace("bible:", "");
  
//         if (userId === ownerId){
//           console.log(`Owner ${ownerId} has left their Bible Room. Closing the room.`);
          
//           const activeUsersUrl = `https://api.liveblocks.io/v2/rooms/${roomId}/active_users`;
  
//           try {
//             // 2. Get all users currently in the room from the Liveblocks API
//             const usersResponse = await fetch(activeUsersUrl, {
//               headers: { Authorization: `Bearer ${liveblocksSecretKey}` },
//             });
//             console.log(`We got here 1`);
  
//             if (!usersResponse.ok) {
//               throw new Error(`Failed to get users from Liveblocks room: ${roomId}`);
//             }
//             console.log(`We got here 2`);
  
//             const roomData = await usersResponse.json() as { data: { id: string }[] };
//             const userIdsInRoom = [...new Set(roomData.data.map(user => user.id))];
  
//             console.log(`We got here 3`, userIdsInRoom);
//             console.log(`We got here 3`, roomData);
  
//             // 3. Create promises to kick every remaining user
//             const kickPromises = userIdsInRoom
//               .filter(id => id !== ownerId)
//               .map(async (userIdToKick) => { // Make the map function async
//                 const kickUrl = `https://api.liveblocks.io/v2/rooms/${roomId}/users/${userIdToKick}/access`;
//                 try {
//                   const kickResponse = await fetch(kickUrl, {
//                     method: "DELETE",
//                     headers: { Authorization: `Bearer ${liveblocksSecretKey}` },
//                   });
                  
//                   if (!kickResponse.ok) {
//                     // Log an error if a specific user kick fails
//                     console.error(`Failed to kick user ${userIdToKick}. Status: ${kickResponse.status}`);
//                   } else {
//                     console.log(`Successfully kicked user ${userIdToKick}.`);
//                   }
//                 } catch (error) {
//                   console.error(`Error during fetch for kicking user ${userIdToKick}:`, error);
//                 }
//               });
  
//             console.log(`We got here 4`);
//             // 4. Create a promise to update the owner's document in Firestore
//             const ownerRef = db.collection("users").doc(ownerId);
//             const firestorePromise = ownerRef.update({
//               "bibleRoom.sharing": false,
//               //"bibleRoom.invited": [],
//             });
  
//             console.log(`We got here 5`);
  
//             // 5. Execute all kicking and Firestore operations concurrently
//             await Promise.all([...kickPromises, firestorePromise]);
  
//             console.log(`Successfully closed room ${roomId} and reset owner's sharing status.`);
  
//           } catch (error) {
//             console.error(`Error processing owner-left event for room ${roomId}:`, error);
//             response.status(200).send("Acknowledged, but internal error occurred.");
//             return;
//           }
//         }
//       }
  
//       // if (event.type === "userEntered") {
//       //   const { roomId, userId } = event.data;
//       //   console.log(`User ${userId} entered room ${roomId}`);
//       // }
  
  
//     } catch (error) {
//       console.error(error);
//       response.status(400).end();
//       return;
//     }
  
//     response.status(200).end();
//     return;
//   });