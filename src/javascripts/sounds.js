import { soundManager } from 'soundmanager2';
import dailyDoubleSound from '../sounds/dailydouble.mp3';
import buzzerSound from '../sounds/buzzer.mp3';
import waitingSound from '../sounds/waiting-8bit.m4a';

soundManager.setup({
  preferFlash: false,
  onready() {
    soundManager.createSound({
      id: 'dailydouble',
      url: dailyDoubleSound,
      volume: 100,
      multiShot: false,
    });

    soundManager.createSound({
      id: 'buzzer',
      url: buzzerSound,
      volume: 100,
      multiShot: false,
    });

    soundManager.createSound({
      id: 'waiting',
      url: waitingSound,
      volume: 10,
      multiShot: false,
    });
  },
});

export default soundManager;
