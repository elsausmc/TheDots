var input = document.getElementById("input");
var inputText = input.value;

var output = document.getElementById("output");
var outputText = "";

function Generate(){
	var words = inputText.replace("\r\n", " ").split(' '); 
	
	for (var index = 0; index < words.length-1; index++) {
		outputText += words[index] + " " + words[index + 1] + "\r\n";
	}
	
	output.innerText = outputText;
}