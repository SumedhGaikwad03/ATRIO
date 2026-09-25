import {useEffect} from "react";
import socket from "../../../sockets";

// we are taking all the note realted listeners out of room view 

const useNoteRealtime =({ setNotes}) => {

    useEffect(()=> {

       const handleNoteCreated = (note) => {
      setNotes((prev) => {
        // Avoid duplicates
        if (prev.some((n) => n._id === note._id)) {
          return prev;
        }

        // Replace optimistic note
        const optimisticNote = prev.find(
          (n) => n.isOptimistic && n.title === note.title
        );

        if (optimisticNote) {
          return prev.map((n) =>
            n._id === optimisticNote._id ? note : n
          );
        }

        return [note, ...prev];
      });
    };

const handelNoteUpdated = (note) => {

    setNotes((prev) => 
    prev.map((n) => (n._id === note._id ? note : n ))
);
};

const handelNoteDeleted = (noteId) => {

    setNotes((prev) => 
    prev.filter((n)=> n._id !== noteId )
);
};
socket.on("note_created", handleNoteCreated);
socket.on("note_deleted", handelNoteDeleted);
socket.on("note_updated" , handelNoteUpdated); 


return () => {

    socket.off("note_created", handleNoteCreated);
    socket.off("note_deleted", handelNoteDeleted);
    socket.off("note_updated", handelNoteUpdated);
};
    }, [setNotes]);
};

export default useNoteRealtime; 