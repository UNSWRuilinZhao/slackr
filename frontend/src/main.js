// import { BACKEND_PORT } from "./config.js";
// // A helper you may want to use when uploading new images to the server.
// import { fileToDataUrl } from "./helpers.js";

var loginId = localStorage.getItem("loginId");
var del = document.getElementById("del");
var join = document.getElementById("join");
var dataDetails = {};
const messagesContainer = document.getElementById("messagesContainer");

const error = document.getElementById("change-error");
const errorText = document.getElementById("error-message");

function loginUser(event) {
  event.preventDefault(); // 阻止默认点击行为
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const apiCall = (path, body) => {
    fetch("http://localhost:5005/" + path, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          error.style.display = "block";
          errorText.innerText = data.error;
        } else {
          localStorage.setItem("token", data.token);
          localStorage.setItem("loginId", data.userId);
          displayChannels();
          document.getElementById("login").style.display = "none";
          document.getElementById("main").style.display = "block";
        }
      });
  };
  apiCall("auth/login", { email, password });
}
function showRegistration() {
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("registrationForm").style.display = "block";
}

function registerUser() {
  const email = document.getElementById("regEmail").value;
  const name = document.getElementById("regName").value;
  const password = document.getElementById("regPassword").value;
  const confirmPassword = document.getElementById("regConfirmPassword").value;

  const loginForm = document.getElementById("loginForm");

  const register = document.getElementById("registrationForm");

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  } else {
    const apiCall = (path, body) => {
      fetch("http://localhost:5005/" + path, {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            error.style.display = "block";
            errorText.innerText = data.error;
          } else {
            register.style.display = "none";
            loginForm.style.display = "block";
          }
        });
    };

    apiCall("auth/register", { email, password, name });
  }

  // Use the apiCall function similar to loginUser to send registration details
}

// Function to fetch and display channels
function displayChannels() {
  const channelsContainer = document.getElementById("channelsContainer");

  channelsContainer.innerText = "";
  // Use the appropriate API endpoint to fetch channels (you might need to adjust the URL)
  fetch("http://localhost:5005/channel", {
    method: "GET",
    headers: {
      Authorization: localStorage.getItem("token"),
      "Content-type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      data.channels.forEach((channel) => {
        const channelElement = document.createElement("div");
        channelElement.textContent = "# " + channel.name;
        if (channel.members.length == 0) {
          channelElement.style.display = "none";
        }

        const uniqueId = channel.id;

        // 为频道元素添加唯一的 ID
        channelElement.setAttribute("id", uniqueId);

        channelElement.addEventListener("mousedown", function (event) {
          if (event.button === 0 && event.buttons === 1) {
            // 左键单击
            localStorage.setItem(
              "delChannelID",
              channelElement.getAttribute("id")
            );

            displayChannelDetails(channel.id);

            const parameter = "channels=" + channelElement.getAttribute("id");

            // 将参数添加到 URL 的哈希部分
            window.location.hash = parameter;
          }
        });

        channelElement.addEventListener("contextmenu", function (event) {
          event.preventDefault(); // 阻止默认行为
          localStorage.setItem(
            "delChannelID",
            channelElement.getAttribute("id")
          );
          getChannelDetails(channel.id);

          const parameter = "channels=" + channelElement.getAttribute("id");
          // 将参数添加到 URL 的哈希部分
          window.location.hash = parameter;
          // 在这里执行您想要的操作
          const box = document.getElementById("channels-control");
          box.style.left = event.clientX + "px";
          box.style.top = event.clientY + "px";
          box.style.display = "block";
        });

        // console.log(channelElement);

        channelsContainer.appendChild(channelElement);
        // console.log(channelsContainer);
      });
    });
}

// This function can be expanded to fetch and display details of a specific channel
function displayChannelDetails(channelId) {
  fetch(`http://localhost:5005/channel/${channelId}/join`, {
    method: "POST",
    headers: {
      Authorization: localStorage.getItem("token"),
      "Content-type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error == "You cannot join a private channel") {
        error.style.display = "block";
        errorText.innerText = data.error;
      } else {
        getChannelDetails(channelId);
        control.style.display = "none";

        getMessage(channelId, 0);
        scrollToBottom();
      }
    });
}

