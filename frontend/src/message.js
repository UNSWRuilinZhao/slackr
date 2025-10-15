

getMessage(channelId, 1);

function postMessage() {
  fetch(`http://localhost:5005/message/{channelId}`, {
    method: "POST",
    headers: {
      Authorization: localStorage.getItem("token"),
      "Content-type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
      } else {
      }
    });
}

function putMessage() {
  fetch(`http://localhost:5005/message/{channelId}`, {
    method: "PUT",
    headers: {
      Authorization: localStorage.getItem("token"),
      "Content-type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
      } else {
      }
    });
}

function deleteMessage() {
  fetch(`http://localhost:5005/message/{channelId}`, {
    method: "DELETE",
    headers: {
      Authorization: localStorage.getItem("token"),
      "Content-type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
      } else {
      }
    });
}

function pinMessage() {
  fetch(`http://localhost:5005/message/pin/{channelId}/{messageId}`, {
    method: "POST",
    headers: {
      Authorization: localStorage.getItem("token"),
      "Content-type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
      } else {
      }
    });
}

function unpinMessage() {
  fetch(`http://localhost:5005/message/unpin/{channelId}/{messageId}`, {
    method: "POST",
    headers: {
      Authorization: localStorage.getItem("token"),
      "Content-type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
      } else {
      }
    });
}

function reacttMessage() {
  fetch(`http://localhost:5005/message/unpin/{channelId}/{messageId}`, {
    method: "POST",
    headers: {
      Authorization: localStorage.getItem("token"),
      "Content-type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
      } else {
      }
    });
}

function unreactMessage() {
  fetch(`http://localhost:5005/message/unreact/{channelId}/{messageId}`, {
    method: "POST",
    headers: {
      Authorization: localStorage.getItem("token"),
      "Content-type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.error) {
      } else {
      }
    });
}
