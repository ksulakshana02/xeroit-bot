// Define global variables
let chatHistory = [];
let messageDiv;
let chatWithAgent = false;
let chatTimeoutId;
let endChatAlertShown = false;
let formattedTime = "";
let intervalId;
let agentJoined = false;
let chatStatus = "bot";
let clientDetailsSubmitStatus = false;

let userData = {};
let onLoadPage = true;
let showFormOneTime = false;


// show opening time function
function setFormattedOpenedTime() {
    const OpenedTime = new Date();
    let Opendhours = OpenedTime.getHours();
    const Openedminutes = OpenedTime.getMinutes().toString().padStart(2, "0");
    const Openedseconds = OpenedTime.getSeconds().toString().padStart(2, "0");
    const Openedampm = Opendhours >= 12 ? "PM" : "AM";
    Opendhours = Opendhours % 12;
    Opendhours = Opendhours ? Opendhours : 12;
    const formattedOpenedTime = `${Opendhours.toString().padStart(
        2,
        "0"
    )}:${Openedminutes} ${Openedampm}`;

    document.getElementById("OpenedTime1").textContent = formattedOpenedTime;
    // document.getElementById("OpenedTime1Form").textContent = formattedOpenedTime;
}

// set time - all the visible time manage
const currentTime = new Date();
let hours = currentTime.getHours();
const minutes = currentTime.getMinutes().toString().padStart(2, "0");
const seconds = currentTime.getSeconds().toString().padStart(2, "0");
const ampm = hours >= 12 ? "PM" : "AM";
hours = hours % 12;
hours = hours ? hours : 12;
formattedTime = `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;

setFormattedOpenedTime();

// Event listener - clear sessionStorage items on browser refresh
window.addEventListener("beforeunload", function (event) {
    sessionStorage.removeItem("selectedLanguage");
    sessionStorage.removeItem("chatId");
});

// Function - show typing animation
function showTypingAnimation() {
    const responseDiv = document.getElementById("response");
    const typingMessage = document.createElement("div");
    typingMessage.classList.add("bot-message");
    typingMessage.innerHTML = `
              <div class="typing-animation typingmsg-wrapper">
                  <i class="bi bi-three-dots loading typing-msg"></i>
              </div>
              `;
    responseDiv.appendChild(typingMessage);
    responseDiv.scrollTop = responseDiv.scrollHeight;
}

// Function - hide typing animation
function hideTypingAnimation() {
    const typingMessage = document.querySelector(".typing-animation");
    if (typingMessage) {
        typingMessage.remove();
    }
}


function updatePlaceholder() {
    const questionInput = document.getElementById("question");
    const assistantText = document.querySelector(".assistant-name");
    const statusText = document.querySelector(".assistant-status");
    assistantText.textContent = "JN Marketing Strategy Assistant";
    statusText.textContent = "Online";
    questionInput.placeholder = "Type a message here...";
}


window.addEventListener("storage", function (event) {
    if (event.key === "selectedLanguage") {
        updatePlaceholder();
    }
});


// Function - handle error messages
function handleErrorMessage(error) {
    const responseDiv = document.getElementById("response");
    // const chatLang = sessionStorage.getItem("selectedLanguage");
    responseDiv.innerHTML = "<p class='error-message'>The allocated number of tokens are over, please ask the administrator to add more tokens to the system.</p>";
}


// Function - start chat timeout 150000 (if user didn't interact within 2.5 minutes )
function startChatTimeout() {
    chatTimeoutId = setTimeout(showEndChatAlert, 150000);
}

// Function - reset chat timeout
function resetChatTimeout() {
    clearTimeout(chatTimeoutId);
    startChatTimeout();
}

// Alert - handle chat end
function showEndChatAlert() {
    // const chatLanguage = sessionStorage.getItem("selectedLanguage");
    const messageYes = "Yes";
    const messageCancel = "Cancel";
    const messageInactive =  "Are you sure you want to close this chat? Do you want to end the chat?";
    if (!endChatAlertShown) {
        endChatAlertShown = true;

        const responseDiv = document.getElementById("response");
        const alertDiv = document.createElement("div");
        alertDiv.classList.add(
            "alert",
            "alert-warning",
            "alert-dismissible",
            "fade",
            "show"
        );
        alertDiv.setAttribute("role", "alert");
        alertDiv.innerHTML = `
    ${messageInactive}
                <div class="d-flex flex-row">
                  <button type="button" class="btnYesToClose closeratingbot" onclick="handleEndChatBot()">${messageYes}</button>
                  <button type="button" class="btnNotoClose ms-2" data-bs-dismiss="alert">${messageCancel}</button>
                </div>
            `;
        responseDiv.appendChild(alertDiv);
        alertDiv.scrollIntoView({behavior: "smooth"});
    }
}

// Alert - handle chat end for live agent
function showEndChatAlertAgent() {
    // const chatLanguage = sessionStorage.getItem("selectedLanguage");
    const messageYes = "Yes";
    const messageCancel = "Cancel";
    const messageEndChat = "Are you sure you want to close this chat? Do you want to end the chat?";

    if (!endChatAlertShown) {
        endChatAlertShown = true;

        const responseDiv = document.getElementById("response");
        const alertDiv = document.createElement("div");
        alertDiv.classList.add(
            "alert",
            "alert-warning",
            "alert-dismissible",
            "fade",
            "show"
        );
        alertDiv.setAttribute("role", "alert");
        alertDiv.innerHTML = `
                ${messageEndChat}
                <div class="d-flex flex-row">
                  <button type="button" class="btnYesToClose btn-end-chat closeRateAgent" onclick="handleEndChat()">${messageYes}</button>
                  <button type="button" class="btnNotoClose ms-2" data-bs-dismiss="alert">${messageCancel}</button>
                </div>
            `;
        responseDiv.appendChild(alertDiv);
        alertDiv.scrollIntoView({behavior: "smooth"});
    }
}

// Alert - handle chat end for chat bot
function showEndChatAlertBot() {
    // const chatLanguage = sessionStorage.getItem("selectedLanguage");

    const messageYes ="Yes";
    const messageCancel = "Cancel";
    const messageEndChat = "Are you sure you want to close this chat? Do you want to end the chat?";

    if (!endChatAlertShown) {
        endChatAlertShown = true;

        const responseDiv = document.getElementById("response");
        const alertDiv = document.createElement("div");
        alertDiv.classList.add(
            "alert",
            "alert-warning",
            "alert-dismissible",
            "fade",
            "show"
        );
        alertDiv.setAttribute("role", "alert");

        alertDiv.innerHTML = `
                ${messageEndChat}
                <div class="d-flex flex-row">
                  <button type="button" class="btnYesToClose abc btn-end-chat" onclick="handleEndChatBot()" >${messageYes}</button>
                  <button type="button" class="btnNotoClose ms-2" data-bs-dismiss="alert">${messageCancel}</button>
                </div>
            `;
        responseDiv.appendChild(alertDiv);
        alertDiv.scrollIntoView({behavior: "smooth"});
    }
}

// Function - start rating
function handleEndChatBot() {
    sendUnsubmittedLeadData();
    sessionStorage.setItem("leadSubmitted", "true");
    chatLanguage = sessionStorage.getItem("selectedLanguage");
    showAlertSuccess("Thank you for chat with us..");
}


// Function - handle ending the chat
function handleEndChat() {
    clearTimeout(chatTimeoutId);
    // const chatLang = sessionStorage.getItem("selectedLanguage");
    const message = "Please rate your chat experience:";
    appendMessageToResponse("bot", message, null, true);
}


// Function - append message to response div
function appendMessageToResponse(role, content, data, isRatingForm = false) {
    const responseDiv = document.getElementById("response");

    content = content.replace(/\*\*(.*?)\*\*/g, "$1");

    const messageDiv = createMessageDiv(isRatingForm ? "rate" : role, content);
    const image = createMessageImage(isRatingForm ? "rate" : role);

    if (isList(content)) {
        appendListContent(messageDiv, content);
    } else if (
        content.includes("We will provide you with the requested information within the next 24 hours. In the meantime, please provide your contact information so we can contact you if necessary.") ||
        content.includes("The marketing agent will be selected. An expert will contact you within the next 24 hours.")
    ) {
        const existingData = sessionStorage.getItem("userData");

        if (existingData) {
            messageDiv.innerHTML = `
      <div class="messageWrapper">
        <span class="botname-message">${new Date().toLocaleTimeString()}</span>
        <div class="d-flex flex-column">
          ${content}
          <textarea placeholder="Your message" id="message" class="mb-2 p-1 formLegalCRM"></textarea>
          <button id="LiveAgentButton" class="liveagentBtn">Submit</button>
        </div>
      </div>`;

            const button = messageDiv.querySelector("#LiveAgentButton");
            button.addEventListener("click", () => {
                const message = messageDiv.querySelector("#message").value;
                const parsedUserData = JSON.parse(existingData);

                sessionStorage.setItem("leadData", JSON.stringify({
                    ...parsedUserData,
                    description: message,
                }));

                sendLeadDataToAPI();


            });
        } else {
            fillAllDataForm(messageDiv, content, data);
        }
    } else {
        appendPlainTextContent(messageDiv, content);
    }

    if (isRatingForm) {
        // appendRatingForm(messageDiv);
        const chatId = sessionStorage.getItem("chatId");
        appendRatingForm(messageDiv, chatId);
    }

    resetChatTimeout();

    messageDiv.prepend(image);
    responseDiv.appendChild(messageDiv);
    responseDiv.scrollTop = responseDiv.scrollHeight;
}

function createMessageDiv(role, content) {
    const messageDiv = document.createElement("div");

    // Add class based on the role
    if (role === "user") {
        messageDiv.classList.add("user-message");
    } else if (role === "bot") {
        messageDiv.classList.add("bot-message");
    } else if (role === "product") {
        messageDiv.classList.add("product-message");
    } else if (role === "quickQuestion") {
        messageDiv.classList.add("user-message");
    } else if (role === "quickAnswer") {
        messageDiv.classList.add("bot-message");
    } else if (role === "liveagent") {
        messageDiv.classList.add("bot-message");
    } else if (role === "rate") {
        messageDiv.classList.add("rate-message");
    }

    messageDiv.textContent = content;

    return messageDiv;
}

// Function - handle image based on role
function createMessageImage(role) {
    const image = document.createElement("img");
    image.classList.add("message-image");
    image.src = role === "user" ? "/user.webp" : "/agent.png";
    return image;
}

// Function - handle list view (chat bot)
function isList(content) {
    const listRegex = /^\d+\.\s.*$/gm;
    return listRegex.test(content);
}

function appendListContent(messageDiv, content) {
    const listItems = content
        .split("\n")
        .map((item) => `<li style="margin-bottom: 10px !important;">${item}</li>`)
        .join("");
    messageDiv.innerHTML = `<div class="messageWrapper">
      <span class="botname-message">${formattedTime}</span>
      <div>
        <ul style="list-style: none; padding: 0px !important">${listItems}</ul>
      </div>
    </div>`;
}


function fillAllDataForm(messageDiv, content, data) {
    console.log("hi")
}

function fillAllDataFormOnLoad(messageDiv, content, data) {
    console.log("hi")
}

let payloadSent = false;

async function sendLeadDataToAPI() {
    const leadData = JSON.parse(sessionStorage.getItem("leadData"));
    // const chatLang = sessionStorage.getItem("selectedLanguage");
    const chatLang = sessionStorage.getItem("selectedLanguage") || "Spanish";
    const leadValue = 0;

    const phonePattern = /^[0-9]{10}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const phoneErrorMessage = "Please enter a valid phone number (10 digits).";

    const emailErrorMessage ="Please enter a valid email address.";

    const successMessage = "Prospect created successfully!";

    const genericErrorMessage = "An error occurred. Please try again later.";

    if (!leadData || !phonePattern.test(leadData.phone)) {
        showAlert(phoneErrorMessage);
        return;
    }

    if (!emailPattern.test(leadData.email)) {
        showAlert(emailErrorMessage);
        return;
    }

    // const payload = {
    //   ...leadData,
    //   lead_value: leadValue
    // };

    const category = leadData.description && leadData.description.trim() !== "" ? "qualified" : "normal";

    const payload = {
        ...leadData,
        lead_value: leadValue,
        category: category
    };


    console.log("Payload to be sent:", payload);

    try {
        const response1 = await fetch("https://projects.genaitech.dev/laravel-crm/api/create-lead", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const responseData1 = await response1.json();
        console.log("API 1 response:", responseData1);

        const response2 = await fetch("https://sites.techvoice.lk/crm-xeroit/api/create-lead", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const responseData2 = await response2.json();
        console.log("API 2 response:", responseData2);

        if (responseData1.status === "success") {
            sessionStorage.setItem("leadSubmitted", "true");
            clientDetailsSubmitStatus = true;
            showAlertSuccess(successMessage);
            clearFormFields();
            payloadSent = true;


        } else {
            const clientCreationErrorMessage = "Error creating prospect: " + responseData1.message;
            showAlert(clientCreationErrorMessage);
        }
    } catch (error) {
        console.error("Error sending lead data:", error);
        // showAlert(genericErrorMessage);
    }
}

function clearFormFields() {
    const form = document.querySelector("form");
    if (form) {
        form.querySelector("#title").value = '';
        form.querySelector("#email").value = '';
        form.querySelector("#phone").value = '';
        form.querySelector("#message").value = '';
    }
}

async function chatCloseByUser() {
    console.log("Chat bot doesn't have rating...");
    showEndChatAlertBot();
}

function sendUnsubmittedLeadData() {
    const isSubmitted = sessionStorage.getItem("leadSubmitted") === "true";
    const userData = sessionStorage.getItem("userData");

    if (!isSubmitted && userData) {
        const payload = {
            ...JSON.parse(userData),
            lead_value: 0,
            category: "normal"
        };

        const blob = new Blob([JSON.stringify(payload)], {
            type: "application/json"
        });

        navigator.sendBeacon(
            "https://projects.genaitech.dev/laravel-crm/api/create-lead",
            blob
        );

        navigator.sendBeacon(
            "https://sites.techvoice.lk/crm-xeroit/api/create-lead",
            blob
        );

        console.log("Unsubmitted lead sent to both APIs on chat close.");
    }
}


function appendPlainTextContent(messageDiv, content) {
    messageDiv.innerHTML = `<div class="messageWrapper">
                              <span class="botname-message">${formattedTime}</span>
                              <div>
                              <p class="mb-0">${content}</p>
                              </div>
                          </div>`;
}


window.addEventListener("beforeunload", function (e) {
    const isSubmitted = sessionStorage.getItem("leadSubmitted") === "true";
    const userData = sessionStorage.getItem("userData");

    if (!isSubmitted && userData) {
        const payload = {
            ...JSON.parse(userData),
            lead_value: 0,
            category: "normal"
        };

        console.log("before close: ", payload);

        const blob = new Blob([JSON.stringify(payload)], {
            type: "application/json"
        });

        navigator.sendBeacon(
            "https://projects.genaitech.dev/laravel-crm/api/create-lead",
            blob
        );

        navigator.sendBeacon(
            "https://sites.techvoice.lk/crm-xeroit/api/create-lead",
            blob
        );
    }
});


// ===============================================
// ================ alert apend to chat =======================
// ===============================================
function showAlert(message) {
    const responseDiv = document.getElementById("response");
    const alertDiv = document.createElement("div");
    alertDiv.classList.add(
        "alert",
        "alert-warning",
        "alert-dismissible",
        "fade",
        "show",
        "me-2"
    );
    alertDiv.setAttribute("role", "alert");
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
    responseDiv.appendChild(alertDiv);
    alertDiv.scrollIntoView({behavior: "smooth"});
}


// ===============================================
// ================ success alert append to chat =======================
// ===============================================
function showAlertSuccess(message) {
    const responseDiv = document.getElementById("response");
    const alertDiv = document.createElement("div");
    alertDiv.classList.add(
        "alert",
        "alert-success",
        "alert-dismissible",
        "fade",
        "show",
        "me-2"
    );
    alertDiv.setAttribute("role", "alert");
    alertDiv.innerHTML = `
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
    responseDiv.appendChild(alertDiv);
    alertDiv.scrollIntoView({behavior: "smooth"});
}


