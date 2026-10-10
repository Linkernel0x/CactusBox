const playerInstance = new Player();

const audioPlayer = document.getElementById('audio-player');
const currentTitle = document.getElementById('current-title');
const playBtn = document.getElementById('play-btn');
const queueList = document.getElementById('queue-list');
const libraryList = document.getElementById('library-list');
const volumeInput = document.getElementById('volume');

let timerTimeout = null;

function updateButtonsUI() {
    playBtn.innerHTML = audioPlayer.paused ? '<i class="fa-solid fa-play"></i>' : '<i class="fa-solid fa-pause"></i>';

    const mode = playerInstance.settings.playMode;
    document.getElementById("repeat-btn").classList.toggle("active", mode === 1);
    document.getElementById("repeat1-btn").classList.toggle("active", mode === 2);
    document.getElementById("shuffle-btn").classList.toggle("active", mode === 3);

    document.getElementById("timer-btn").classList.toggle("active", timerTimeout !== null);
}

function renderQueue() {
    queueList.innerHTML = '';

    playerInstance.queue.forEach((track, index) => {
        const li = document.createElement('li');
        if (index === playerInstance.currentIndex) li.classList.add('active');

        const info = document.createElement('div');
        info.className = 'track-info';
        info.innerHTML = `<span>${index + 1}. ${track.title}</span><span class="track-author">${track.author}</span>`;
        info.addEventListener('click', () => {
            loadTrack(index);
            audioPlayer.play();
            updateButtonsUI();
        });

        const removeBtn = document.createElement('button');
        removeBtn.className = 'mini critical';
        removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removeFromQueue(index);
        });

        li.appendChild(info);
        li.appendChild(removeBtn);
        queueList.appendChild(li);
    });

    if (playerInstance.queue[playerInstance.currentIndex]) {
        currentTitle.textContent = `${playerInstance.queue[playerInstance.currentIndex].title} - ${playerInstance.queue[playerInstance.currentIndex].author}`;
    } else {
        currentTitle.textContent = "No song in queue";
    }
}

function renderLibrary() {
    libraryList.innerHTML = '';

    playerInstance.library.forEach((track, index) => {
        const li = document.createElement('li');

        const info = document.createElement('div');
        info.className = 'track-info';
        info.innerHTML = `<span>${track.title}</span><span class="track-author">${track.author}</span>`;

        const btnGroup = document.createElement('div');
        btnGroup.className = 'track-buttons';

        const addQueueBtn = document.createElement('button');
        addQueueBtn.className = 'mini primary';
        addQueueBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
        addQueueBtn.title = 'Add to Queue';
        addQueueBtn.addEventListener('click', () => addToQueue(track));

        const removeLibBtn = document.createElement('button');
        removeLibBtn.className = 'mini critical';
        removeLibBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        removeLibBtn.title = 'Remove from Library';
        removeLibBtn.addEventListener('click', () => removeFromLibrary(index));

        btnGroup.appendChild(addQueueBtn);
        btnGroup.appendChild(removeLibBtn);

        li.appendChild(info);
        li.appendChild(btnGroup);
        libraryList.appendChild(li);
    });
}

function loadTrack(index) {
    if (index >= 0 && index < playerInstance.queue.length) {
        playerInstance.currentIndex = index;
        audioPlayer.src = playerInstance.queue[playerInstance.currentIndex].url;
        playerInstance.saveToStorage();
        renderQueue();
    }
}

function addToQueue(track) {
    playerInstance.queue.push(track);
    playerInstance.saveToStorage();
    renderQueue();
}

function removeFromQueue(index) {
    playerInstance.queue.splice(index, 1);
    if (playerInstance.currentIndex >= playerInstance.queue.length) {
        playerInstance.currentIndex = Math.max(0, playerInstance.queue.length - 1);
    }
    playerInstance.saveToStorage();
    renderQueue();
    if (playerInstance.queue.length > 0) loadTrack(playerInstance.currentIndex);
}

function removeFromLibrary(index) {
    playerInstance.library.splice(index, 1);
    playerInstance.saveToStorage();
    renderLibrary();
}

