import {useEffect} from "react";

import socket from  "../../../sockets"; 

const useRoomPresence = ({

    setOnlineUsers,
    setEditingUsers
}) => {

    useEffect (()=> {

        const handelOnlineUsersUpdate = (users) => {

            setOnlineUsers(users);

        };

        const handelNoteEditingUpdate = ({
            noteId,
            userId,
            isEditing
        }) => {

            setEditingUsers((prev) => {
                const updated = {...prev};

                if(isEditing){
                    updated[noteId] = userId;

                }
                else{
                    delete updated[noteId];
                }

                return updated ; 
            });

        };
        socket.on("online_users_update",handelOnlineUsersUpdate);
        socket.on("note_editing_update" ,handelNoteEditingUpdate);


        return () => {

            socket.off("online_users_update", handelOnlineUsersUpdate);

            socket.off("note_editing_update", handelNoteEditingUpdate);
        };

    }, [setEditingUsers,setOnlineUsers]);
};
export default useRoomPresence;