// ===============================================
// ================ language change message append to chat =======================
// ===============================================
function appendLanguageMessage(content) {
    const responseDiv = document.getElementById("response");
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("bot-message");

    const image = document.createElement("img");
    image.classList.add("message-image");
    image.src = "/agent.png";

    messageDiv.innerHTML = `<div class="messageWrapper">
      <span class="botname-message">${formattedTime}</span>
      <div>
        <p class="mb-0">${content}</p>
      </div>
    </div>`;
    messageDiv.prepend(image);

    responseDiv.appendChild(messageDiv);
    responseDiv.scrollTop = responseDiv.scrollHeight;
}


// ===============================================
// ================ chat  =======================
// ===============================================
document
    .getElementById("questionForm")
    .addEventListener("submit", async function (event) {
        event.preventDefault();
        const questionInput = document.getElementById("question");
        const question = questionInput.value;

        const selectedLanguageLocal = sessionStorage.getItem("selectedLanguage");
        chatHistory.push({role: "user", content: question});

        appendMessageToResponse("user", question);

        console.log("selected Language:", selectedLanguageLocal);

        let chatId = sessionStorage.getItem("chatId");
        const requestBody = {
            chatId: chatId,
            messages: chatHistory,
            language: selectedLanguageLocal || "Spanish",
            clientDetailsSubmitStatus: clientDetailsSubmitStatus
        };

        if (chatWithAgent === false) {
            const submitButton = document.querySelector(".chat-submit-button");
            submitButton.innerHTML = '<i class="bi bi-three-dots loading"></i>';
            submitButton.disabled = true;

            document.getElementById("startRecording").style.display = "none";
            document.getElementById("questionForm").style.width = "100%";

            try {
                questionInput.value = "";
                const response = await fetch("/chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                });

                const data = await response.json();

                chatHistory = data.chatHistory || [];

                if (!sessionStorage.getItem("chatId")) {
                    sessionStorage.setItem("chatId", data.chatId);
                    console.log("id: ", data.chatId);
                }
                if (data.answer !== null) {
                    appendMessageToResponse("bot", data.answer, data);

                    if (showFormOneTime === false) {
                        const messageDiv = document.createElement("div");
                        document.getElementById("response").appendChild(messageDiv);
                        const data = {};
                        showFormOnChatLoad(messageDiv, data);
                        showFormOneTime = true;
                    }
                }

                document.getElementById("startRecording").style.display = "block";
                document.getElementById("questionForm").style.width = "100%";
            } catch (error) {
                console.error("Error submitting question:", error);
                handleErrorMessage(error);
            } finally {
                questionInput.disabled = false;
                submitButton.innerHTML = '<i class="bi bi-send-fill"></i>';
                submitButton.disabled = false;
            }
        } else {
            const responseLiveAgent = await fetch("/live-chat-user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBodyAgent),
            });

            const liveAgentData = await responseLiveAgent.json();
            chatHistory = liveAgentData.chatHistory || [];
        }
    });