function togglePlay() {
    if (!audioPlayer.src && playerInstance.queue.length > 0) {
        loadTrack(playerInstance.currentIndex);
    }

    if (audioPlayer.paused) {
        audioPlayer.play();
    } else {
        audioPlayer.pause();
    }
    updateButtonsUI();
}

function skipTrack() {
    const mode = playerInstance.settings.playMode;

    if (mode === 2) {
        loadTrack(playerInstance.currentIndex); // Repeat 1
    } else if (mode === 3) {
        const randomIdx = Math.floor(Math.random() * playerInstance.queue.length);
        loadTrack(randomIdx); // Shuffle
    } else if (playerInstance.currentIndex + 1 < playerInstance.queue.length) {
        loadTrack(playerInstance.currentIndex + 1);
    } else if (mode === 1) {
        loadTrack(0); // Repeat All
    } else {
        audioPlayer.pause();
        updateButtonsUI();
        return;
    }

    audioPlayer.play();
    updateButtonsUI();
}

function previousTrack() {
    if (playerInstance.currentIndex - 1 >= 0) {
        loadTrack(playerInstance.currentIndex - 1);
        audioPlayer.play();
        updateButtonsUI();
    }
}

function stopAudio() {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
    updateButtonsUI();
}

function setPlayMode(mode) {
    playerInstance.settings.playMode = playerInstance.settings.playMode === mode ? 0 : mode;
    playerInstance.saveToStorage();
    updateButtonsUI();
}

function setSleepTimer(minutes) {
    if (timerTimeout) {
        clearTimeout(timerTimeout);
        timerTimeout = null;
    }

    if (!minutes) return;

    try {
        timerTimeout = setTimeout(() => {
            togglePlay();
        }, minutes * 60 * 1000);
    } catch {
        alert('Incorrect timer value.')
    }

    updateButtonsUI();
}

function handleAddTrack(event) {
    event.preventDefault();
    const titleInput = document.getElementById('track-title');
    const authorInput = document.getElementById('track-author');
    const urlInput = document.getElementById('track-url');

    const newTrack = {
        title: titleInput.value.trim(),
        author: authorInput.value.trim() || "V.A.",
        url: urlInput.value.trim()
    };

    playerInstance.library.push(newTrack);
    playerInstance.saveToStorage();

    titleInput.value = '';
    authorInput.value = '';
    urlInput.value = '';

    renderLibrary();
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("play-btn").addEventListener("click", togglePlay);
    document.getElementById("skip-btn").addEventListener("click", skipTrack);
    document.getElementById("previous-btn").addEventListener("click", previousTrack);
    document.getElementById("stop-btn").addEventListener("click", stopAudio);

    // PlayMode
    document.getElementById("repeat-btn").addEventListener("click", () => setPlayMode(1));
    document.getElementById("repeat1-btn").addEventListener("click", () => setPlayMode(2));
    document.getElementById("shuffle-btn").addEventListener("click", () => setPlayMode(3));

    // Timer
    document.getElementById("timer-btn").addEventListener("click", () => {
        const val = prompt("Enter timer duration (minutes):");
        if (val) {
            setSleepTimer(parseFloat(val))
        } else {
            alert("Incorrect value");
        }
    });
    document.getElementById("timer-end-btn").addEventListener("click", () => setSleepTimer(false));
    document.getElementById("timer-2-btn").addEventListener("click", () => setSleepTimer(2));
    document.getElementById("timer-10-btn").addEventListener("click", () => setSleepTimer(10));
    document.getElementById("timer-20-btn").addEventListener("click", () => setSleepTimer(20));
    document.getElementById("timer-60-btn").addEventListener("click", () => setSleepTimer(60));

    volumeInput.value = playerInstance.settings.volume;
    audioPlayer.volume = playerInstance.settings.volume;
    volumeInput.addEventListener("input", (e) => {
        audioPlayer.volume = e.target.value;
        playerInstance.settings.volume = parseFloat(e.target.value);
        playerInstance.saveToStorage();
    });

    document.getElementById("add-form").addEventListener("submit", handleAddTrack);

    audioPlayer.addEventListener('ended', skipTrack);

    renderLibrary();
    renderQueue();
    if (playerInstance.queue.length > 0) {
        loadTrack(playerInstance.currentIndex);
    }
    updateButtonsUI();
});