import { Audio as TAudio, AudioListener, AudioLoader } from 'three';
import json from '../json/audio.json';

class Audio {
	constructor(manager) {
		this.cache = {};
		this.muted = false;
		this.listener = new AudioListener();
		this.loader = new AudioLoader(manager);
		this.volume = 1;
		this.queue = [];
	}

	load() {
		var _this = this;
		for (const [key, value] of Object.entries(json)) {
			this.loader.load(value.url, function(buffer) {
				var sound = new TAudio(_this.listener);
				sound.name = key;
				sound.setBuffer(buffer);

				// Add userData if available
                if (value.userData) {
                    sound.userData = value.userData;
                    if (sound.userData.loop) sound.setLoop(sound.userData.loop);
                    if (sound.userData.volume) sound.setVolume(sound.userData.volume);
                }
				_this.cache[key] = sound;
			});
		}

		// Add event listener
		window.addEventListener('playAudio', function(e) { _this.play(e.detail.name, e.detail.queue); });
		window.addEventListener('setVolume', function(e) {
			_this.volume = e.detail;
			_this.setMasterVolume(e.detail);
		});
		window.addEventListener('pointerup', function(e) { _this.playQueue(e.detail); });
	}

	play(name, queue = false) {
		if (queue == true) this.enqueue(name);
		else {
			if (this.cache[name]) {
				if (this.volume > 0) this.cache[name].play();
			}
		}
	}

	enqueue(name) {
		this.queue.push(name);
	}

	playQueue() {
		for (var i = 0; i < this.queue.length; i++) {
			this.play(this.queue[i]);
		}
		this.queue = [];
	}

	toggleVolume() {
		if (this.muted == true) {
			this.muted = false;
			this.setMasterVolume(this.volume); // Use previous volume
		}
		else {
			this.muted = true;
			this.volume = this.getMasterVolume(); // Update previous volume
			this.setMasterVolume(0);
		}
	}

	mute(mute) {
		this.muted = !mute; // Set state to opposite
		this.toggleVolume();
	}

	setMasterVolume(volume) {
		this.listener.setMasterVolume(volume);
	}

	getMasterVolume() {
		return this.volume
	}
}

export { Audio };