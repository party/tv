var source;
var buffer;
var audioBuffer;
var dropArea;
var audioContext;
var processor;
var analyser;
var freqByteData;
var levels;
var isPlayingAudio = false;
var normLevel =0;

function getMicInput() {

	analyser = window.parent.analyser1;
	startViz();
	showTag();
}


function startViz(){
	freqByteData = new Uint8Array(analyser.frequencyBinCount);
	levels = [];
	isPlayingAudio = true;

	showTag();
}