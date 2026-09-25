import {useEffect} from 'react'; 
import socket , {connectionSocket, connectSocket} from "../../../sockets";

const UseRoomRealtime = ({roomId}) => {

    // when an component uses this hook the use effect block is trigred 


    useEffect(()=> { 

        connectSocket();

        socket.emit("join_room",roomId);

        return () => {

            socket.emit('leave_room',roomId);
        };
     // the return is a clean up function used when component disaappers off
     // screen or when roomId changes 



    },[roomId]);
};

export default UseRoomRealtime;
