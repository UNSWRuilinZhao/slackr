const BACKEND_URL = "http://localhost:5005";
const DEFAULT_AVATAR =
  "https://ca.slack-edge.com/T061V99D61M-U062C8SRW68-ge49b7aba1c0-48";

const loginScreen = document.getElementById("login");
const mainScreen = document.getElementById("main");
const loginForm = document.getElementById("loginForm");
const registrationForm = document.getElementById("registrationForm");

const channelsContainer = document.getElementById("channelsContainer");
const channelControl = document.getElementById("channels-control");
const viewChannelAction = channelControl.children[0];
const leaveChannelAction = document.getElementById("leaveChannelAction");
const joinChannelAction = document.getElementById("joinChannelAction");
const deleteChannelAction = document.getElementById("deleteChannelAction");

const rightHeader = document.getElementById("right-header");
const channelTitle = document.getElementById("in-title");
const channelDescription = document.getElementById("in-des");
const channelDescriptionAction = document.getElementById(
  "channelDescriptionAction"
);
const channelInviteAction = document.getElementById("channelInviteAction");

const createChannelModal = document.getElementById("create-channels");
const createNameInput = document.getElementById("create-name");
const createDescriptionInput = document.getElementById("create-description");

const channelDetailsModal = document.getElementById("create-deatails");
const detailsTitle = document.getElementById("title");
const detailsTitleName = document.getElementById("title1");
const detailsDescription = document.getElementById("Description");
const detailsPrivate = document.getElementById("Private");
const detailsCreator = document.getElementById("by-name");

const changeDetailsModal = document.getElementById("change-details");
const changeDetailsTitle = document.getElementById("re-name");
const changeValueInput = document.getElementById("change-value");
const addValueInput = document.getElementById("add-value");
const inviteSelection = document.getElementById("invite-selection");
const inviteUsers = document.getElementById("invite-users");
const channelSaveButton = document.getElementById("deOne");
const channelInviteButton = document.getElementById("deTow");

const messagesContainer = document.getElementById("messagesContainer");
const inputText = document.getElementById("input-text");
const fileInput = document.getElementById("fileInput");
const messageControl = document.getElementById("mess-control");
const messagePinAction = document.getElementById("unPin");
const messageEditModal = document.getElementById("change-message");
const changeMessageText = document.getElementById("change-message-text");
const fileMess = document.getElementById("fileMess");
const pinControl = document.getElementById("pin-control");
const pinContainer = document.getElementById("pinContenter");

const userDetailPanel = document.getElementById("create-userDetail");
const userName = document.getElementById("userName");
const userBlog = document.getElementById("userBlog");
const userEmail = document.getElementById("userEmail");
const userImage = document.getElementById("userImage");
const userFile = document.getElementById("userFile");
const userEditControls = document.querySelectorAll(".userEdit");
const userChangeModal = document.getElementById("change-user");
const userChangeTitle = document.getElementById("re-user");
const userChangeValue = document.getElementById("change-user-value");
const profilePasswordSection = document.getElementById("profile-password-section");
const profileNewPassword = document.getElementById("profileNewPassword");
const profilePasswordToggle = document.getElementById(
  "profilePasswordToggle"
);

const modal = document.getElementById("modal");
const modalImage = document.getElementById("modalImage");

const errorModal = document.getElementById("change-error");
const errorTitle = document.getElementById("error-title");
const errorText = document.getElementById("error-message");
const confirmModal = document.getElementById("change-confirm");
const confirmTitle = document.getElementById("confirm-title");
const confirmMessage = document.getElementById("confirm-message");
const confirmActionButton = document.getElementById("confirm-action-button");

const REACT_OPTIONS = [
  { id: "ok", icon: "👌" },
  { id: "look", icon: "👀" },
  { id: "good", icon: "👍" },
];

const appState = {
  channelList: [],
  currentChannelId: localStorage.getItem("delChannelID"),
  currentChannel: null,
  currentChannelMembership: false,
  loadedMessages: [],
  hasMoreMessages: true,
  isLoadingMessages: false,
  allUsers: [],
  userCache: {},
  selectedInviteUserIds: new Set(),
  channelEditMode: null,
  contextMessageId: null,
  editingMessageId: null,
  messageDraftImage: undefined,
  editDraftImage: undefined,
  profileFieldBeingEdited: null,
  viewedUserId: null,
  pendingConfirmResolve: null,
};

function getCurrentLoginId() {
  const loginId = localStorage.getItem("loginId");
  return loginId ? Number(loginId) : null;
}

function hasToken() {
  return Boolean(localStorage.getItem("token"));
}

function authHeaders() {
  return {
    Authorization: localStorage.getItem("token"),
    "Content-type": "application/json",
  };
}

async function apiRequest(path, options = {}) {
  const { method = "GET", body, auth = true } = options;
  const headers = { "Content-type": "application/json" };
  if (auth && localStorage.getItem("token")) {
    headers.Authorization = localStorage.getItem("token");
  }

  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch {
    return {
      error:
        "Unable to reach the server. Please check that the backend is running.",
    };
  }
}

function showError(message, title = "Error") {
  errorTitle.innerText = title;
  errorText.innerText = message;
  errorModal.style.display = "block";
}

function closeError() {
  errorModal.style.display = "none";
  errorTitle.innerText = "Error";
  errorText.innerText = "";
}

function cleanupConfirmState() {
  confirmModal.style.display = "none";
  confirmTitle.innerText = "Confirm action";
  confirmMessage.innerText = "";
  confirmActionButton.innerText = "Continue";
}

function cancelConfirm() {
  const resolver = appState.pendingConfirmResolve;
  appState.pendingConfirmResolve = null;
  cleanupConfirmState();
  if (resolver) {
    resolver(false);
  }
}

function closeConfirm() {
  cancelConfirm();
}

function acceptConfirm() {
  const resolver = appState.pendingConfirmResolve;
  appState.pendingConfirmResolve = null;
  cleanupConfirmState();
  if (resolver) {
    resolver(true);
  }
}

