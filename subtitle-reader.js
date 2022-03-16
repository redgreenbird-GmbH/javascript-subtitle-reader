/**
 * Gamelogic
 */

/* Global vars */
const SUBTITLE_PATH = "assets/subtitles/";
var tipp = "Betrete das Lindengut";
var playingSubtitles = [];

// when pano changes, do this
function handleOnPanoChange() {
  stopExistingSubtitles();
  clearCurrentSubtitle();
}

function getStep(step) {
  console.log(`getStep(${step}) called`);

  var task = "";
  var doorClicked = null;
  var isVoicePlaying = null;
  var keyPickedUp = null;
  var keyUsed = null;
  var audioIsPlaying = null;

  switch (step) {
    case 1:
      // Executed if clicked on Door-Polygon
      // Starts Video of Sulzer
      // Trigger Case 1 if Video ended

      doorClicked = false;
      pano.setVariableValue("doorClicked", doorClicked);

      task = "Willkommen im Museum Lindengut.";
      tipp = "Ã–ffne die TÃ¼ren!";
      pano.setVariableValue("isFading", true);

      const EINGANG_SULZER = pano.getMediaObject("01_sulzer");
      EINGANG_SULZER.onloadeddata = function () {
        generateSubtitles(`${SUBTITLE_PATH}01_sulzer.srt`);

        EINGANG_SULZER.onended = function () {
          getStep(2);
        };
      };

      break;

    case 2:
      // Triggered if Video before ended
      // Plays Door Open Video
      doorClicked = pano.getVariableValue("doorClicked");
      if (!doorClicked) {
        doorClicked = true;
        pano.setVariableValue("doorClicked", doorClicked);

        task = "Das Spielzeug liegt auf dem FlÃ¼gel.";
        tipp = "MÃ¼sste das Spielzeug nicht auf dem FlÃ¼gel liegen?";

        if (!pano.isPlaying("01_door_open")) pano.playSound("01_door_open");

        const EINGANG_DOOR = pano.getMediaObject("01_door_open");
        EINGANG_DOOR.onended = function () {
          pano.setVariableValue("isFading", true);
          pano.openNext("{musikzimmer}");
        };
      }

      break;
    case 3:
      // After clicking on Piano
      // Searching for the Key
      task = "Finde den SchlÃ¼ssel.";
      tipp =
        "Der SchlÃ¼ssel befindet sich in der NÃ¤he des Stadtmodells. Vieleicht musst du etwas fester zudrÃ¼cken.";
      break;

    case 4:
      // Key picked up
      task = "Gehe zum Billardzimmer.";
      tipp = "Schau dir das GemÃ¤lde ein bisschen genauer an";
      break;

    case 5:
      step = pano.getVariableValue("step");
      task = pano.getVariableValue("task");
      tipp = pano.getVariableValue("tipp");
      keyPickedUp = pano.getVariableValue("keyPickedUp");

      pano.stopSound("04_spielzeug_sulzer");
      pano.stopSound("04_key_sulzer");
      pano.stopSound("04_ehepaar_sulzer");

      if (keyPickedUp) {
        pano.playSound("04_lock_sulzer");
        const LOCK_SULZER4 = pano.getMediaObject("04_lock_sulzer");

        LOCK_SULZER4.onended = function () {
          // update audio status
          audioIsPlaying = false;
          pano.setVariableValue("audioIsPlaying", audioIsPlaying);

          //new input modal
          showInputModal("Wann wurde das GemÃ¤lde gemalt?");
        };
      } else {
        // If key not picked up , play 'must find key' audio
        pano.playSound("04_key_sulzer");
        const FIND_KEY_SOUND = pano.getMediaObject("04_key_sulzer");
        FIND_KEY_SOUND.onended = function () {
          audioIsPlaying = false;
          pano.setVariableValue("audioIsPlaying", audioIsPlaying);
        };
      }

      break;

    case 6:
      // Entered Billardzimmer
      pano.setMediaVisibility("05_warten_sulzer", 0);
      const BILLARDZIMMER_VIDEO = pano.getMediaObject("05_sulzer");
      BILLARDZIMMER_VIDEO.onloadeddata = function () {
        generateSubtitles(`${SUBTITLE_PATH}05_sulzer.srt`);
        BILLARDZIMMER_VIDEO.onended = function () {
          pano.setMediaVisibility("05_sulzer", 0);
          pano.setMediaVisibility("05_warten_sulzer", 1);
        };
      }

      task = "Geh in das Schlafzimmer";
      tipp = "Im Billardzimmer kÃ¶nntest du eine Antwort darauf finden.";
      break;

    case 7:
      // Clicked on Key of Schlafzimmer
      step = pano.getVariableValue("step");
      task = pano.getVariableValue("task");
      tipp = pano.getVariableValue("tipp");

      pano.stopSound("07_lock_sulzer");
      pano.stopSound("07_landschaft_sulzer");
      pano.stopSound("07_bild_frauen_sulzer");
      pano.playSound("07_lock_sulzer");
      const LOCK_SULZER7 = pano.getMediaObject("07_lock_sulzer");

      LOCK_SULZER7.onended = function () {
        //new input modal
        showInputModal("Wie heisst das legendÃ¤re Schiff?");
      };

      break;

    case 8:
      // If clicked on Window
      // Go Outside
      task = "Kutscherhaus";
      tipp = "Folge Herrn Sulzer";
      pano.setVariableValue("isFading", true);
      pano.openNext("{garten}");
      break;

    case 9:
      // Triggered if clicked on Hotspot in Garten
      // Waitng for End of Video
      task = "Schlittschuhe?";
      tipp = "ZÃ¤hl die einzelnen Schlittschuhe an der Wand.";
      pano.setVariableValue("isFading", true);
      pano.openNext("{spielzimmer}");

      break;

    case 10:
      // Clicked on Schlittschuhe
      step = pano.getVariableValue("step");
      task = pano.getVariableValue("task");
      tipp = pano.getVariableValue("tipp");

      showInputModal("Wie viele Schlittschuhe hÃ¤ngen an der Wand?");
      break;
  }

  setVariables(
    step,
    task,
    tipp,
    doorClicked,
    keyPickedUp,
    isVoicePlaying,
    keyUsed,
    audioIsPlaying
  );
}

