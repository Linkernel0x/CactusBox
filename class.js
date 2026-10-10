class Player {
    constructor(
        queue = [
            { title: "Western Frontier Rag", author: "V.A.", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
            { title: "Saloon Piano Melodies", author: "V.A.", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
            { title: "Dusty Trail Acoustic", author: "V.A.", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
        ],
        library = [
            { title: "Western Frontier Rag", author: "V.A.", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
            { title: "Saloon Piano Melodies", author: "V.A.", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
            { title: "Dusty Trail Acoustic", author: "V.A.", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
        ],
        currentIndex = 0,
        settings = {
            playMode: 0, // 0: Off, 1: Repeat All, 2: Repeat One, 3: Shuffle
            volume: 0.8
        }
    ) {
        this.queue = queue;
        this.library = library;
        this.currentIndex = currentIndex;
        this.settings = settings;

        this.loadFromStorage();
    }

    saveToStorage() {
        const data = {
            queue: this.queue,
            library: this.library,
            currentIndex: this.currentIndex,
            settings: this.settings
        };
        localStorage.setItem('cactusbox_player', JSON.stringify(data));
    }

    loadFromStorage() {
        const savedData = localStorage.getItem('cactusbox_player');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                this.queue = parsed.queue || this.queue;
                this.library = parsed.library || this.library;
                this.currentIndex = parsed.currentIndex ?? this.currentIndex;
                this.settings = parsed.settings ?? this.settings;
            } catch (e) {
                console.error("Error loading state:", e);
            }
        }
    }
}