function showConfirm(message, title = "Confirm action", actionLabel = "Continue") {
  if (appState.pendingConfirmResolve) {
    appState.pendingConfirmResolve(false);
    appState.pendingConfirmResolve = null;
  }

  confirmTitle.innerText = title;
  confirmMessage.innerText = message;
  confirmActionButton.innerText = actionLabel;
  confirmModal.style.display = "block";

  return new Promise((resolve) => {
    appState.pendingConfirmResolve = resolve;
  });
}

function hideContextMenus() {
  channelControl.style.display = "none";
  messageControl.style.display = "none";
  pinControl.style.display = "none";
}

function clearHash() {
  if (window.location.hash) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }
}

function setHashValue(value) {
  if (window.location.hash !== `#${value}`) {
    window.location.hash = value;
  }
}

function setChannelHash(channelId) {
  setHashValue(`channels=${channelId}`);
}

function setOwnProfileHash() {
  setHashValue("profile");
}

function setUserProfileHash(userId) {
  setHashValue(`profile=${userId}`);
}

function parseHash() {
  const rawHash = window.location.hash.replace(/^#/, "");
  if (!rawHash) {
    return {};
  }

  if (rawHash === "profile") {
    return { profile: String(getCurrentLoginId()) };
  }

  return rawHash.split("&").reduce((acc, pair) => {
    const [key, value] = pair.split("=");
    if (key) {
      acc[key] = decodeURIComponent(value || "");
    }
    return acc;
  }, {});
}

function handleTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (part) => part.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}`;
}

function getChannelSummary(channelId) {
  return appState.channelList.find(
    (channel) => String(channel.id) === String(channelId)
  );
}

function setCurrentChannel(channelId, channelData) {
  const summary = getChannelSummary(channelId);
  const isMember = summary
    ? summary.members.includes(getCurrentLoginId())
    : true;

  appState.currentChannelId = String(channelId);
  appState.currentChannel = {
    ...channelData,
    id: Number(channelId),
  };
  appState.currentChannelMembership = isMember;

  localStorage.setItem("delChannelID", String(channelId));
  localStorage.setItem("channelsDetails", JSON.stringify(appState.currentChannel));

  rightHeader.innerText = `# ${channelData.name}`;
  channelTitle.innerText = channelData.name;
  channelDescription.innerText = channelData.description || "";
  channelDescriptionAction.style.display = isMember ? "inline" : "none";
  channelInviteAction.style.display = isMember ? "flex" : "none";

  updateActiveChannelStyles();
}

function clearCurrentChannelView(options = {}) {
  const { clearRoute = true } = options;
  appState.currentChannelId = null;
  appState.currentChannel = null;
  appState.currentChannelMembership = false;
  appState.loadedMessages = [];
  appState.hasMoreMessages = true;
  appState.isLoadingMessages = false;

  localStorage.removeItem("delChannelID");
  localStorage.removeItem("channelsDetails");
  localStorage.removeItem("messID");

  rightHeader.innerText = "";
  channelTitle.innerText = "";
  channelDescription.innerText = "";
  channelDescriptionAction.style.display = "none";
  channelInviteAction.style.display = "none";
  inputText.value = "";
  fileInput.value = "";
  messagesContainer.innerHTML = "";
  appState.messageDraftImage = undefined;

  hideContextMenus();
  updateActiveChannelStyles();

  if (clearRoute) {
    clearHash();
  }
}

function updateActiveChannelStyles() {
  document.querySelectorAll(".channel-item").forEach((element) => {
    const matchesCurrent =
      appState.currentChannelId &&
      String(element.dataset.channelId) === String(appState.currentChannelId);
    element.classList.toggle("is-active", Boolean(matchesCurrent));
  });
}

async function getUserProfile(userId) {
  const cacheKey = String(userId);
  if (appState.userCache[cacheKey]) {
    return appState.userCache[cacheKey];
  }

  const data = await apiRequest(`/user/${userId}`);
  if (!data.error) {
    appState.userCache[cacheKey] = data;
    return data;
  }

  return null;
}

function showLoggedOutView() {
  loginScreen.style.display = "block";
  mainScreen.style.display = "none";
  userDetailPanel.style.display = "none";
  channelDetailsModal.style.display = "none";
  changeDetailsModal.style.display = "none";
  messageEditModal.style.display = "none";
  userChangeModal.style.display = "none";
  closeError();
  hideContextMenus();
  clearCurrentChannelView();
}

function showLoggedInView() {
  loginScreen.style.display = "none";
  mainScreen.style.display = "block";
}

function showLogin() {
  registrationForm.style.display = "none";
  loginForm.style.display = "flex";
  closeError();
}

function showRegistration() {
  loginForm.style.display = "none";
  registrationForm.style.display = "block";
  closeError();
}