//#region AudioToggles
/**
 * 02_Musikzimmer Audio Functions
 */
function toggleStadtmodellMusikzimmerAudio() {
  if (pano.isPlaying("02_stadtmodell_sulzer")) return;
  pano.stopSound("02_piano_sulzer");
  pano.stopSound("02_piano_audio");
  pano.stopSound("02_decke_sulzer");
  PlayMedia("02_stadtmodell_sulzer");
  generateSubtitles(
    `${SUBTITLE_PATH}02 Musikzimmer Gemaelde Stadt Winterthur.srt`
  );
  pano.setMediaVisibility("02_piano_open", 0);
}

function toggleDeckeAudio() {
  if (pano.isPlaying("02_decke_sulzer")) return;
  pano.stopSound("02_piano_sulzer");
  pano.stopSound("02_piano_audio");
  pano.stopSound("02_stadtmodell_sulzer");
  PlayMedia("02_decke_sulzer");
  generateSubtitles(`${SUBTITLE_PATH}02 Musikzimmer Decke.srt`);
  pano.setMediaVisibility("02_piano_open", 0);
}

function togglePianoAudio() {
  pano.stopSound("02_decke_sulzer");
  pano.stopSound("02_stadtmodell_sulzer");

  PlayStopMedia("02_piano_sulzer");
  PlayStopMedia("02_piano_audio");

  stopExistingSubtitles();
  clearCurrentSubtitle();
  if (
    pano.isPlaying('02_piano_sulzer')
  ) {
    generateSubtitles(`${SUBTITLE_PATH}02 Musikzimmer Fluegel.srt`);
  }
  pano.setMediaVisibility("02_piano_open", 2);

  // reset on sulzer ended
  const SULZER_PIANO = pano.getMediaObject("02_piano_sulzer");
  SULZER_PIANO.addEventListener("ended", function () {
    StopMedia("02_piano_audio");
    pano.setMediaVisibility("02_piano_open", 2);
  });
}

/* function togglePianoOpen() {
  var pianoOpen = pano.getVariableValue("pianoOpen");
  if (pianoOpen) {
    pano.setVariableValue("pianoOpen", false);
    console.log("pianoOpen = false");
  } else {
    stopExistingSubtitles();
    pano.setVariableValue("pianoOpen", true);
    console.log("pianoOpen = true");
  }
} */

/**
 * 03_Stadtmodell_Zimmer Audio Functions
 */
function toggleStadtModellTischAudio() {
  if (pano.isPlaying("03_stadtmodell_sulzer")) return;
  pano.stopSound("03_ofen_sulzer");
  PlayMedia("03_stadtmodell_sulzer");
  generateSubtitles(`${SUBTITLE_PATH}03 Modellzimmer Modell.srt`);
}

