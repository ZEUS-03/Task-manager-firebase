import { firebaseConfig } from "./constants.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";

import {
    onValue,
    set,
    update,
    getDatabase,
    ref,
    off,
    push,
    get,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const todoRef = ref(database, "todo");
const doingRef = ref(database, "doing");
const doneRef = ref(database, "done");

// show popup

export const showTaskPopup = (form, blurDiv) => {
    form.style.visibility = "visible";
    blurDiv.style.visibility = "visible";
};

export const hideTaskPopup = (form, blurDiv) => {
    form.style.visibility = "hidden";
    blurDiv.style.visibility = "hidden";
};

export const setValue = (parent, variable) => {
    onValue(parent, (snapshot) => {
        variable = snapshot.val();
    });
};

// clear Input

export const clearInput = () => {
    document.getElementById("deadline-input").valueAsDate = new Date();
    document.getElementById("task-input").value = "";
    document.getElementById("assignee-input").value = "";
    document.getElementById("status-input").selectedIndex = 0;
};

// form validation

export function isValidated(
    taskInputVal,
    assigneeInputVal,
    deadlineInputVal,
    statusInputVal,
    taskInputError,
    assigneeInputError,
    deadlineInputError,
    statusInputError
) {
    let flag = true;

    if (taskInputVal === "") {
        flag = false;
        taskInputError.innerText = "Task title can't be empty!";
    } else {
        taskInputError.innerText = "";
    }
    if (assigneeInputVal === "") {
        flag = false;
        assigneeInputError.innerText = "Assignee name can't be empty!";
    } else {
        assigneeInputError.innerText = "";
    }
    if (deadlineInputVal === "") {
        flag = false;
        deadlineInputError.innerText = "Please set a deadline!";
    } else {
        deadlineInputError.innerText = "";
    }
    if (statusInputVal === "") {
        flag = false;
        statusInputError.innerText = "Status can't be empty!";
    } else {
        statusInputError.innerText = "";
    }

    return flag;
}

// function handling creation of new task in UI

export const createTask = (container, items) => {
    container.innerHTML = "";
    for (let item in items) {
        // console.log(items[item].taskVal);
        const newTask = document.createElement("div");
        newTask.classList.add("tasks");
        const iconContainer = document.createElement("div");
        const newTitle = document.createElement("p");
        newTitle.innerText = items[item].taskVal;
        const editIcon = document.createElement("i");
        const trashIcon = document.createElement("i");
        trashIcon.setAttribute("id", items[item].taskIndex);
        editIcon.classList.add("fa-solid");
        editIcon.classList.add("fa-pen");
        editIcon.setAttribute("id", "edit" + items[item].taskIndex);
        trashIcon.classList.add("fa-solid");
        trashIcon.classList.add("fa-trash");
        iconContainer.appendChild(editIcon);
        iconContainer.appendChild(trashIcon);
        newTask.appendChild(newTitle);
        newTask.appendChild(iconContainer);
        container.appendChild(newTask);
    }
};

const shiftItems = (destinationRef, itemIndex, updated, taskContainerName) => {
    get(taskContainerName).then((snapshot) => {
        const item = snapshot.val();
        update(destinationRef, updated);
        delete item[itemIndex];
        set(taskContainerName, item);
    });
};

export const handleTaskClick = (
    event,
    taskContainerName,
    form,
    blurDiv,
    taskHeading,
    taskButton,
    taskInputError,
    assigneeInputError,
    deadlineInputError,
    statusInputError
) => {
    const clickedElement = event.target;
    const id = event.target.id;

    get(taskContainerName).then((snapshot) => {
        const getItem = snapshot.val();
        if (getItem !== null) {
            if (clickedElement.classList.contains("fa-trash")) {
                const filteredData = Object.entries(getItem);
                for (const [key, value] of filteredData) {
                    if (value.taskIndex == id) {
                        delete getItem[key];
                        break;
                    }
                }
                set(taskContainerName, getItem);
            } else if (clickedElement.classList.contains("fa-pen")) {
                const filteredData = Object.entries(getItem);
                for (const [key, value] of filteredData) {
                    if (id === "edit" + value.taskIndex) {
                        document.getElementById("task-input").value =
                            value.taskVal;
                        document.getElementById("assignee-input").value =
                            value.assigneeVal;
                        document.getElementById("deadline-input").value =
                            value.deadlineVal;
                        document.getElementById("status-input").value =
                            value.statusVal;
                        taskButton.innerText = "Edit task";
                        taskHeading.innerText = "Edit task";
                        showTaskPopup(form, blurDiv);
                        form.addEventListener("submit", (e) => {
                            if (taskButton.innerText === "Edit task") {
                                const taskInputVal =
                                    document.getElementById("task-input").value;
                                const assigneeInputVal =
                                    document.getElementById(
                                        "assignee-input"
                                    ).value;
                                const deadlineInputVal =
                                    document.getElementById(
                                        "deadline-input"
                                    ).value;
                                const statusInputVal =
                                    document.getElementById(
                                        "status-input"
                                    ).value;

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
                                    const updated = {
                                        taskVal: taskInputVal,
                                        assigneeVal: assigneeInputVal,
                                        deadlineVal: deadlineInputVal,
                                        statusVal: statusInputVal,
                                        taskIndex: value.taskIndex,
                                    };
                                    console.log(updated);

                                    delete getItem[key];
                                    getItem[key] = updated;
                                    set(taskContainerName, getItem);
                                    e.preventDefault();
                                }
                            }
                        });
                    }
                }
            }
        }
    });
};