function getChannelDetails(channelId) {
  fetch(`http://localhost:5005/channel/${channelId}`, {
    method: "GET",
    headers: {
      Authorization: localStorage.getItem("token"),
      "Content-type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        del.style.display = "none";
        join.style.display = "block";

        // alert(data.error);
      } else {
        del.style.display = "block";
        join.style.display = "none";
        var header = document.getElementById("right-header");
        header.innerHTML = "# " + data.name;
        localStorage.setItem("channelsDetails", JSON.stringify(data));
      }
    });
}

// Determine if it is in login status
if (localStorage.getItem("token")) {
  document.getElementById("login").style.display = "none";
  document.getElementById("main").style.display = "block";
  displayChannels();
}

// create channels
const create = document.getElementById("create-channels");
function closeChannels(params) {
  if (params == 2) {
    const name = document.getElementById("create-name").value;
    const description = document.getElementById("create-description").value;
    const private = document.querySelector(
      'input[name="choice"]:checked'
    ).value;

    const apiCall = (path, body) => {
      fetch("http://localhost:5005/" + path, {
        method: "POST",
        headers: {
          Authorization: localStorage.getItem("token"),
          "Content-type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            error.style.display = "block";
            errorText.innerText = data.error;
          } else {
            displayChannels();
          }
        });
    };

    apiCall("channel", { name, private, description });
  }

  create.style.display = "none";
}

function OpenCreate() {
  create.style.display = "block";
}

// channels deatails
const deatails = document.getElementById("create-deatails");
const control = document.getElementById("channels-control");

const user = document.getElementById("create-userDetail");
function closeDetails(params) {
  deatails.style.display = "none";
  user.style.display = "none";
}

function openDetails(params) {
  control.style.display = "none";
  fetch(
    `http://localhost:5005/channel/${localStorage.getItem("delChannelID")}`,
    {
      method: "GET",
      headers: {
        Authorization: localStorage.getItem("token"),
        "Content-type": "application/json",
      },
    }
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        error.style.display = "block";
        errorText.innerText = data.error;
      } else {
        deatails.style.display = "block";
        var editList = document.querySelectorAll(".detail-edit");
        if (data.creator == loginId) {
          editList.forEach((item) => {
            item.style.display = "block";
          });
        } else {
          editList.forEach((item) => {
            item.style.display = "none";
          });
        }

        var title = document.getElementById("title");
        var title1 = document.getElementById("title1");
        var description = document.getElementById("Description");
        var private = document.getElementById("Private");
        var nameDate = document.getElementById("by-name");
        title.innerHTML = "# " + data.name;
        title1.innerHTML = data.name;
        description.innerHTML = data.description;
        private.innerHTML = data.private;

        fetch(`http://localhost:5005/user/${data.creator}`, {
          method: "GET",
          headers: {
            Authorization: localStorage.getItem("token"),
            "Content-type": "application/json",
          },
        })
          .then((response) => response.json())
          .then((data1) => {
            if (data1.error) {
              error.style.display = "block";
              errorText.innerText = data1.error;
            } else {
              nameDate.innerHTML =
                data1.name + " by " + handleTime(data.createdAt);
            }
          });
      }
    });
}

const changeDeatails = document.getElementById("change-details");
var addInput = document.getElementById("add-value");
let valueAdd = "";
addInput.addEventListener("input", (event) => {
  const getUser = document.getElementById("getUser");
  valueAdd = event.target.value;

  console.log(valueAdd.length);
  if (valueAdd.length === 5) {
    fetch(`http://localhost:5005/user/${valueAdd}`, {
      method: "GET",
      headers: {
        Authorization: localStorage.getItem("token"),
        "Content-type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          error.style.display = "block";
          errorText.innerText = data.error;
        } else {
          getUser.innerText = "userName: " + data.name;
        }
      });
  }
});