function toggleOfenAudio() {
  if (pano.isPlaying("03_ofen_sulzer")) return;
  pano.stopSound("03_stadtmodell_sulzer");
  PlayMedia("03_ofen_sulzer");
  generateSubtitles(`${SUBTITLE_PATH}03 Modellzimmer Ofen.srt`);
}

/**
 * 04_Arbeitszimmer Audio Functions
 */
function toggleEhepaarAudio() {
  if (pano.isPlaying("04_ehepaar_sulzer")) return;
  pano.stopSound("04_spielzeug_sulzer");
  pano.stopSound("04_key_sulzer");
  pano.stopSound("04_lock_sulzer");
  PlayMedia("04_ehepaar_sulzer");
  generateSubtitles(`${SUBTITLE_PATH}04 Arbeitszimmer Ehepaar.srt`);
}

function toggleSpielzeugAudio() {
  if (pano.isPlaying("04_spielzeug_sulzer")) return;
  pano.stopSound("04_key_sulzer");
  pano.stopSound("04_lock_sulzer");
  pano.stopSound("04_ehepaar_sulzer");
  PlayMedia("04_spielzeug_sulzer");
  generateSubtitles(`${SUBTITLE_PATH}04 Arbeitszimmer Falsches Spielzeug.srt`);
}

function toggleFindKeyAudio() {
  if (pano.isPlaying("04_key_sulzer")) return;
  pano.stopSound("04_spielzeug_sulzer");
  pano.stopSound("04_lock_sulzer");
  pano.stopSound("04_ehepaar_sulzer");
  PlayMedia("04_key_sulzer");
  generateSubtitles(`${SUBTITLE_PATH}04 Arbeitszimmer Schluessel.srt`);
}

/**
 * 07_Treppenhaus Audio Functions
 */
function toggleFrauenAudio() {
  if (pano.isPlaying("07_bild_frauen_sulzer")) return;
  pano.stopSound("07_landschaft_sulzer");
  pano.stopSound("07_lock_sulzer");
  PlayMedia("07_bild_frauen_sulzer");
  generateSubtitles(`${SUBTITLE_PATH}07 Treppe Gemaelde.srt`);
}

function toggleLandschaftAudio() {
  if (pano.isPlaying("07_landschaft_sulzer")) return;
  pano.stopSound("07_bild_frauen_sulzer");
  pano.stopSound("07_lock_sulzer");
  PlayMedia("07_landschaft_sulzer");
  generateSubtitles(`${SUBTITLE_PATH}07 Treppe Ideale Landschaften.srt`);
}

/**
 * 08_Schlafzimmer Audio Functions
 */
function toggleTischAudio() {
  if (pano.isPlaying("08_tisch_sulzer")) return;
  pano.stopSound("08_ofen_sulzer");
  pano.stopSound("08_outdoor_sulzer");
  PlayMedia("08_tisch_sulzer");
  generateSubtitles(`${SUBTITLE_PATH}08 Schlafzimmer Tisch.srt`);

  const SPIELZIMMER_VIDEO = pano.getMediaObject("08_tisch_sulzer");
  SPIELZIMMER_VIDEO.onended = function () {
    pano.playSound("08_outdoor_sulzer");
  };
}

function toggleOfenTrauZimmerAudio() {
  if (pano.isPlaying("08_ofen_sulzer")) return;
  pano.stopSound("08_tisch_sulzer");
  pano.stopSound("08_outdoor_sulzer");
  PlayMedia("08_ofen_sulzer");
  generateSubtitles(`${SUBTITLE_PATH}08 Schlafzimmer Ofen.srt`);

  const SPIELZIMMER_VIDEO = pano.getMediaObject("08_ofen_sulzer");
  SPIELZIMMER_VIDEO.onended = function () {
    pano.playSound("08_outdoor_sulzer");
  };
}
//#endregion

/**
 * Helper Functions
 */
function encodeUTF8(str) {
  str = str.replace(/Ã¤/g, "\u00e4");
  str = str.replace(/Ã„/g, "\u00c4");
  str = str.replace(/Ã¶/g, "\u00f6");
  str = str.replace(/Ã–/g, "\u00d6");
  str = str.replace(/Ã¼/g, "\u00fc");
  str = str.replace(/Ãœ/g, "\u00dc");
  return str;
}

