// The Directory Path where all Subtitles are located in
const SUBTITLE_PATH = "assets/subtitles/";
const DELAY = 1000;

// List of all Subtitles in the current File
var playingSubtitles = [];

// The Main Function of the Reader
function generateSubtitles(filePath) {
  parseSrtFile(filePath);
}

function setSubtitleText(text) {
  // Use this Function to output the current Text
  // It will be updated dynamically

  // Example:
  // subtile.text = text;
  pano.setVariableValue("subtitleText", text);

  console.log(text);
}

function clearCurrentSubtitleText() {
  // Use this Function to clean up the Subtitle
  // Example:
  // subtile.text = "";
}

function parseSrtFile(filePath) {
  try {
    // read srt file data
    jQuery.get(filePath, function (data) {
      console.log("successfully read file " + filePath);

      // parse the subtitles
      var result = PF_SRT.parse(data);

      // iterate subtitles
      iterateSubtitles(result);
    });
  } catch (e) {
    alert(e);
  }
}

function iterateSubtitles(subtitles) {
  // First stop already existing Subtitles
  stopExistingSubtitles();

  // Set Timeout for all Subtitles
  subtitles.forEach((subtitle) => {
    var startTime = convertTimecodeInMilliseconds(subtitle.startTime);
    var endTime = convertTimecodeInMilliseconds(subtitle.endTime);
    duration = endTime - startTime;
    playingSubtitles.push(
      setTimeout(() => {
        setSubtitleText(subtitle.text);
      }, startTime + DELAY)
    );
  });

  // End of Subtitles
  var amountOfSubtitles = subtitles.length;
  var lastSubtitle = subtitles[amountOfSubtitles - 1];
  var subtitleEnd = convertTimecodeInMilliseconds(lastSubtitle.endTime);

  // Make Subtitle empty when finished
  playingSubtitles.push(
    setTimeout(() => {
      clearCurrentSubtitleText();
    }, subtitleEnd)
  );
}

function stopExistingSubtitles() {
  if (playingSubtitles != null)
    playingSubtitles.forEach((playingSubtitle) => {
      clearTimeout(playingSubtitle);
    });
}

// This Function Converts Timecode in Milliseconds
function convertTimecodeInMilliseconds(timecode) {
  // Input looks like this: 00:00:20,487
  var split = timecode.split(":");
  var milliseconds = 0;
  milliseconds += parseInt(split[0]) * 60 * 60 * 1000;
  milliseconds += parseInt(split[1]) * 60 * 1000;
  milliseconds += parseInt(split[2]) * 1000;
  return milliseconds;
}