async function loginUser(event) {
  if (event) {
    event.preventDefault();
  }

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  closeError();

  const data = await apiRequest("/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });

  if (data.error) {
    showError(data.error, "Login failed");
    return;
  }

  localStorage.setItem("token", data.token);
  localStorage.setItem("loginId", String(data.userId));
  showLoggedInView();
  await initialiseAuthenticatedView();
}

async function registerUser() {
  const email = document.getElementById("regEmail").value.trim();
  const name = document.getElementById("regName").value.trim();
  const password = document.getElementById("regPassword").value;
  const confirmPassword = document.getElementById("regConfirmPassword").value;
  closeError();

  if (password !== confirmPassword) {
    showError("Passwords do not match.", "Registration failed");
    return;
  }

  const data = await apiRequest("/auth/register", {
    method: "POST",
    auth: false,
    body: { email, password, name },
  });

  if (data.error) {
    showError(data.error, "Registration failed");
    return;
  }

  document.getElementById("regEmail").value = "";
  document.getElementById("regName").value = "";
  document.getElementById("regPassword").value = "";
  document.getElementById("regConfirmPassword").value = "";
  showLogin();
}

async function displayChannels() {
  const data = await apiRequest("/channel");
  if (data.error) {
    channelsContainer.innerHTML = "";
    showError(data.error, "Channel list unavailable");
    return;
  }

  const currentLoginId = getCurrentLoginId();
  appState.channelList = data.channels
    .map((channel) => ({
      ...channel,
      members: channel.members.map((memberId) => Number(memberId)),
    }))
    .filter((channel) => !channel.private || channel.members.includes(currentLoginId))
    .sort((a, b) => {
      if (a.private !== b.private) {
        return Number(a.private) - Number(b.private);
      }
      return a.name.localeCompare(b.name);
    });

  channelsContainer.innerHTML = "";
  appState.channelList.forEach((channel) => {
    channelsContainer.appendChild(buildChannelItem(channel));
  });

  updateActiveChannelStyles();
}

function buildChannelItem(channel) {
  const channelElement = document.createElement("div");
  channelElement.className = `channel-item ${
    channel.private ? "channel-private" : "channel-public"
  }`;
  channelElement.dataset.channelId = String(channel.id);

  const label = document.createElement("span");
  label.className = "channel-label";
  label.textContent = `${channel.private ? "🔒" : "#"} ${channel.name}`;

  const badge = document.createElement("span");
  badge.className = "channel-badge";
  badge.textContent = channel.private ? "Private" : "Public";

  channelElement.appendChild(label);
  channelElement.appendChild(badge);

  channelElement.addEventListener("click", async () => {
    hideContextMenus();
    setChannelHash(channel.id);
    await displayChannelDetails(channel.id);
  });

  channelElement.addEventListener("contextmenu", async (event) => {
    event.preventDefault();
    localStorage.setItem("delChannelID", String(channel.id));
    appState.currentChannelId = String(channel.id);
    refreshChannelContextMenu(channel.id);
    channelControl.style.left = `${event.clientX}px`;
    channelControl.style.top = `${event.clientY}px`;
    channelControl.style.display = "block";
  });

  return channelElement;
}

function refreshChannelContextMenu(channelId) {
  const channel = getChannelSummary(channelId);
  if (!channel) {
    hideContextMenus();
    return;
  }

  const currentLoginId = getCurrentLoginId();
  const isMember = channel.members.includes(currentLoginId);
  const isCreator = channel.creator === currentLoginId;

  viewChannelAction.style.display = isMember ? "block" : "none";
  joinChannelAction.style.display = !isMember ? "block" : "none";
  leaveChannelAction.style.display = isMember && !isCreator ? "block" : "none";
  deleteChannelAction.style.display = isMember && isCreator ? "block" : "none";
}

async function displayChannelDetails(channelId) {
  let channel = getChannelSummary(channelId);
  if (!channel) {
    await displayChannels();
    channel = getChannelSummary(channelId);
  }

  if (!channel) {
    showError("Unable to find that channel.", "Channel unavailable");
    return;
  }

  const currentLoginId = getCurrentLoginId();
  const isMember = channel.members.includes(currentLoginId);

  if (!isMember) {
    const joinResult = await apiRequest(`/channel/${channelId}/join`, {
      method: "POST",
    });
    if (joinResult.error) {
      showError(joinResult.error, "Unable to join channel");
      return;
    }
    await displayChannels();
  }

  const data = await apiRequest(`/channel/${channelId}`);
  if (data.error) {
    showError(data.error, "Channel unavailable");
    return;
  }

  setCurrentChannel(channelId, data);
  setChannelHash(channelId);
  hideContextMenus();
  await loadMessages(channelId, { reset: true, scrollToBottomAfter: true });
}

async function getChannelDetails(channelId) {
  const channel = getChannelSummary(channelId);
  refreshChannelContextMenu(channelId);

  if (!channel || !channel.members.includes(getCurrentLoginId())) {
    return;
  }

  const data = await apiRequest(`/channel/${channelId}`);
  if (!data.error) {
    setCurrentChannel(channelId, data);
  }
}

async function leaveSelectedChannel() {
  const channelId = localStorage.getItem("delChannelID") || appState.currentChannelId;
  if (!channelId) {
    showError("Please select a channel first.", "No channel selected");
    return;
  }

  const confirmed = await showConfirm(
    "Leave this channel?",
    "Leave channel",
    "Leave"
  );
  if (!confirmed) {
    return;
  }

  const data = await apiRequest(`/channel/${channelId}/leave`, {
    method: "POST",
  });
  if (data.error) {
    showError(data.error, "Unable to leave channel");
    return;
  }

  if (String(appState.currentChannelId) === String(channelId)) {
    clearCurrentChannelView();
  }
  hideContextMenus();
  await displayChannels();
}

async function deleteSelectedChannel() {
  const channelId = localStorage.getItem("delChannelID") || appState.currentChannelId;
  if (!channelId) {
    showError("Please select a channel first.", "No channel selected");
    return;
  }

  const confirmed = await showConfirm(
    "Delete this channel permanently?",
    "Delete channel",
    "Delete"
  );
  if (!confirmed) {
    return;
  }

  const data = await apiRequest(`/channel/${channelId}`, {
    method: "DELETE",
  });
  if (data.error) {
    showError(data.error, "Unable to delete channel");
    return;
  }

  if (String(appState.currentChannelId) === String(channelId)) {
    clearCurrentChannelView();
  }
  channelDetailsModal.style.display = "none";
  hideContextMenus();
  await displayChannels();
}
function OpenCreate() {
  closeError();
  createChannelModal.style.display = "block";
}

async function closeChannels(action) {
  if (action !== 2) {
    createChannelModal.style.display = "none";
    return;
  }

  const name = createNameInput.value.trim();
  const description = createDescriptionInput.value.trim();
  const privateValue = document.querySelector('input[name="choice"]:checked').value;

  if (!name) {
    showError("Channel name cannot be empty.", "Channel creation failed");
    return;
  }

  const data = await apiRequest("/channel", {
    method: "POST",
    body: {
      name,
      private: privateValue,
      description,
    },
  });

  if (data.error) {
    showError(data.error, "Channel creation failed");
    return;
  }

  createNameInput.value = "";
  createDescriptionInput.value = "";
  createChannelModal.style.display = "none";
  await displayChannels();
  await displayChannelDetails(data.channelId);
}

function restoreHashAfterOverlayClose() {
  if (appState.currentChannelId) {
    setChannelHash(appState.currentChannelId);
  } else {
    clearHash();
  }
}

function closeDetails() {
  const profileWasOpen = userDetailPanel.style.display === "block";
  channelDetailsModal.style.display = "none";
  userDetailPanel.style.display = "none";
  if (profileWasOpen) {
    restoreHashAfterOverlayClose();
  }
}

async function openOwnProfile() {
  const currentLoginId = getCurrentLoginId();
  if (!currentLoginId) {
    showError("Please log in again.", "Profile unavailable");
    return;
  }

  setOwnProfileHash();
  await handleUser(currentLoginId);
}

async function openDetails() {
  hideContextMenus();
  const channelId = appState.currentChannelId || localStorage.getItem("delChannelID");
  if (!channelId) {
    showError("Please select a channel first.", "No channel selected");
    return;
  }

  const data = await apiRequest(`/channel/${channelId}`);
  if (data.error) {
    showError(data.error, "Channel details unavailable");
    return;
  }

  channelDetailsModal.style.display = "block";
  detailsTitle.innerText = `# ${data.name}`;
  detailsTitleName.innerText = data.name;
  detailsDescription.innerText = data.description || "";
  detailsPrivate.innerText = data.private ? "Private" : "Public";

  const creatorProfile = await getUserProfile(data.creator);
  detailsCreator.innerText = creatorProfile
    ? `${creatorProfile.name} · ${handleTime(data.createdAt)}`
    : `${data.creator} · ${handleTime(data.createdAt)}`;

  document.querySelectorAll(".detail-edit").forEach((item) => {
    item.style.display = appState.currentChannelMembership ? "block" : "none";
  });
}

function closeChangeDetails() {
  changeDetailsModal.style.display = "none";
  messageEditModal.style.display = "none";
  userChangeModal.style.display = "none";

  changeValueInput.value = "";
  addValueInput.value = "";
  inviteSelection.style.display = "none";
  inviteUsers.innerHTML = "";
  appState.selectedInviteUserIds.clear();
  appState.channelEditMode = null;

  changeMessageText.value = "";
  fileMess.value = "";
  appState.editDraftImage = undefined;
  appState.editingMessageId = null;

  userChangeValue.value = "";
  appState.profileFieldBeingEdited = null;
}

function getInviteCandidates() {
  const channel = getChannelSummary(appState.currentChannelId);
  const memberSet = new Set(channel ? channel.members : []);
  const query = addValueInput.value.trim().toLowerCase();

  return appState.allUsers
    .filter((user) => !memberSet.has(Number(user.id)))
    .filter((user) => {
      if (!query) {
        return true;
      }
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

function renderInviteCandidates() {
  const candidates = getInviteCandidates();
  inviteUsers.innerHTML = "";

  if (candidates.length === 0) {
    const empty = document.createElement("div");
    empty.className = "invite-empty";
    empty.innerText = "No users match this search.";
    inviteUsers.appendChild(empty);
    return;
  }

  candidates.forEach((user) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "invite-user-option";
    option.classList.toggle(
      "is-selected",
      appState.selectedInviteUserIds.has(Number(user.id))
    );

    const details = document.createElement("div");
    details.className = "invite-user-details";

    const name = document.createElement("span");
    name.className = "invite-user-name";
    name.innerText = user.name;

    const email = document.createElement("span");
    email.className = "invite-user-email";
    email.innerText = user.email;

    const indicator = document.createElement("span");
    indicator.className = "invite-user-indicator";
    indicator.innerText = appState.selectedInviteUserIds.has(Number(user.id))
      ? "Selected"
      : "Select";

    details.appendChild(name);
    details.appendChild(email);
    option.appendChild(details);
    option.appendChild(indicator);

    option.addEventListener("click", () => {
      const numericId = Number(user.id);
      if (appState.selectedInviteUserIds.has(numericId)) {
        appState.selectedInviteUserIds.delete(numericId);
      } else {
        appState.selectedInviteUserIds.add(numericId);
      }
      renderInviteCandidates();
    });

    inviteUsers.appendChild(option);
  });
}

async function changeDetails(mode) {
  const channelId = appState.currentChannelId || localStorage.getItem("delChannelID");
  if (!channelId) {
    showError("Please select a channel first.", "No channel selected");
    return;
  }

  closeError();
  changeDetailsModal.style.display = "block";
  appState.channelEditMode = mode;
  appState.selectedInviteUserIds.clear();

  changeValueInput.style.display = "block";
  addValueInput.style.display = "none";
  inviteSelection.style.display = "none";
  channelSaveButton.style.display = "block";
  channelInviteButton.style.display = "none";

  if (mode === 1) {
    changeDetailsTitle.innerText = "Rename this channel";
    changeValueInput.value = appState.currentChannel ? appState.currentChannel.name : "";
    return;
  }

  if (mode === 2) {
    changeDetailsTitle.innerText = "Edit description";
    changeValueInput.value = appState.currentChannel
      ? appState.currentChannel.description || ""
      : "";
    return;
  }

  changeDetailsTitle.innerText = "Add people";
  changeValueInput.style.display = "none";
  addValueInput.style.display = "block";
  inviteSelection.style.display = "block";
  channelSaveButton.style.display = "none";
  channelInviteButton.style.display = "block";

  if (appState.allUsers.length === 0) {
    const usersData = await apiRequest("/user");
    if (usersData.error) {
      showError(usersData.error, "Unable to load users");
      closeChangeDetails();
      return;
    }
    appState.allUsers = usersData.users;
  }

  renderInviteCandidates();
}

async function handleDetails() {
  const channelId = appState.currentChannelId || localStorage.getItem("delChannelID");
  if (!channelId) {
    showError("Please select a channel first.", "No channel selected");
    return;
  }

  if (appState.channelEditMode !== 1 && appState.channelEditMode !== 2) {
    return;
  }

  const value = changeValueInput.value;
  if (appState.channelEditMode === 1 && !value.trim()) {
    showError("Channel name cannot be empty.", "Channel update failed");
    return;
  }

  const payload =
    appState.channelEditMode === 1
      ? { name: value.trim() }
      : { description: value };

  const data = await apiRequest(`/channel/${channelId}`, {
    method: "PUT",
    body: payload,
  });

  if (data.error) {
    showError(data.error, "Channel update failed");
    return;
  }

  closeChangeDetails();
  await displayChannels();

  const refreshedChannel = await apiRequest(`/channel/${channelId}`);
  if (!refreshedChannel.error) {
    setCurrentChannel(channelId, refreshedChannel);
  }

  if (channelDetailsModal.style.display === "block") {
    await openDetails();
  }
}

async function handleAdd() {
  const channelId = appState.currentChannelId || localStorage.getItem("delChannelID");
  if (!channelId) {
    showError("Please select a channel first.", "No channel selected");
    return;
  }

  const selectedIds = Array.from(appState.selectedInviteUserIds);
  if (selectedIds.length === 0) {
    showError("Please select at least one user to invite.", "Invite failed");
    return;
  }

  for (const userId of selectedIds) {
    const result = await apiRequest(`/channel/${channelId}/invite`, {
      method: "POST",
      body: { userId },
    });
    if (result.error) {
      showError(result.error, "Invite failed");
      return;
    }
  }

  closeChangeDetails();
  await displayChannels();

  const refreshedChannel = await apiRequest(`/channel/${channelId}`);
  if (!refreshedChannel.error) {
    setCurrentChannel(channelId, refreshedChannel);
  }
}

const rightContentPanel = document.querySelector(".right-content");
const messageMenuActions = messageControl.querySelectorAll(".userAu");
const messageEditAction = messageMenuActions[0];
const messageDeleteAction = messageMenuActions[2];

function getCurrentChannelId() {
  return appState.currentChannelId || localStorage.getItem("delChannelID");
}

async function readImageFile(file) {
  if (!file) {
    return undefined;
  }

  const validFileTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (!validFileTypes.includes(file.type)) {
    throw new Error("Please upload a png, jpg, or jpeg image.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read the selected image."));
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function scrollMessagesToBottom() {
  rightContentPanel.scrollTop = rightContentPanel.scrollHeight;
}

function resetMessageComposer() {
  inputText.value = "";
  fileInput.value = "";
  appState.messageDraftImage = undefined;
}

async function renderMessages(options = {}) {
  const {
    previousHeight = 0,
    previousTop = 0,
    preserveScroll = false,
    scrollToBottomAfter = false,
  } = options;

  messagesContainer.innerHTML = "";

  if (appState.loadedMessages.length === 0) {
    const empty = document.createElement("div");
    empty.className = "message-pagination-status";
    empty.innerText = "No messages yet. Say hello.";
    messagesContainer.appendChild(empty);
    return;
  }

  if (appState.hasMoreMessages) {
    const helper = document.createElement("div");
    helper.className = "message-pagination-status";
    helper.innerText = "Scroll up to load older messages";
    messagesContainer.appendChild(helper);
  }

  const chronologicalMessages = [...appState.loadedMessages].reverse();
  const renderedMessages = await Promise.all(
    chronologicalMessages.map((message) => createMessageElement(message))
  );
  renderedMessages.forEach((node) => messagesContainer.appendChild(node));

  if (scrollToBottomAfter) {
    scrollMessagesToBottom();
    return;
  }

  if (preserveScroll) {
    const newHeight = rightContentPanel.scrollHeight;
    rightContentPanel.scrollTop = newHeight - previousHeight + previousTop;
    return;
  }

  scrollMessagesToBottom();
}

async function loadMessages(channelId, options = {}) {
  const {
    reset = false,
    scrollToBottomAfter = false,
  } = options;

  if (!channelId) {
    return;
  }

  if (appState.isLoadingMessages) {
    return;
  }

  if (reset) {
    appState.loadedMessages = [];
    appState.hasMoreMessages = true;
  } else if (!appState.hasMoreMessages) {
    return;
  }

  const previousHeight = rightContentPanel.scrollHeight;
  const previousTop = rightContentPanel.scrollTop;
  const start = appState.loadedMessages.length;

  appState.isLoadingMessages = true;
  const data = await apiRequest(`/message/${channelId}?start=${start}`);
  appState.isLoadingMessages = false;

  if (String(channelId) !== String(getCurrentChannelId())) {
    return;
  }

  if (data.error) {
    showError(data.error, "Unable to load messages");
    return;
  }

  const page = Array.isArray(data.messages) ? data.messages : [];
  appState.loadedMessages = reset
    ? page
    : [...appState.loadedMessages, ...page];
  appState.hasMoreMessages = page.length === 25;

  await renderMessages({
    previousHeight,
    previousTop,
    preserveScroll: !reset && !scrollToBottomAfter,
    scrollToBottomAfter,
  });
}

async function reloadLoadedMessages(options = {}) {
  const { scrollToBottomAfter = false } = options;
  const channelId = getCurrentChannelId();
  if (!channelId) {
    return;
  }

  const targetCount = Math.max(appState.loadedMessages.length, 25);
  const previousHeight = rightContentPanel.scrollHeight;
  const previousTop = rightContentPanel.scrollTop;

  appState.loadedMessages = [];
  appState.hasMoreMessages = true;

  while (appState.hasMoreMessages && appState.loadedMessages.length < targetCount) {
    const data = await apiRequest(
      `/message/${channelId}?start=${appState.loadedMessages.length}`
    );
    if (data.error) {
      showError(data.error, "Unable to refresh messages");
      return;
    }

    const page = Array.isArray(data.messages) ? data.messages : [];
    appState.loadedMessages = [...appState.loadedMessages, ...page];
    appState.hasMoreMessages = page.length === 25;
    if (page.length === 0) {
      break;
    }
  }

  await renderMessages({
    previousHeight,
    previousTop,
    preserveScroll: !scrollToBottomAfter,
    scrollToBottomAfter,
  });
}

async function fetchAllChannelMessages(channelId) {
  const allMessages = [];
  let start = 0;
  let hasMore = true;

  while (hasMore) {
    const data = await apiRequest(`/message/${channelId}?start=${start}`);
    if (data.error) {
      throw new Error(data.error);
    }

    const page = Array.isArray(data.messages) ? data.messages : [];
    allMessages.push(...page);
    hasMore = page.length === 25;
    start += page.length;

    if (page.length === 0) {
      break;
    }
  }

  return allMessages;
}

function buildReactionSummary(message) {
  const reactionSummary = document.createElement("div");
  reactionSummary.className = "message-reaction-summary";

  const grouped = REACT_OPTIONS.map((option) => {
    const users = message.reacts.filter((react) => react.react === option.id);
    return {
      ...option,
      count: users.length,
      reactedByCurrentUser: users.some(
        (react) => Number(react.user) === getCurrentLoginId()
      ),
    };
  }).filter((entry) => entry.count > 0);

  grouped.forEach((entry) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "message-reaction-chip";
    chip.classList.toggle("is-active", entry.reactedByCurrentUser);
    chip.innerText = `${entry.icon} ${entry.count}`;
    chip.addEventListener("click", async (event) => {
      event.stopPropagation();
      await toggleReaction(message.id, entry.id, entry.reactedByCurrentUser);
    });
    reactionSummary.appendChild(chip);
  });

  return reactionSummary;
}

async function createMessageElement(message) {
  const senderProfile = await getUserProfile(message.sender);
  const wrapper = document.createElement("div");
  wrapper.className = "right-content-mess";
  wrapper.dataset.messageId = String(message.id);

  const avatar = document.createElement("img");
  avatar.src = senderProfile && senderProfile.image ? senderProfile.image : DEFAULT_AVATAR;
  avatar.alt = senderProfile ? senderProfile.name : `User ${message.sender}`;
  avatar.addEventListener("click", (event) => {
    event.stopPropagation();
    handleUser(message.sender);
  });

  const content = document.createElement("div");
  content.className = "mess-user";

  const meta = document.createElement("div");
  meta.className = "mess-date";

  const author = document.createElement("span");
  author.innerText = senderProfile ? senderProfile.name : `User ${message.sender}`;
  author.addEventListener("click", (event) => {
    event.stopPropagation();
    handleUser(message.sender);
  });

  const sentAt = document.createElement("span");
  sentAt.innerText = handleTime(message.sentAt);

  meta.appendChild(author);
  meta.appendChild(sentAt);
  content.appendChild(meta);

  if (message.message) {
    const textNode = document.createElement("span");
    textNode.className = "message-content-text";
    textNode.innerText = message.message;
    content.appendChild(textNode);
  }

  if (message.image) {
    const image = document.createElement("img");
    image.className = "message-content-image";
    image.src = message.image;
    image.alt = "Message attachment";
    image.addEventListener("click", (event) => {
      event.stopPropagation();
      modalImage.src = message.image;
      modal.style.display = "block";
    });
    content.appendChild(image);
  }

  if (message.edited) {
    const editedStatus = document.createElement("span");
    editedStatus.className = "message-edited-status";
    editedStatus.innerText = `edited ${handleTime(message.editedAt)}`;
    content.appendChild(editedStatus);
  }

  if (message.reacts.length > 0) {
    content.appendChild(buildReactionSummary(message));
  }

  const emojiBar = document.createElement("div");
  emojiBar.className = "emoj";
  REACT_OPTIONS.forEach((option) => {
    const emojiAction = document.createElement("span");
    emojiAction.innerText = option.icon;
    emojiAction.addEventListener("click", async (event) => {
      event.stopPropagation();
      const hasReacted = message.reacts.some(
        (react) =>
          react.react === option.id && Number(react.user) === getCurrentLoginId()
      );
      await toggleReaction(message.id, option.id, hasReacted);
    });
    emojiBar.appendChild(emojiAction);
  });

  wrapper.appendChild(avatar);
  wrapper.appendChild(content);
  wrapper.appendChild(emojiBar);

  wrapper.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    hideContextMenus();

    appState.contextMessageId = Number(message.id);
    localStorage.setItem("messID", String(message.id));

    const isOwnMessage = Number(message.sender) === getCurrentLoginId();
    messageEditAction.style.display = isOwnMessage ? "block" : "none";
    messageDeleteAction.style.display = isOwnMessage ? "block" : "none";
    messagePinAction.innerText = message.pinned ? "Unpin from channel" : "Pin to channel";

    messageControl.style.left = `${event.clientX}px`;
    messageControl.style.top = `${event.clientY}px`;
    messageControl.style.display = "block";
  });

  return wrapper;
}

async function toggleReaction(messageId, react, reactedByCurrentUser) {
  const channelId = getCurrentChannelId();
  if (!channelId) {
    return;
  }

  const path = reactedByCurrentUser
    ? `/message/unreact/${channelId}/${messageId}`
    : `/message/react/${channelId}/${messageId}`;

  const data = await apiRequest(path, {
    method: "POST",
    body: { react },
  });

  if (data.error) {
    showError(data.error, "Reaction failed");
    return;
  }

  await reloadLoadedMessages();
}

async function postMessage(channelId) {
  const activeChannelId = channelId || getCurrentChannelId();
  if (!activeChannelId) {
    showError("Please select a channel first.", "No channel selected");
    return;
  }

  const message = inputText.value;
  if (!message.trim() && appState.messageDraftImage === undefined) {
    showError("Message cannot be empty.", "Unable to send message");
    return;
  }

  const data = await apiRequest(`/message/${activeChannelId}`, {
    method: "POST",
    body: {
      message,
      image: appState.messageDraftImage,
    },
  });

  if (data.error) {
    showError(data.error, "Unable to send message");
    return;
  }

  resetMessageComposer();
  await reloadLoadedMessages({ scrollToBottomAfter: true });
}

async function handleMessage(param) {
  const channelId = getCurrentChannelId();
  const messageId = appState.contextMessageId || Number(localStorage.getItem("messID"));
  if (!channelId || !messageId) {
    return;
  }

  const currentMessage = appState.loadedMessages.find(
    (message) => Number(message.id) === Number(messageId)
  );
  if (!currentMessage) {
    return;
  }

  if (param === 2) {
    changeMessageText.value = currentMessage.message || "";
    fileMess.value = "";
    appState.editDraftImage = undefined;
    appState.editingMessageId = Number(messageId);
    messageEditModal.style.display = "block";
    messageControl.style.display = "none";
    return;
  }

  if (param === 3) {
    const path = currentMessage.pinned
      ? `/message/unpin/${channelId}/${messageId}`
      : `/message/pin/${channelId}/${messageId}`;
    const data = await apiRequest(path, { method: "POST" });
    if (data.error) {
      showError(data.error, currentMessage.pinned ? "Unable to unpin" : "Unable to pin");
      return;
    }

    messageControl.style.display = "none";
    await reloadLoadedMessages();
    if (pinControl.style.display === "block") {
      await handlePined(channelId, 0);
    }
    return;
  }

  if (param === 4) {
    const data = await apiRequest(`/message/${channelId}/${messageId}`, {
      method: "DELETE",
    });
    if (data.error) {
      showError(data.error, "Unable to delete message");
      return;
    }

    messageControl.style.display = "none";
    await reloadLoadedMessages();
    if (pinControl.style.display === "block") {
      await handlePined(channelId, 0);
    }
  }
}

async function handleMessageSave() {
  const channelId = getCurrentChannelId();
  const messageId = appState.editingMessageId || appState.contextMessageId;
  if (!channelId || !messageId) {
    return;
  }

  const currentMessage = appState.loadedMessages.find(
    (message) => Number(message.id) === Number(messageId)
  );
  if (!currentMessage) {
    return;
  }

  const nextMessage = changeMessageText.value;
  const isSameText = nextMessage === (currentMessage.message || "");
  const hasImageChange = appState.editDraftImage !== undefined;

  if (isSameText && !hasImageChange) {
    showError(
      "Edited message must be different from the current message.",
      "Unable to save message"
    );
    return;
  }

  if (!nextMessage.trim() && !hasImageChange && !currentMessage.image) {
    showError("Message cannot be empty.", "Unable to save message");
    return;
  }

  const body = { message: nextMessage };
  if (hasImageChange) {
    body.image = appState.editDraftImage;
  }

  const data = await apiRequest(`/message/${channelId}/${messageId}`, {
    method: "PUT",
    body,
  });

  if (data.error) {
    showError(data.error, "Unable to save message");
    return;
  }

  closeChangeDetails();
  await reloadLoadedMessages();
  if (pinControl.style.display === "block") {
    await handlePined(channelId, 0);
  }
}

async function handlePined(channelId) {
  const activeChannelId = channelId || getCurrentChannelId();
  if (!activeChannelId) {
    showError("Please select a channel first.", "No channel selected");
    return;
  }

  if (pinControl.style.display === "block") {
    pinControl.style.display = "none";
    pinContainer.innerHTML = "";
    return;
  }

  try {
    const allMessages = await fetchAllChannelMessages(activeChannelId);
    const pinnedMessages = allMessages.filter((message) => message.pinned).reverse();

    pinContainer.innerHTML = "";
    if (pinnedMessages.length === 0) {
      showError("There are no pinned messages in this channel yet.", "No pinned messages");
      return;
    }

    const renderedPins = await Promise.all(
      pinnedMessages.map(async (message) => {
        const senderProfile = await getUserProfile(message.sender);
        const card = document.createElement("div");
        card.className = "pin-contenter";

        const header = document.createElement("div");
        header.className = "pin-header";

        const avatar = document.createElement("img");
        avatar.src = senderProfile && senderProfile.image ? senderProfile.image : DEFAULT_AVATAR;
        avatar.alt = senderProfile ? senderProfile.name : `User ${message.sender}`;

        const name = document.createElement("p");
        name.innerText = senderProfile ? senderProfile.name : `User ${message.sender}`;

        header.appendChild(avatar);
        header.appendChild(name);
        card.appendChild(header);

        if (message.message) {
          const body = document.createElement("div");
          body.className = "pin-message-body";
          body.innerText = message.message;
          card.appendChild(body);
        }

        if (message.image) {
          const image = document.createElement("img");
          image.className = "pin-message-image";
          image.src = message.image;
          image.alt = "Pinned attachment";
          image.addEventListener("click", () => {
            modalImage.src = message.image;
            modal.style.display = "block";
          });
          card.appendChild(image);
        }

        const time = document.createElement("span");
        time.innerText = handleTime(message.sentAt);
        card.appendChild(time);

        return card;
      })
    );

    renderedPins.forEach((card) => pinContainer.appendChild(card));
    pinControl.style.display = "block";
  } catch (error) {
    showError(error.message, "Unable to load pinned messages");
  }
}

async function handleUser(userId) {
  const data = await apiRequest(`/user/${userId}`);
  if (data.error) {
    showError(data.error, "Profile unavailable");
    return;
  }

  appState.viewedUserId = Number(userId);
  const isOwnProfile = Number(userId) === getCurrentLoginId();

  userName.innerText = data.name || "";
  userBlog.innerText = data.bio || "";
  userEmail.innerText = data.email || "";
  userImage.src = data.image || DEFAULT_AVATAR;
  userDetailPanel.style.display = "block";

  userEditControls.forEach((item) => {
    item.style.display = isOwnProfile ? "block" : "none";
  });
  profilePasswordSection.style.display = isOwnProfile ? "flex" : "none";
  profileNewPassword.value = "";
  profilePasswordToggle.checked = false;
  profileNewPassword.type = "password";

  if (isOwnProfile) {
    setOwnProfileHash();
  } else {
    setUserProfileHash(userId);
  }
}

function handleUserEdit(param) {
  closeError();
  userChangeModal.style.display = "block";
  appState.profileFieldBeingEdited = param;

  if (param === 1) {
    userChangeTitle.innerText = "Edit your name";
    userChangeValue.value = userName.innerText;
    return;
  }

  if (param === 2) {
    userChangeTitle.innerText = "Edit your bio";
    userChangeValue.value = userBlog.innerText;
    return;
  }

  userChangeTitle.innerText = "Edit your email";
  userChangeValue.value = userEmail.innerText;
}

async function handleUserDetails() {
  if (!appState.profileFieldBeingEdited) {
    return;
  }

  const value = userChangeValue.value;
  const body = {};

  if (appState.profileFieldBeingEdited === 1) {
    body.name = value;
  } else if (appState.profileFieldBeingEdited === 2) {
    body.bio = value;
  } else {
    body.email = value;
  }

  const data = await apiRequest("/user", {
    method: "PUT",
    body,
  });

  if (data.error) {
    showError(data.error, "Unable to update profile");
    return;
  }

  if (appState.viewedUserId) {
    delete appState.userCache[String(appState.viewedUserId)];
    await handleUser(appState.viewedUserId);
  }
  closeChangeDetails();
}

function toggleProfilePassword() {
  profileNewPassword.type = profilePasswordToggle.checked ? "text" : "password";
}

async function saveOwnPassword() {
  const password = profileNewPassword.value;
  if (!password.trim()) {
    showError("Please enter a new password.", "Unable to update password");
    return;
  }

  const data = await apiRequest("/user", {
    method: "PUT",
    body: { password },
  });

  if (data.error) {
    showError(data.error, "Unable to update password");
    return;
  }

  profileNewPassword.value = "";
  profilePasswordToggle.checked = false;
  profileNewPassword.type = "password";
}

async function handleLogout() {
  const data = await apiRequest("/auth/logout", {
    method: "POST",
  });

  if (data.error) {
    showError(data.error, "Unable to log out");
    return;
  }

  localStorage.removeItem("token");
  localStorage.removeItem("loginId");
  localStorage.removeItem("delChannelID");
  localStorage.removeItem("channelsDetails");

  appState.channelList = [];
  appState.currentChannelId = null;
  appState.currentChannel = null;
  appState.currentChannelMembership = false;
  appState.loadedMessages = [];
  appState.hasMoreMessages = true;
  appState.userCache = {};
  channelsContainer.innerHTML = "";
  showLoggedOutView();
  showLogin();
}

async function initialiseAuthenticatedView() {
  showLoggedInView();
  await displayChannels();

  const hashState = parseHash();
  if (hashState.profile) {
    await handleUser(hashState.profile);
    return;
  }

  const preferredChannelId =
    hashState.channels || appState.currentChannelId || localStorage.getItem("delChannelID");

  if (preferredChannelId) {
    await displayChannelDetails(preferredChannelId);
  }
}


rightContentPanel.addEventListener("scroll", async () => {
  if (
    rightContentPanel.scrollTop <= 40 &&
    getCurrentChannelId() &&
    !appState.isLoadingMessages &&
    appState.hasMoreMessages
  ) {
    await loadMessages(getCurrentChannelId());
  }
});

fileInput.addEventListener("change", async function handleDraftImage() {
  try {
    appState.messageDraftImage = await readImageFile(this.files[0]);
  } catch (error) {
    appState.messageDraftImage = undefined;
    this.value = "";
    showError(error.message, "Image upload failed");
  }
});

fileMess.addEventListener("change", async function handleEditImage() {
  try {
    appState.editDraftImage = await readImageFile(this.files[0]);
  } catch (error) {
    appState.editDraftImage = undefined;
    this.value = "";
    showError(error.message, "Image upload failed");
  }
});

userFile.addEventListener("change", async function handleProfileImage() {
  try {
    const image = await readImageFile(this.files[0]);
    const data = await apiRequest("/user", {
      method: "PUT",
      body: { image },
    });

    if (data.error) {
      showError(data.error, "Unable to update profile photo");
      return;
    }

    if (appState.viewedUserId) {
      delete appState.userCache[String(appState.viewedUserId)];
      await handleUser(appState.viewedUserId);
    }
  } catch (error) {
    showError(error.message, "Image upload failed");
  } finally {
    this.value = "";
  }
});

inputText.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    postMessage(getCurrentChannelId());
  }
});

modal.addEventListener("click", () => {
  modal.style.display = "none";
  modalImage.src = "";
});

window.addEventListener("click", (event) => {
  if (!channelControl.contains(event.target)) {
    channelControl.style.display = "none";
  }
  if (!messageControl.contains(event.target)) {
    messageControl.style.display = "none";
  }
});

window.addEventListener("hashchange", async () => {
  if (!hasToken()) {
    return;
  }

  const hashState = parseHash();
  if (hashState.profile) {
    await handleUser(hashState.profile);
    return;
  }

  if (hashState.channels) {
    await displayChannelDetails(hashState.channels);
    return;
  }

  if (appState.currentChannelId) {
    await displayChannelDetails(appState.currentChannelId);
  }
});

if (hasToken()) {
  initialiseAuthenticatedView();
} else {
  showLoggedOutView();
  showLogin();
}