function changeDetails(params) {
  changeDeatails.style.display = "block";
  var name = document.getElementById("re-name");
  var changeInput = document.getElementById("change-value");

  var deOne = document.getElementById("deOne");
  var deTow = document.getElementById("deTow");

  addInput.style.display = "block";
  changeInput.style.display = "block";
  deOne.style.display = "block";
  deTow.style.display = "block";
  if (params == 1) {
    name.innerHTML = "Rename this channel";
    localStorage.setItem("change", 1);
    addInput.style.display = "none";
    deTow.style.display = "none";
  } else if (params == 2) {
    name.innerHTML = "Edit description";
    localStorage.setItem("change", 2);
    addInput.style.display = "none";
    deTow.style.display = "none";
  } else if (params == 3) {
    name.innerHTML = "Add people";
    changeInput.style.display = "none";
    deOne.style.display = "none";

    fetch(`http://localhost:5005/user`, {
      method: "PUT",
      headers: {
        Authorization: localStorage.getItem("token"),
        "Content-type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          error.style.display = "block";
          errorText.innerText = data.error;
        } else {
          console.log("123");
        }
      });
  }
}

function closeChangeDetails() {
  var change = document.getElementById("change-value");
  var changeUser = document.getElementById("change-user");
  const changeMessage = document.getElementById("change-message");

  const user = document.getElementById("change-user-value");
  changeDeatails.style.display = "none";
  change.value = "";
  changeMessage.style.display = "none";
  changeUser.style.display = "none";
  user.value = "";

  error.style.display = "none";
}

function delChannels() {
  const id = localStorage.getItem("delChannelID");
  fetch(`http://localhost:5005/channel/${id}/leave`, {
    method: "POST",
    headers: {
      Authorization: localStorage.getItem("token"),
      "Content-type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        error.style.display = "block";
        errorText.innerText = data.error;
      } else {
        displayChannels();
        control.style.display = "none";
      }
    });
}

function handleDetails() {
  var change = document.getElementById("change-value");
  var name;
  var description;
  if (localStorage.getItem("change") == 1) {
    name = change.value;
    var title1 = document.getElementById("title1");
    title1.innerHTML = name;
    const channelsControlDivs = document.querySelectorAll(
      ".channelsContainer div"
    );
    channelsControlDivs.forEach((div) => {
      console.log(div);
      if (div.getAttribute("id") == id) {
        div.innerHTML = "# " + name;
      }
    });
  } else {
    description = change.value;
    var description1 = document.getElementById("Description");
    description1.innerHTML = description;

    const des = document.getElementById("in-des");
    des.innerText = description1.innerHTML;
  }

  const apiCall = (path, body) => {
    fetch("http://localhost:5005/" + path, {
      method: "PUT",
      headers: {
        Authorization: localStorage.getItem("token"),
        "Content-type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          changeDeatails.style.display = "none";
          error.style.display = "block";
          errorText.innerText = data.error;
        } else {
          changeDeatails.style.display = "none";
        }
      });
  };
  const id = localStorage.getItem("delChannelID");
  apiCall(`channel/${id}`, { name, description });
  change.value = "";
}

document.addEventListener("mousedown", function (event) {
  const target = event.target;
  const box = document.getElementById("channels-control"); // 替换为盒子元素的 ID 或选择器
  const mess = document.getElementById("mess-control");
  const pin = document.getElementById("pin-control");
  if (!box.contains(target)) {
    box.style.display = "none";
    // mess.style.display = "none";
  }

  if (!mess.contains(target)) {
    mess.style.display = "none";
  }

  if (!pin.contains(target)) {
    pin.style.display = "none";
  }
});

function handleTime(params) {
  const utcTimeString = params;
  const utcTime = new Date(utcTimeString);

  // 将 UTC 时间转换为本地时间
  const localTime = new Date(
    utcTime.getTime() + utcTime.getTimezoneOffset() * 60 * 1000
  );

  // 获取本地时间的各个部分
  const year = localTime.getFullYear();
  const month = localTime.getMonth() + 1; // 月份从 0 开始，所以需要加 1
  const day = localTime.getDate();
  const hours = localTime.getHours();
  const minutes = localTime.getMinutes();
  const seconds = localTime.getSeconds();

  // 构建正常时间字符串
  const normalTimeString = `${year}-${month.toString().padStart(2, "0")}-${day
    .toString()
    .padStart(2, "0")} ${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return normalTimeString;
  // console.log(normalTimeString); // 输出：2021-09-13 16:00:03
}

// 根据用户ID进行邀请
function handleAdd() {
  const change = document.getElementById("change-details");
  const userId = document.getElementById("add-value").value;
  const id = localStorage.getItem("delChannelID");
  const data = { userId };
  fetch(`http://localhost:5005/channel/${id}/invite`, {
    method: "POST",
    headers: {
      Authorization: localStorage.getItem("token"),
      "Content-type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        userId.value = "";
        change.style.display = "none";
        error.style.display = "block";
        errorText.innerText = data.error;
      } else {
        error.style.display = "block";
        errorText.innerText = "Invitation successful!";
        userId.value = "";
        change.style.display = "none";
      }
    });
}

