import skins from '../../json/skins.json';

// Format existing skins
skins.forEach(skin => {
  skin.overlay = true;
  skin.tag = skin.title;
});

// Export levels as json data
export default skins;