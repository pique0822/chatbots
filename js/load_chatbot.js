const intensity_threshold = 0.6;

async function pageLoaded() {

  let promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve("done!"), 1500)
  });

  let result = await promise; // wait until the promise resolves (*)

  document.body.classList.remove('hide_overflow');

  document.getElementById('loading_screen').classList.remove('shown_content');
  document.getElementById('loading_screen').classList.add('hidden_content');

  document.getElementById('main_content').classList.add('shown_content');
  document.getElementById('main_content').classList.remove('hidden_content');
}


const pSBC=(p,c0,c1,l)=>{
    let r,g,b,P,f,t,h,i=parseInt,m=Math.round,a=typeof(c1)=="string";
    if(typeof(p)!="number"||p<-1||p>1||typeof(c0)!="string"||(c0[0]!='r'&&c0[0]!='#')||(c1&&!a))return null;
    if(!this.pSBCr)this.pSBCr=(d)=>{
        let n=d.length,x={};
        if(n>9){
            [r,g,b,a]=d=d.split(","),n=d.length;
            if(n<3||n>4)return null;
            x.r=i(r[3]=="a"?r.slice(5):r.slice(4)),x.g=i(g),x.b=i(b),x.a=a?parseFloat(a):-1
        }else{
            if(n==8||n==6||n<4)return null;
            if(n<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(n>4?d[4]+d[4]:"");
            d=i(d.slice(1),16);
            if(n==9||n==5)x.r=d>>24&255,x.g=d>>16&255,x.b=d>>8&255,x.a=m((d&255)/0.255)/1000;
            else x.r=d>>16,x.g=d>>8&255,x.b=d&255,x.a=-1
        }return x};
    h=c0.length>9,h=a?c1.length>9?true:c1=="c"?!h:false:h,f=this.pSBCr(c0),P=p<0,t=c1&&c1!="c"?this.pSBCr(c1):P?{r:0,g:0,b:0,a:-1}:{r:255,g:255,b:255,a:-1},p=P?p*-1:p,P=1-p;
    if(!f||!t)return null;
    if(l)r=m(P*f.r+p*t.r),g=m(P*f.g+p*t.g),b=m(P*f.b+p*t.b);
    else r=m((P*f.r**2+p*t.r**2)**0.5),g=m((P*f.g**2+p*t.g**2)**0.5),b=m((P*f.b**2+p*t.b**2)**0.5);
    a=f.a,t=t.a,f=a>=0||t>=0,a=f?a<0?t:t<0?a:a*P+t*p:0;
    if(h)return"rgb"+(f?"a(":"(")+r+","+g+","+b+(f?","+m(a*1000)/1000:"")+")";
    else return"#"+(4294967296+r*16777216+g*65536+b*256+(f?m(a*255):0)).toString(16).slice(1,f?undefined:-2)
}

function capitalize(s) {
	var first_char = /\S/;
  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}

function upgrade(){
	alert("Web Speech API is not supported by this browser. Upgrade to Chrome to version 25 or later.")
}

function addInvalidSymbols(text){
	var copyText = text.replace('___period___','.');
	copyText = copyText.replace('___pound___','#');
	copyText = copyText.replace('___dollar___','$');
	copyText = copyText.replace('___fslash___','/');
	copyText = copyText.replace('___lbracket___','[');
	copyText = copyText.replace('___rbracket___',']');

	return copyText;
}

function maximum_by_tol(val_list, tol){
	var index_out = [];
	const clone = [...val_list];
	clone.sort();

	var max = clone[clone.length -1];
	for(var i = clone.length-1; i>=0; i--)
	{
		if(max - clone[i] <= tol)
		{
			index_out.push(val_list.indexOf(clone[i]));
		}else{
			return index_out;
		}
	}
	return index_out;
}

function extract_var(name){
	var url = window.location.href
	var first_q = url.indexOf('html?')

	var all_vars = url.substring(first_q+1, url.length)

	var useful_var = all_vars.indexOf(name)
	var next_var = all_vars.indexOf('?',useful_var)
	if (next_var == -1){
		next_var = all_vars.length
	}

	var value = all_vars.substring(useful_var + name.length+1,next_var)

	return value
}

function toggleVisibility(qid){
	var elem = document.getElementById("A"+qid);
	if(elem.classList.contains("hidden_content"))
	{
		document.getElementById("A"+qid).classList.remove('hidden_content');
	} else {
		document.getElementById("A"+qid).classList.add('hidden_content');
	}
}

function similarity(a, b) {

	const magnitudeA = tf.norm(a);
	const magnitudeB = tf.norm(b);
	const out = tf.div(tf.matMul(a,b,false,true),tf.mul(magnitudeA, magnitudeB));
  return out.slice([0, 0], 1).asScalar();
}

function readMe(el){
	var msg = new SpeechSynthesisUtterance(el.innerText);
	if(document.documentElement.lang == 'en')
	{
		msg.lang = 'en-US';
		var voices = window.speechSynthesis.getVoices();
		msg.voice = voices.filter(function(voice) { return voice.lang == 'en-US'; })[0];
	}else if (document.documentElement.lang == 'es') {
		msg.lang = 'es-MX';
		var voices = window.speechSynthesis.getVoices();
		msg.voice = voices.filter(function(voice) { return voice.lang == 'es-MX'; })[0];
	}

	window.speechSynthesis.speak(msg);
}

function submitQuery(){
  toggle_questions(false);
  for(var q_id = 0; q_id < question_embeddings.shape[0];q_id++)
  {
    document.getElementById("A"+q_id).classList.add('hidden_content');
  }

	var query = document.getElementById('query').value;
  console.log(query);
	var triggered_element = -1;
	var certain = false;
	use.load().then(model => {
	  // Embed an array of sentences.
	  const sentences = query;
		var q_results = [];
	  model.embed(sentences).then(embeddings => {
			for(var q_id = 0; q_id < question_embeddings.shape[0]; q_id++)
			{
				const qsim = tf.tidy(() => {
					return similarity(question_embeddings.gather(tf.tensor1d([q_id], 'int32')), embeddings).dataSync()[0];
				});
				q_results.push(qsim);
			}
			var qindces = maximum_by_tol(q_results, tolerance);

			if(qindces.length > 1){

				var a_results = [];
				for(var q_id = 0; q_id < qindces.length; q_id++)
				{
					const asim = tf.tidy(() => {
						return similarity(answer_embeddings.gather(tf.tensor1d([qindces[q_id]], 'int32')), embeddings).dataSync()[0];
					});
					a_results.push(asim);
				}

				var aindces = maximum_by_tol(a_results, tolerance);
				if(aindces.length > 1){
					console.log("Sorry I don't understand that. The closest question is :");
					triggered_element = qindces[aindces[0]];
					certain = false;
				} else {
					triggered_element = qindces[aindces[0]];
					certain = true;
				}
			} else {
				triggered_element = qindces[0];
				certain = true;
			}

			console.log(triggered_element);
			if(triggered_element != -1)
			{
        document.getElementById("Q"+triggered_element).classList.remove('hidden_content');
				document.getElementById("Q"+triggered_element).click();
				if(certain)
				{
					document.getElementById("A"+triggered_element).click();
				}
			}
	  });
	});

}

function toggleRecord(){
	if(recording)
	{
		document.getElementById('speechButton').src = "imgs/microphone_icon.png";
		recognition.stop();
		recording = false;
	} else {
		document.getElementById('speechButton').src = "imgs/microphone-recording_icon.png";
		recognition.start();
		recording = true;
	}

}

const language_vars = {
	"en" : {
		"submit_button":"Submit",
    "input_placeholder":"Ask me anything!",
    "show_all":"Show All",
    "hide_all":"Hide All"
	},
	"es" : {
		"submit_button":"Enviar",
    "input_placeholder":"Preguntame cualquier cosa!",
    "show_all":"Mostrar Todo",
    "hide_all":"Esconder Todo"
	},
}



var recording = false;
var question_embeddings = null;
var answer_embeddings = null;
var load_questions = null;
var tolerance = 0.12;

if (!('webkitSpeechRecognition' in window)) {
	upgrade();
} else {
  document.getElementById('query').value = "";
  var final_transcript = "";

	var recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;

	recognition.onresult = function(event) {
    var interim_transcript = '';
    if (typeof(event.results) == 'undefined') {
      recognition.onend = null;
      recognition.stop();
      upgrade();
      return;
    }
    for (var i = event.resultIndex; i < 1; ++i) {
      if (event.results[i].isFinal) {
        final_transcript = event.results[i][0].transcript;
				document.getElementById('query').value = final_transcript;
				document.getElementById('submit_query').click();
      } else {
        interim_transcript += event.results[i][0].transcript;
				document.getElementById('query').value = interim_transcript;
      }
    }
  };
}

var SESSION_ID = extract_var('id').toUpperCase();
document.title = "Chatbot "+SESSION_ID;
var database = firebase.database();

var lang = "";
var QA = {};
var color = '#FFFFFF';
var lighter_color = color;
var darker_color = pSBC(-0.5,color);
firebase.database().ref('chatbot_ids/' + SESSION_ID).once('value').then(function(snapshot) {
	try{
		QA = snapshot.val().QA;
		lang = snapshot.val().lang;
		title = snapshot.val().title;
		color = snapshot.val().color;

    set_text_color(color);
		document.body.style.backgroundColor = color;
		darker_color = pSBC(-0.75,color);
		lighter_color = pSBC(0.75,color);

		document.getElementById("chatbot_title").innerHTML = addInvalidSymbols(title);

		document.documentElement.lang = lang;
		document.getElementById("submit_query").innerHTML = language_vars[lang]['submit_button'];

    document.getElementById('query').placeholder = language_vars[lang]['input_placeholder'];

		load_questions = Object.keys(QA);

		var q_list = document.getElementById("questions");

		const darker_style = "color: white; background-color: "+darker_color + '; border-color: '+darker_color+';';
		const lighter_style = "background-color: "+lighter_color + '; border-color: '+lighter_color+';';
		var all_questions = "";
		for(var q_id = 0; q_id < load_questions.length; q_id++)
		{
			var item = "<div id='Q"+q_id+"' class='question Block hidden_content' style='"+lighter_style+"' onclick=toggleVisibility("+q_id+")><div class='vcenter'>"+addInvalidSymbols(load_questions[q_id])+"</div></div><div id='A"+q_id+"' onclick=readMe(this) class='answer Block hidden_content'  style='"+darker_style+"'><div class='vcenter'>"+addInvalidSymbols(QA[load_questions[q_id]][0])+"</div></div>";
			all_questions += item;

			if(question_embeddings == null)
			{
				question_embeddings = tf.tensor([QA[load_questions[q_id]][1]]);
				answer_embeddings = tf.tensor([QA[load_questions[q_id]][2]]);
			} else {
				question_embeddings = tf.concat([question_embeddings, [QA[load_questions[q_id]][1]]], 0);
				answer_embeddings = tf.concat([answer_embeddings, [QA[load_questions[q_id]][2]]], 0);
			}
		}
		q_list.innerHTML = all_questions;

    pageLoaded();
	} catch(e)
	{
    console.log(e);
		alert('This is not a valid Chatbot!');
	}

});

var input = document.getElementById("query");
input.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {

    event.preventDefault();
    document.getElementById("submit_query").click();
		document.activeElement.blur();
  }
});