function setVariables(
  step,
  task,
  tipp,
  doorClicked,
  pianoOpen,
  keyPickedUp,
  isVoicePlaying,
  keyUsed,
  audioIsPlaying
) {
  pano.setVariableValue("step", step);
  pano.setVariableValue("task", encodeUTF8(task));
  pano.setVariableValue("tipp", encodeUTF8(tipp));
  pano.setVariableValue("doorClicked", doorClicked);
  pano.setVariableValue("pianoOpen", pianoOpen);
  pano.setVariableValue("keyPickedUp", keyPickedUp);
  pano.setVariableValue("isVoicePlaying", isVoicePlaying);
  pano.setVariableValue("keyUsed", keyUsed);
  pano.setVariableValue("audioIsPlaying", audioIsPlaying);
}

function ToggleMediaPlayback(mediaID) {
  console.log(`ToggleMediaPlayback ${mediaID}`);
  if (pano.isPlaying(mediaID)) pano.pauseSound(mediaID);
  else pano.playSound(mediaID);
}
function PlayMedia(mediaID) {
  if (!pano.isPlaying(mediaID)) pano.playSound(mediaID);
}
function PlayStopMedia(mediaID) {
  if (!pano.isPlaying(mediaID)) pano.playSound(mediaID);
  else pano.stopSound(mediaID);
}
function StopMedia(mediaID) {
  pano.stopSound(mediaID);
}

//#region Modal
function showTipp() {
  $("#defaultModalText").text(tipp);
  $("#defaultModal").modal("show");
}
function showInputModal(question) {
  $("#inputModalText").text(question);
  $("#inputModal").modal("show");
}

function validateInput(input) {
  console.log("validateInput");
  if (input == null) return;
  input = input.toLowerCase().trim();

  switch (pano.getVariableValue("step")) {
    case 4:
      validateInputArbeitszimmer(input);
      break;
    case 6:
      validateInputTreppenhaus(input);
      break;
    case 9:
      validateInputSpielzimmer(input);
      break;
  }

  $("#inputModalInput").val("");
}

function validateInputArbeitszimmer(input) {
  // gamelogic
  if (input == "1648") {
    // If input is valid -> Go to Billardzimmer
    pano.playSound("04_door");
    pano.setVariableValue("keyUsed", true);
    pano.removeHotspot("04_lock");
    pano.hideOnePolyHotspot("key_symbol");

    const ARBEITSZIMMER_VIDEO = pano.getMediaObject("04_door");
    ARBEITSZIMMER_VIDEO.onended = function () {
      pano.setVariableValue("isFading", true);
      pano.openNext("{billardzimmer}");
    };

    step = 5;
  } else {
    pano.stopSound("04_lock_sulzer");
    tipp = "Das GemÃ¤lde wurde 1648 gemalt.";
    if (!input) return;
    pano.playSound("wrong");
  }
}

function validateInputTreppenhaus(input) {
  if (input == "ida ziegler") {
    pano.removeHotspot("07_lock");
    pano.playSound("07_door");
    task = "HÃ¶r gut hin";
    tipp = "Das Fenster";
    setVariables(step, task, tipp);

    const SCHLAFZIMMER_VIDEO = pano.getMediaObject("07_door");
    SCHLAFZIMMER_VIDEO.onended = function () {
      pano.setVariableValue("isFading", true);
      pano.openNext("{schlafzimmer}");
    };
  } else {
    pano.stopSound("07_lock_sulzer");
    if (!input) return;
    pano.playSound("wrong");
  }
}

function validateInputSpielzimmer(input) {
  if (input == "8") {
    pano.setVariableValue("isFading", true);
    pano.openNext("{spielzimmer4}");
    task = "";
    tipp = "";

    const SPIELZIMMER_VIDEO = pano.getMediaObject("10_karussell");
    SPIELZIMMER_VIDEO.onloadeddata = function () {
      generateSubtitles(`${SUBTITLE_PATH}10_karussell.srt`);
      SPIELZIMMER_VIDEO.onended = function () {
        setTimeout(function () {
          $("#modalConfirm").modal("show");
        }, 1500);
      };
    }
  } else {
    if (!input) return;
    pano.stopSound("10_schlittschuhe_sulzer");
    pano.playSound("wrong");
  }
}
//#endregion

//#region Cheats
function GetKey() {
  keyPickedUp = true;
  pano.setVariableValue("keyPickedUp", true);
  getStep(4);
  console.log("Key picked up");
}
function GoTo(roomID) {
  switch (roomID) {
    case "arbeitszimmer":
      GetKey();
      break;
    case "spielzimmmer":
      getStep(9);
      break;
    default:
      break;
  }
  pano.openNext(`{${roomID}}`);
}
//#endregion

//#region Subtitle Management

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
var PF_SRT = function () {
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
}();

//#endregion
