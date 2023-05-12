import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { firebaseConfig } from "./constants.js";
import {
    getDatabase,
    ref,
    push,
    get,
    set,
    runTransaction,
    onValue,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

import {
    isValidated,
    showTaskPopup,
    hideTaskPopup,
    createTask,
    clearInput,
    handleTaskClick,
} from "./helper.js";

// Error

const taskInputError = document.getElementById("task-error");
const assigneeInputError = document.getElementById("assignee-error");
const deadlineInputError = document.getElementById("deadline-error");
const statusInputError = document.getElementById("status-error");

// form Buttons and Headings

const taskButton = document.getElementById("task-button");
const taskHeading = document.getElementById("task-heading");

// Popup div/form

const blurDiv = document.getElementById("blur-div");
const form = document.getElementById("form");

// Firebase

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const todoRef = ref(database, "todo");
const doingRef = ref(database, "doing");
const doneRef = ref(database, "done");
const currentIndexRef = ref(database, "currentIndex");
let todoData;
let doingData;
let doneData;
let currentIndex = 0;

get(currentIndexRef).then((snapshot) => {
    if (snapshot.exists()) {
        // The node already exists, so we leave it as it is
        console.log("currentIndex already exists:", snapshot.val());
    } else {
        set(currentIndexRef, 0);
    }
});

// Getting updated value on the database

onValue(currentIndexRef, (snapshot) => {
    currentIndex = snapshot.val();
    // console.log(currentIndex);
});

// get new task popup

const taskSidebar = document.getElementById("task-sidebar");
taskSidebar.addEventListener("click", () => {
    taskButton.innerText = "Add task";
    taskHeading.innerText = "Create new task";
    showTaskPopup(form, blurDiv);
});

blurDiv.addEventListener("click", () => {
    clearInput();
    hideTaskPopup(form, blurDiv);
});

document.getElementById("deadline-input").valueAsDate = new Date();

// On form submition

form.addEventListener("submit", (e) => {
    // Inputs
    const taskInputVal = document.getElementById("task-input").value;
    const assigneeInputVal = document.getElementById("assignee-input").value;
    const deadlineInputVal = document.getElementById("deadline-input").value;
    const statusInputVal = document.getElementById("status-input").value;

    const validated = isValidated(
        taskInputVal,
        assigneeInputVal,
        deadlineInputVal,
        statusInputVal,
        taskInputError,
        assigneeInputError,
        deadlineInputError,
        statusInputError
    );
    if (!validated) {
        e.preventDefault();
    } else {
        e.preventDefault();

        if (taskButton.innerText === "Add task") {
            runTransaction(currentIndexRef, (currentValue) => {
                const newValue = (currentValue || 0) + 1;
                return newValue;
            });

            let taskObj = {
                taskVal: taskInputVal,
                assigneeVal: assigneeInputVal,
                deadlineVal: deadlineInputVal,
                statusVal: statusInputVal,
                taskIndex: currentIndex,
            };
            if (statusInputVal === "todo") {
                push(todoRef, taskObj);
            } else if (statusInputVal === "doing") {
                push(doingRef, taskObj);
            } else if (statusInputVal === "done") {
                push(doneRef, taskObj);
            }
            hideTaskPopup(form, blurDiv);
            clearInput(
                taskInputVal,
                assigneeInputVal,
                deadlineInputVal,
                statusInputVal
            );
        }
    }
});

// getting values from firebase database

const todoContainer = document.getElementById("todo-container");
const doingContainer = document.getElementById("doing-container");
const doneContainer = document.getElementById("done-container");

onValue(todoRef, (snapshot) => {
    todoData = snapshot.val();
    if (todoData !== {}) {
        createTask(todoContainer, todoData);
    }
});
onValue(doneRef, (snapshot) => {
    doneData = snapshot.val();
    if (doneData !== {}) {
        createTask(doneContainer, doneData);
    }
});
onValue(doingRef, (snapshot) => {
    doingData = snapshot.val();
    if (doingData !== {}) {
        createTask(doingContainer, doingData);
    }
});

todoContainer.addEventListener("click", (event) => {
    handleTaskClick(
        event,
        todoRef,
        form,
        blurDiv,
        taskButton,
        taskHeading,
        taskInputError,
        assigneeInputError,
        deadlineInputError,
        statusInputError
    );
});

doingContainer.addEventListener("click", (event) => {
    handleTaskClick(
        event,
        doingRef,
        form,
        blurDiv,
        taskButton,
        taskHeading,
        taskInputError,
        assigneeInputError,
        deadlineInputError,
        statusInputError
    );
});
doneContainer.addEventListener("click", (event) => {
    handleTaskClick(
        event,
        doneRef,
        form,
        blurDiv,
        taskButton,
        taskHeading,
        taskInputError,
        assigneeInputError,
        deadlineInputError,
        statusInputError
    );
});

// if (items.doing !== []) {
//     doingContainer.addEventListener("click", (event) => {
//         handleTaskClick(
//             event,
//             "doing",
//             form,
//             blurDiv,
//             taskButton,
//             taskHeading,
//             taskInputError,
//             assigneeInputError,
//             deadlineInputError,
//             statusInputError
//         );
//     });
// }
// if (items.done !== []) {
//     doneContainer.addEventListener("click", (event) => {
//         handleTaskClick(
//             event,
//             "done",
//             form,
//             blurDiv,
//             taskButton,
//             taskHeading,
//             taskInputError,
//             assigneeInputError,
//             deadlineInputError,
//             statusInputError
//         );
//     });
// }