function toggle_questions(change_show_all)
{
  if(change_show_all)
  {
    show_all_questions = !show_all_questions;
  }
  if(!show_all_questions)
  {
    document.getElementById('show_all').innerHTML = language_vars[document.documentElement.lang]['show_all'];

    for(var q_id = 0; q_id < question_embeddings.shape[0];q_id++)
    {
      document.getElementById("Q"+q_id).classList.add('hidden_content');
      document.getElementById("A"+q_id).classList.add('hidden_content');
    }

  } else {
    document.getElementById('show_all').innerHTML = language_vars[document.documentElement.lang]['hide_all'];
    for(var q_id = 0; q_id < question_embeddings.shape[0];q_id++)
    {
      document.getElementById("Q"+q_id).classList.remove('hidden_content');
    }
  }
}

var show_all_questions = false;

function hex2num(hex){
  total = 0;
  for(var i = 0; i < hex.length; i++)
  {
    total *= 16;
    if(hex[i] == '0')
    {
      total += 0;
    } else if(hex[i] == '1')
    {
      total += 1;
    } else if(hex[i] == '2')
    {
      total += 2;
    } else if(hex[i] == '3')
    {
      total += 3;
    } else if(hex[i] == '4')
    {
      total += 4;
    } else if(hex[i] == '5')
    {
      total += 5;
    } else if(hex[i] == '6')
    {
      total += 6;
    } else if(hex[i] == '7')
    {
      total += 7;
    } else if(hex[i] == '8')
    {
      total += 8;
    } else if(hex[i] == '9')
    {
      total += 9;
    } else if(hex[i] == 'a')
    {
      total += 10;
    } else if(hex[i] == 'b')
    {
      total += 11;
    } else if(hex[i] == 'c')
    {
      total += 12;
    } else if(hex[i] == 'd')
    {
      total += 13;
    } else if(hex[i] == 'e')
    {
      total += 14;
    } else if(hex[i] == 'f')
    {
      total += 15;
    }
  }
  return total;
}

function set_text_color(color){

  var hex_r = color.substring(1,3);
  var hex_g = color.substring(3,5);
  var hex_b = color.substring(5,7);

  var r = hex2num(hex_r);
  var g = hex2num(hex_g);
  var b = hex2num(hex_b);

  var intensity = (0.3*r + 0.59*g + 0.11*b)/255;

  if(intensity > intensity_threshold)
  {
    document.getElementById("chatbot_title").style.color='black';
  } else {
    document.getElementById("chatbot_title").style.color='white';
  }

  console.log(intensity);
}