(function () {
  // 在这里编写函数体
  // 获取当前 URL 的哈希部分
  const hash = window.location.hash;

  // 去除哈希部分中的井号
  const hashParams = hash.slice(1);

  // 将哈希部分参数拆分为键值对数组
  const paramsArray = hashParams.split("&");

  // 创建一个对象来存储参数和对应的值
  const params = {};

  // 遍历键值对数组，将参数和值存储到对象中
  paramsArray.forEach((param) => {
    const [key, value] = param.split("=");
    params[key] = decodeURIComponent(value);
  });
  if (localStorage.getItem("token")) {
    // 获取特定参数的值
    let channelsValue = "";
    if (params["channels"]) {
      channelsValue = params["channels"];
    } else {
      channelsValue = "813580";
    }

    fetch(`http://localhost:5005/channel/${channelsValue}`, {
      method: "GET",
      headers: {
        Authorization: localStorage.getItem("token"),
        "Content-type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          error.style.display = "block";
          errorText.innerText =
            "This is a private channel, you do not have the right to join!";
        } else {
          var header = document.getElementById("right-header");
          header.innerHTML = "# " + data.name;

          const title = document.getElementById("in-title");
          title.innerText = data.name;

          const des = document.getElementById("in-des");
          des.innerText = data.description;

          localStorage.setItem("channelsDetails", JSON.stringify(data));
        }
      });

    localStorage.setItem("delChannelID", channelsValue);

    getMessage(channelsValue, 0);
    scrollToBottom();
  }

  console.log(hashParams);
  if (hashParams == "profile") {
    handleUser(loginId);
  } else if (params["profile"]) {
    handleUser(params["profile"]);
  }
})();

// message
const channelId = localStorage.getItem("delChannelID");
let previousMessages = [];

function getMessage(channelId, index) {
  fetch(`http://localhost:5005/message/${channelId}?start=${index}`, {
    method: "GET",
    headers: {
      Authorization: localStorage.getItem("token"),
      "Content-type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        // error.style.display = "block";
        // errorText.innerText = data.error;
      } else {
        messagesContainer.innerHTML = "";

        const sortedMessages = data.messages.sort((a, b) => {
          return (
            new Date(handleTime(a.sentAt)) - new Date(handleTime(b.sentAt))
          );
        });

        sortedMessages.forEach((message) => {
          createMessageElement(message);
        });
      }
    });
}

let prevDate = null; // 保存前一条消息的日期
let prevSender = null; // 保存前一条消息的发送者

