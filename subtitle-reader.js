/* Global vars */
const SUBTITLE_PATH = "/assets/subtitles/";
var playingSubtitles = [];

// when pano changes, do this
function stop() {
  stopExistingSubtitles();
  clearCurrentSubtitle();
}

/**
 * Subtitle Naming Convention
 *
 * 1. all letters lowercase
 * 2. Use Underlines to combine words (_)
 * 3. Don't use Spaces ( )!
 * 4. Put all Subtitles in one folder
 * 5. Use the Name of the Source File (audio.mp3 / video.mp4)
 * 6. Structure:
 *
 * {NAME_OF_AUDIO_FILE}_{LANGUAGE_TAG}.srt
 *
 * for example:
 * Audio File: interview_peter.mp3
 * Subtitle File: interview_peter.mp3
 */

// call this function
function generateSubtitles(filePath) {
  parseSrtFile(filePath);
}

function iterateSubtitles(subtitles) {
  // subtitle background CSS class: subtitle-background
  // subtitle text CSS class: subtitle-text
  // subtitle toggle button CSS class: subtitle-toggle-button

  stopExistingSubtitles();

  subtitles.forEach((subtitle) => {
    var startTime = convertTimecodeInMilliseconds(subtitle.startTime);
    var endTime = convertTimecodeInMilliseconds(subtitle.endTime);
    duration = endTime - startTime;
    playingSubtitles.push(
      setTimeout(() => {
        setSubtitleText(subtitle.text);
      }, startTime)
    );
  });

  // end of subtitles
  var amountOfSubtitles = subtitles.length;
  var lastSubtitle = subtitles[amountOfSubtitles - 1];
  var subtitleEnd = convertTimecodeInMilliseconds(lastSubtitle.endTime);

  // make subtitle empty when finished
  playingSubtitles.push(
    setTimeout(() => {
      clearCurrentSubtitle();
    }, subtitleEnd)
  );
}

function setSubtitleText(text) {
  console.log(text);
  pano.setVariableValue("subtitleText", text);
}

function clearCurrentSubtitle() {
  pano.setVariableValue("subtitleText", "");
}

function stopExistingSubtitles() {
  if (playingSubtitles != null)
    playingSubtitles.forEach((playingSubtitle) => {
      clearTimeout(playingSubtitle);
    });
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

function convertTimecodeInMilliseconds(timecode) {
  // Input looks like this: 00:00:20,487
  var split = timecode.split(":");
  var milliseconds = 0;
  milliseconds += parseInt(split[0]) * 60 * 60 * 1000;
  milliseconds += parseInt(split[1]) * 60 * 1000;
  milliseconds += parseInt(split[2]) * 1000;
  return milliseconds;
}

/**
 * SRT Parser
 */
/* https://stackoverflow.com/questions/33145762/parse-a-srt-file-with-jquery-javascript/33147421 */
var PF_SRT = (function () {
  var pattern =
    /(\d+)\n([\d:,]+)\s+-{2}\>\s+([\d:,]+)\n([\s\S]*?(?=\n{2}|$))/gm;
  var _regExp;

  var init = function () {
    _regExp = new RegExp(pattern);
  };

  var parse = function (f) {
    // if (typeof f != "string") throw "Sorry, Parser accept string only.";

    var result = [];
    if (f == null) return _subtitles;

    f = f.replace(/\r\n|\r|\n/g, "\n");

    while ((matches = pattern.exec(f)) != null) {
      result.push(toLineObj(matches));
    }
    return result;
  };

  var toLineObj = function (group) {
    return {
      line: group[1],
      startTime: group[2],
      endTime: group[3],
      text: group[4],
    };
  };
  init();
  return {
    parse: parse,
  };
})();

//#endregion
