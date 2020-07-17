class Audio extends THREE.AudioListener {
    constructor() {
        super();
        // create an AudioListener and add it to the camera
        this.loader = new THREE.AudioLoader();
        this.addMusic();
    }

    addMusic() {
        // create a global audio source
        var music = this.music = new THREE.Audio(this); // this = THREE.AudioListener

        this.loader.load( 'audio/theme.mp3', function(buffer) {
            music.setBuffer(buffer);
            music.setLoop(true);
            music.play();
        });
    }
    
    setVolume(volume) {
        this.setMasterVolume(volume);
    }
}