function createMessageElement(message) {
  const messageElement = document.createElement("div");
  messageElement.classList.add("right-content-mess");
  messageElement.setAttribute("id", message.id);

  messageElement.addEventListener("contextmenu", function (event) {
    event.preventDefault(); // 阻止默认行为
    const mess = document.getElementById("mess-control");

    const unPin = document.getElementById("unPin");
    if (message.pinned) {
      unPin.innerHTML = "Un-pin to channel";
    } else {
      unPin.innerHTML = "Pin to channel";
    }

    const userAu = document.querySelectorAll(".userAu");
    if (Number(loginId) !== message.sender) {
      userAu.forEach((item) => {
        item.style.display = "none";
      });
    } else {
      userAu.forEach((item) => {
        item.style.display = "block";
      });
    }

    mess.style.display = "block";
    mess.style.left = event.clientX + "px";
    mess.style.top = event.clientY + "px";

    localStorage.setItem("messID", message.id);
  });

  var emojis = [
    { icon: "👌", id: "ok" },
    { icon: "👀", id: "look" },
    { icon: "👍", id: "good" },
  ];

  const emojiElement = document.createElement("div");

  // 创建一个数组来存储生成的 <span> 元素
  emojiElement.innerHTML = message.reacts.map((react) => {
    const currentReact = react.react;

    // 使用 find 方法查找匹配的 emoji 对象
    const matchedEmoji = emojis.find((emoji) => emoji.id === currentReact);

    // console.log(message.id);
    if (matchedEmoji) {
      const icon = matchedEmoji.icon;
      // 返回生成的 <span> 元素
      return `<span onclick="handleUnReact('${currentReact}','${message.id}')">${icon}</span>`;
    }

    return null; // 如果没有匹配的 emoji，则返回 null
  });

  const userElement = document.createElement("div");
  userElement.classList.add("mess-user");

  const dateElement = document.createElement("div");
  dateElement.classList.add("mess-date");

  const avatarElement = document.createElement("img");

  fetch(`http://localhost:5005/user/${message.sender}`, {
    method: "GET",
    headers: {
      Authorization: localStorage.getItem("token"),
      "Content-type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      dateElement.innerHTML = `
    <span onclick=handleUser(${message.sender})>${data.name}</span>
    <span>${handleTime(message.sentAt)}</span>
  `;

      if (data.image) {
        avatarElement.src = data.image;
      } else {
        avatarElement.src =
          "https://ca.slack-edge.com/T061V99D61M-U062C8SRW68-ge49b7aba1c0-48";
      }
    });
  avatarElement.onclick = function () {
    console.log(message);
    handleUser(message.sender);
    console.log("33");
  };
  avatarElement.alt = "";

  const messageTextElement = document.createElement("span");
  messageTextElement.textContent = message.message;

  userElement.appendChild(dateElement);
  userElement.appendChild(messageTextElement);
  userElement.appendChild(emojiElement);

  userElement.onclick = function () {
    localStorage.setItem("messID", message.id);
  };

  if (message.image) {
    const messageImg = document.createElement("img");
    messageImg.src = message.image;
    userElement.appendChild(messageImg);

    const modal = document.getElementById("modal");
    messageImg.addEventListener("click", function () {
      modal.style.display = "block";
      modalImage.src = messageImg.src;
    });
  }

  if (message.pinned) {
    messageTextElement.style.color = "#3c93f7";
  }
  messageElement.appendChild(avatarElement);
  messageElement.appendChild(userElement);

  var emojDiv = document.createElement("div");
  emojDiv.className = "emoj";

  emojis.forEach(function (emoji) {
    var span = document.createElement("span");
    span.textContent = emoji.icon;

    span.addEventListener("click", function () {
      localStorage.setItem("messID", message.id);

      const body = { react: emoji.id };
      fetch(`http://localhost:5005/message/react/${channelId}/${message.id}`, {
        method: "POST",
        headers: {
          Authorization: localStorage.getItem("token"),
          "Content-type": "application/json",
        },
        body: JSON.stringify(body),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            error.style.display = "block";
            errorText.innerText = data.error;
          } else {
            getMessage(channelId, 0);
          }
        });
    });

    emojDiv.appendChild(span);
  });

  messagesContainer.appendChild(messageElement);
  messageElement.appendChild(emojDiv);

  emojDiv.style.display = "none";
  messageElement.addEventListener("mouseover", function () {
    emojDiv.style.display = "block";
  });

  messageElement.addEventListener("mouseleave", function () {
    emojDiv.style.display = "none";
  });
}
var pinContainer = document.getElementById("pinContenter");
function createPin(message) {
  message.forEach(function (object) {
    var pinContenter = document.createElement("div");
    pinContenter.className = "pin-contenter";

    var pinHeader = document.createElement("div");
    pinHeader.className = "pin-header";

    var img = document.createElement("img");

    if (object.image) {
      img.src = object.image;
    } else {
      img.src =
        "https://ca.slack-edge.com/T061V99D61M-U062C8SRW68-ge49b7aba1c0-48";
    }

    img.alt = "";

    var name = document.createElement("p");
    name.textContent = object.sender;

    var message = document.createElement("span");
    message.textContent = object.message;

    var date = document.createElement("span");
    date.textContent = handleTime(object.sentAt);

    pinHeader.appendChild(img);
    pinHeader.appendChild(name);

    pinContenter.appendChild(pinHeader);
    pinContenter.appendChild(message);
    pinContenter.appendChild(date);

    pinContainer.appendChild(pinContenter);
  });
}

