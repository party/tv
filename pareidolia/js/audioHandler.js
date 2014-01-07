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

	//x-browser
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

	if (navigator.getUserMedia ) {

		navigator.getUserMedia({audio: true}, function(stream) {
			//called after user has enabled mic access
			source = audioContext.createBufferSource();
			analyser = audioContext.createAnalyser();
			analyser.fftSize = 1024;

			microphone = audioContext.createMediaStreamSource(stream);
			microphone.connect(analyser);
			startViz();

			showTag();

		});
	}
}

//load sample MP3
function loadSampleAudio() {

	source = audioContext.createBufferSource();
	analyser = audioContext.createAnalyser();
	analyser.fftSize = 1024;

	// Connect audio processing graph
	source.connect(analyser);
	analyser.connect(audioContext.destination);
	loadAudioBuffer("mp3/computer_jazz.mp3");
}

function loadAudioBuffer(url) {
	// Load asynchronously
	var request = new XMLHttpRequest();
	request.open("GET", url, true);
	request.responseType = "arraybuffer";

	request.onload = function() {
		audioBuffer = audioContext.createBuffer(request.response, false );
		finishLoad();
	};

	request.send();
}

function finishLoad() {
	source.buffer = audioBuffer;
	source.loop = true;
	source.noteOn(0.0);
	startViz();
}

function onDocumentDragOver(evt) {
	introPanel.style.display = 'none';
	evt.stopPropagation();
	evt.preventDefault();
	return false;
}

//load dropped MP3
function onDocumentDrop(evt) {
	evt.stopPropagation();
	evt.preventDefault();

	if (source) source.disconnect();

	var droppedFiles = evt.dataTransfer.files;

	var reader = new FileReader();

	reader.onload = function(fileEvent) {
		var data = fileEvent.target.result;
		initAudio(data);
	};

	reader.readAsArrayBuffer(droppedFiles[0]);
}

function initAudio(data) {
	source = audioContext.createBufferSource();

	if(audioContext.decodeAudioData) {
		audioContext.decodeAudioData(data, function(buffer) {
			source.buffer = buffer;
			createAudio();
		}, function(e) {
			console.log(e);
		});
	} else {
		source.buffer = audioContext.createBuffer(data, false );
		createAudio();
	}
}


function createAudio() {
	processor = audioContext.createJavaScriptNode(2048 , 1 , 1 );

	analyser = audioContext.createAnalyser();
	analyser.smoothingTimeConstant = 0.1;

	source.connect(audioContext.destination);
	source.connect(analyser);

	analyser.connect(processor);
	processor.connect(audioContext.destination);

	source.noteOn(0);

	source.loop = true;

	startViz();
}

function startViz(){
	freqByteData = new Uint8Array(analyser.frequencyBinCount);
	levels = [];
	isPlayingAudio = true;

	showTag();
}