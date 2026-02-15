# Sound Files for Psychology Experiment

This directory should contain three sound files for the experiment:

## Required Files

1. **jar-clink.mp3** - Glass jars clinking sound
   - Played when jar grids appear with slide-in animation
   - Duration: ~1-2 seconds
   - Volume: Medium (0.5)

2. **ball-bounce.mp3** - Ball bouncing sound
   - Played when a ball is drawn from the jar
   - Duration: ~1 second
   - Volume: Low-Medium (0.3)

3. **jar-shake.mp3** - Jar shaking/rattling sound
   - Played before a ball is drawn (jar shake animation)
   - Duration: ~0.5 seconds
   - Volume: Medium (0.4)

## Where to Find Free Sound Effects

### Option 1: Freesound.org (Recommended)
- Website: https://freesound.org
- License: Look for CC0 (Public Domain) sounds
- Search terms:
  - "glass clink"
  - "ball bounce"
  - "jar shake" or "bottle shake"

### Option 2: Zapsplat.com
- Website: https://www.zapsplat.com
- License: Free tier available
- Search terms: Same as above

### Option 3: Mixkit.co
- Website: https://mixkit.co/free-sound-effects/
- License: Free for commercial use
- Browse: Sound effects > Objects

### Option 4: Pixabay Sound Effects
- Website: https://pixabay.com/sound-effects/
- License: Free for commercial use
- Search terms: "glass", "bounce", "shake"

## How to Add Sounds

1. Download the sound files in MP3 format
2. Rename them to exactly:
   - `jar-clink.mp3`
   - `ball-bounce.mp3`
   - `jar-shake.mp3`
3. Place them in this directory (`/public/sounds/`)
4. Restart the development server if running

## Placeholder Sounds

If you can't find suitable sounds immediately, you can:
1. Use any MP3 files as placeholders (rename them appropriately)
2. The experiment will work without sounds, but audio features won't function
3. Comment out audio calls in components if needed

## Testing Sounds

To test if sounds are working:
1. Open browser console
2. Check for "AudioManager initialized successfully" message
3. Click around in the app - sounds should play during animations
4. Use the mute button if sounds are too loud

## Tips

- Keep file sizes small (< 100KB per file)
- MP3 format is preferred for broad compatibility
- Test volume levels - they should not be jarring
- Ensure sounds don't overlap or cause audio clipping