let messBody = {};
const fileInput = document.getElementById("fileInput");
fileInput.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    messBody.image = event.target.result;
  };
  reader.readAsDataURL(file);
});

function postMessage(channelId) {
  const text = document.getElementById("input-text");
  messBody.message = text.value;

  fetch(`http://localhost:5005/message/${channelId}`, {
    method: "POST",
    headers: {
      Authorization: localStorage.getItem("token"),
      "Content-type": "application/json",
    },
    body: JSON.stringify(messBody),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        // error.style.display = "block";
        // errorText.innerText = data.error;
      } else {
        getMessage(channelId, 0);
        text.value = "";
        fileInput.value = "";
        scrollToBottom();
      }
    });
}

// 滚动到底部函数
function scrollToBottom() {
  setTimeout(function () {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, 100);
}

let index = 0;
messagesContainer.addEventListener("scroll", function () {
  if (messagesContainer.scrollTop == 0) {
    index += 25;

    fetch(`http://localhost:5005/message/${channelId}?start=${index}`, {
      method: "GET",
      headers: {
        Authorization: localStorage.getItem("token"),
        "Content-type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          // error.style.display = "block";
          // errorText.innerText =
          //   "This is a private channel, you do not have the right to join!";
        } else {
          console.log(data.messages);
          if (data.messages.length > 0) {
            previousMessages = data.messages;
            const allMessages = [...data.messages, ...previousMessages];
            const sortedMessages = allMessages.sort((a, b) => {
              return (
                new Date(handleTime(a.sentAt)) - new Date(handleTime(b.sentAt))
              );
            });
            sortedMessages.forEach((messages) => {
              createMessageElement(messages);
            });
          }
        }
      });
  }
});

const modal = document.getElementById("modal");

modal.addEventListener("click", function () {
  modal.style.display = "none";
});

var messControl = document.getElementById("mess-control");

function handleMessage(param, event) {
  text = event.srcElement.innerText;

  const changeMessage = document.getElementById("change-message");
  const messID = localStorage.getItem("messID");
  switch (param) {
    case 2:
      changeMessage.style.display = "block";
      messControl.style.display = "none";
      break;
    case 3:
      if (text == "Pin to channel") {
        fetch(`http://localhost:5005/message/pin/${channelId}/${messID}`, {
          method: "POST",
          headers: {
            Authorization: localStorage.getItem("token"),
            "Content-type": "application/json",
          },
          body: JSON.stringify(messBody),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.error) {
              error.style.display = "block";
              errorText.innerText = data.error;
            } else {
              getMessage(channelId, 0);
              messControl.style.display = "none";
            }
          });
      } else {
        fetch(`http://localhost:5005/message/unpin/${channelId}/${messID}`, {
          method: "POST",
          headers: {
            Authorization: localStorage.getItem("token"),
            "Content-type": "application/json",
          },
          body: JSON.stringify(messBody),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.error) {
              error.style.display = "block";
              errorText.innerText = data.error;
            } else {
              getMessage(channelId, 0);
              messControl.style.display = "none";
            }
          });
      }

      break;
    case 4:
      fetch(`http://localhost:5005/message/${channelId}/${messID}`, {
        method: "DELETE",
        headers: {
          Authorization: localStorage.getItem("token"),
          "Content-type": "application/json",
        },
        body: JSON.stringify(messBody),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            error.style.display = "block";
            errorText.innerText = data.error;
          } else {
            getMessage(channelId, 0);
            scrollToBottom();
            messControl.style.display = "none";
          }
        });
      break;
    default:
  }
}

const fileMess = document.getElementById("fileMess");
fileMess.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    messBody.image = event.target.result;
  };
  reader.readAsDataURL(file);
});

function handleMessageSave() {
  const changeMessage = document.getElementById("change-message");
  const text = document.getElementById("change-message-text");
  messBody.message = text.value;
  const messID = localStorage.getItem("messID");

  fetch(`http://localhost:5005/message/${channelId}/${messID}`, {
    method: "PUT",
    headers: {
      Authorization: localStorage.getItem("token"),
      "Content-type": "application/json",
    },
    body: JSON.stringify(messBody),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        error.style.display = "block";
        errorText.innerText = data.error;
      } else {
        getMessage(channelId, 0);
        changeMessage.style.display = "none";
        text.value = "";
      }
    });
}

