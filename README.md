# SRT Reader for Web
## Subtitle Naming Convention
  
1. All letters lowercase
1. Use Underlines to combine words (_)
1. Don't use Spaces!
1. Put all Subtitles in one folder
1. Use the Name of the Source File (audio.mp3 / video.mp4)
1. Structure:
  `{NAME_OF_AUDIO_FILE}_{LANGUAGE_TAG}.srt`
 
For example:
- Audio File: interview_peter.mp3
- Subtitle File: interview_peter.mp3

## Setup the Output
Define this Variable
```js
const SUBTITLE_PATH = "YOUR_PATH";
```

And also define these Functions here. They will manage the output.
```js
function setSubtitleText(text) {}

function clearCurrentSubtitleText() {}
```

## Generate your first Subtitle
Call this Function to generate a Subtitle
```js
function generateSubtitles(filePath) {}
```