// ===============================================
// ================ language event listners =======================
// ===============================================
document
    .getElementById("changeToEnglishButton")
    .addEventListener("click", function () {
        sessionStorage.setItem("selectedLanguage", "English");
        appendLanguageMessage("Please ask your question in English.");
        updatePlaceholder();

        const messageDiv = document.createElement("div");
        document.getElementById("response").appendChild(messageDiv);
        const data = {};
        showFormOnChatLoad(messageDiv, data);
    });

document
    .getElementById("changeToSpanishButton")
    .addEventListener("click", function () {
        sessionStorage.setItem("selectedLanguage", "Spanish");
        appendLanguageMessage("Por favor haga su pregunta en español.");
        updatePlaceholder();

        const messageDiv = document.createElement("div");
        document.getElementById("response").appendChild(messageDiv);
        const data = {};
        showFormOnChatLoad(messageDiv, data);
    });


document.addEventListener("DOMContentLoaded", () => {
    const isLiveChat = sessionStorage.getItem("chatWithAgent") === "true";
    if (isLiveChat) {
        const messageDiv = document.getElementById("response");
        const content = "Please fill in the form below to get connected with a live agent.";

        // fillAllDataForm(messageDiv, content, {});
    }
});


// window.onload = function() {
//   console.log("Page has loaded!");
//   const messageDiv = document.getElementById("response");
//     const data = {};
//   showFormOnChatLoad(messageDiv, data);
// };

function showFormOnChatLoad(messageDiv, data) {
    const userData = sessionStorage.getItem("userData");
    if (!userData) {
        // const chatLang = sessionStorage.getItem("selectedLanguage");
        const initialPrompt = `Please share your contact information, or feel free to continue chatting if you’d like to provide more details. \n
Help Us Serve You Better: Your Details`;

        if (showFormOneTime === false) {
            fillAllDataFormOnLoad(messageDiv, initialPrompt, data);
            showFormOneTime = true
        }

        onLoadPage = false;
    }
}