document
  .getElementById("input-text")
  .addEventListener("keydown", function (event) {
    const channelId = localStorage.getItem("delChannelID");
    if (event.keyCode === 13) {
      // 处理按下回车键的逻辑
      postMessage(channelId);
    }
  });

function handlePined(channelId, index) {
  var pin = document.getElementById("pin-control");
  fetch(`http://localhost:5005/message/${channelId}?start=${index}`, {
    method: "GET",
    headers: {
      Authorization: localStorage.getItem("token"),
      "Content-type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        // error.style.display = "block";
        // errorText.innerText = data.error;
      } else {
        pinContainer.innerHTML = "";

        const sortedMessages = data.messages.filter((item) => {
          if (item.pinned) {
            return item;
          }
        });
        if (sortedMessages.length !== 0) {
          createPin(sortedMessages);

          pin.style.display = "block";
        } else {
          alert("no pin!");
        }
      }
    });
}

function handleLogout() {
  fetch(`http://localhost:5005/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: localStorage.getItem("token"),
      "Content-type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
        error.style.display = "block";
        errorText.innerText = data.error;
      } else {
        localStorage.removeItem("token");
        document.getElementById("login").style.display = "block";
        document.getElementById("main").style.display = "none";
        const channelsContainer = document.getElementById("channelsContainer");

        channelsContainer.innerHTML = "";
      }
    });
}

function handleUnReact(param, id) {
  const body = { react: param };
  fetch(`http://localhost:5005/message/unreact/${channelId}/${id}`, {
    method: "POST",
    headers: {
      Authorization: localStorage.getItem("token"),
      "Content-type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((data) => {
      getMessage(channelId, 0);
    });
}

function handleUser(param) {
  const userDeatil = document.getElementById("create-userDetail");

  fetch(`http://localhost:5005/user/${param}`, {
    method: "GET",
    headers: {
      Authorization: localStorage.getItem("token"),
      "Content-type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const userName = document.getElementById("userName");
      const userBlog = document.getElementById("userBlog");
      const userEmail = document.getElementById("userEmail");
      const userImage = document.getElementById("userImage");
      const userF = document.getElementById("userF");

      const userEdit = document.querySelectorAll(".userEdit");
      userEdit.forEach((item) => {
        if (loginId == param) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      });

      userName.innerText = data.name;
      userBlog.innerText = data.bio;
      userEmail.innerText = data.email;

      if (data.image) {
        userImage.src = data.image;
      } else {
        userImage.src =
          "https://ca.slack-edge.com/T062SMS9YVB-U062Y395SEQ-ge49b7aba1c0-512";
      }

      userDeatil.style.display = "block";
    });
}

const userFile = document.getElementById("userFile");
const userImage = document.getElementById("userImage");
userFile.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    userImage.src = event.target.result;
    const body = {
      image: userImage.src,
    };

    fetch(`http://localhost:5005/user`, {
      method: "PUT",
      headers: {
        Authorization: localStorage.getItem("token"),
        "Content-type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        handleUser(loginId);
        change.style.display = "none";
        userImage.value = "";
      });
  };
  reader.readAsDataURL(file);
});

function handleUserEdit(param) {
  const change = document.getElementById("change-user");
  const re = document.getElementById("re-user");

  switch (param) {
    case 1:
      re.innerText = "Edit your name";
      break;
    case 2:
      re.innerText = "Edit your bio";
      break;
    case 3:
      re.innerText = "Edit your email";
      break;

    default:
      break;
  }
  change.style.display = "block";
}

function handleUserDetails() {
  let body = {};
  const user = document.getElementById("change-user-value");
  const re = document.getElementById("re-user");

  switch (re.innerText) {
    case "Edit your name":
      body = { name: user.value };
      break;
    case "Edit your bio":
      body = { bio: user.value };
      break;
    case "Edit your email":
      body = { email: user.value };
      break;

    default:
      break;
  }
  const change = document.getElementById("change-user");
  fetch(`http://localhost:5005/user`, {
    method: "PUT",
    headers: {
      Authorization: localStorage.getItem("token"),
      "Content-type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then((response) => response.json())
    .then((data) => {
      handleUser(loginId);
      change.style.display = "none";
      user.value = "";
    });
}
