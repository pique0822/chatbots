var questions_so_far = {};
var question_sequence = [];
var q_vec_dict = {};
var a_vec_dict = {};

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

// p is percent (+ is lighter, - is darker, c0 is the color)
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

// invalid symbols
// ".", "#", "$", "/", "[", or "]"
function removeInvalidSymbols(text){
	var copyText = text.replace('.','___period___');
	copyText = copyText.replace('#','___pound___');
	copyText = copyText.replace('$','___dollar___');
	copyText = copyText.replace('/','___fslash___');
	copyText = copyText.replace('[','___lbracket___');
	copyText = copyText.replace(']','___rbracket___');

	return copyText;
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

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function populate_table(ls, tbl){
	table = document.getElementById("set_QA");
	document.getElementById("submit_all").classList.add('invisible');
	document.getElementById("clear_all").classList.add('invisible');

	stylization = 'font-weight: none; text-align: left;'

	inner = ""
	if(ls.length > 0){
		inner = "<div class='row'><div class='question_col'><span class='table_span'><b>"+language_vars[current_language]["question_title"]+"</b></span></div><div class='answer_col'><span class='table_span'><b>"+language_vars[current_language]["answer_title"]+"</b></span></div><div class='remove_col clearfix'> </div></div>";
		document.getElementById("submit_all").classList.remove('invisible');
		document.getElementById("clear_all").classList.remove('invisible');
	}

	for(var q_id = 0; q_id < ls.length; q_id++)
	{
		inner += "<div id='q"+q_id+"' class='row'><div class='question_col'><span class='table_span'>"+ls[q_id]+"</span></div><div class='answer_col'><span class='table_span'>"+questions_so_far[ls[q_id]]+"</span></div><div class='remove_col'><button id='remove' onclick='remove_qa("+q_id+")'>-</button></div><div id='clear' style='clear:both;''></div></div>";


	}
	table.innerHTML = inner;

	var demoClasses = document.querySelectorAll('.row');
	demoClasses.forEach(element => {
	  element.style.borderColor = pSBC(-0.0, random_color);
	});
	demoClasses = document.querySelectorAll('.question_col');
	demoClasses.forEach(element => {
	  element.style.borderColor = pSBC(-0.0, random_color);
	});
	demoClasses = document.querySelectorAll('.answer_col');
	demoClasses.forEach(element => {
	  element.style.borderColor = pSBC(-0.0, random_color);
	});
}

function remove_qa(id){

	var removed = question_sequence.splice(id, 1);
	if(!question_sequence.includes(removed[0]))
	{
		delete questions_so_far[removed[0]];
	}

	populate_table(question_sequence, questions_so_far);
}

function getEmbeddings(this_q, this_a){
	return new Promise(function(resolve, reject) {
		// Universal Sentence Encoder
		use.load().then(model => {
			// Embed an array of sentences.
			const sentences = [this_q, this_a];
			console.log(this_q)
			model.embed(sentences).then(embeddings => {
				// `embeddings` is a 2D tensor consisting of the 512-dimensional embeddings for each sentence.
				// So in this example `embeddings` has the shape [2, 512].
				resolve(embeddings);
			});
		});
	});
}

async function submitQA(){
  var modal = document.getElementById("myModal");
  modal.style.display = "block";

  document.getElementById('popup_loader').style.borderTopColor = pSBC(-0.5, random_color);

	var lang = document.getElementById("language").value;
	console.log("Parsing questions and answers...")
	var information_by_question = {};

	for(var q_id = 0; q_id < question_sequence.length; q_id++)
	{
		var this_q = question_sequence[q_id];
		var this_a = questions_so_far[this_q];

		const this_out = await getEmbeddings(this_q, this_a);
		const thisq_vec=this_out.gather(tf.tensor1d([0], 'int32')).dataSync();
		const thisa_vec=this_out.gather(tf.tensor1d([1], 'int32')).dataSync();

		information_by_question[removeInvalidSymbols(this_q)] = [removeInvalidSymbols(this_a), thisq_vec, thisa_vec];
	}
	console.log('Submitting to '+random_id);

  document.getElementById('popup_load_screen').classList.remove('shown_content');
  document.getElementById('popup_load_screen').classList.add('hidden_content');

  document.getElementById('popup_main_content').classList.add('shown_content');
  document.getElementById('popup_main_content').classList.remove('hidden_content');


	var chatbot_title =document.getElementById('chatbot_title').value; chatbot_title = removeInvalidSymbols(chatbot_title);
	if(chatbot_title.length == 0)
	{
		chatbot_title = "Chatbot "+random_id;
	}
	var database = firebase.database();
	firebase.database().ref('chatbot_ids/' + random_id).set({'QA':information_by_question,"lang":lang,"time":new Date().getTime(), "title":chatbot_title, "color":random_color});

  document.getElementById('popup_id').innerHTML = random_id;
  document.getElementById('popup_text').innerHTML = language_vars[current_language]['popup_text'];

  document.getElementById('chatbot_title').value = addInvalidSymbols(chatbot_title);
  document.getElementById('language').value = current_language;

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
}

function languageChange(){
	current_language = document.getElementById("language").value;
	populate_table(question_sequence, questions_so_far);

	document.getElementById('new_question').placeholder = language_vars[current_language]['placeholder_question'];
	document.getElementById('new_answer').placeholder = language_vars[current_language]['placeholder_answer'];
	document.getElementById('submit_all').innerHTML = language_vars[current_language]['submit_button'];
	document.getElementById('language_label').innerHTML = language_vars[current_language]['language_label'];
  document.getElementById('chatbot_id').innerHTML = language_vars[current_language]['chatbot_title'];
  document.getElementById('popup_loading_text').innerHTML = language_vars[current_language]['upload_text'];
}

function clearAll(){
	questions_so_far = {};
	question_sequence = [];

	populate_table(question_sequence, questions_so_far);
}

function submitNewQA(){
	newQ = document.getElementById("new_question");
	newA = document.getElementById("new_answer");

	if(newA.value.length > 0 && newQ.value.length > 0){
		question = newQ.value.trim();
		answer = newA.value.trim();

		newQ.value = "";
		newA.value = "";

		questions_so_far[question] = answer;
		question_sequence.unshift(question);

		populate_table(question_sequence, questions_so_far);
	}
}

const language_vars = {
	"en" : {
		"question_title":"Question",
		"answer_title":"Answer",
		"placeholder_question":"Question",
		"placeholder_answer":"Answer",
		"submit_button":"Done",
    "chatbot_title":"Chatbot Name",
		"language_label":"Language",
    "popup_text":"Use the following code to access the chatbot!",
    "upload_text":"Uploading Chatbot"
	},
	"es" : {
		"question_title":"Pregunta",
		"answer_title":"Respuesta",
		"placeholder_question":"Pregunta",
		"placeholder_answer":"Respuesta",
		"submit_button":"Completo",
    "chatbot_title":"Nombre de Chatbot",
		"language_label":"Lenguaje",
    "popup_text":"Use el siguiente codigo para accesar el chatbot!",
    "upload_text":"Subiendo Chatbot"
	},
}

const color_choices = ['#16a085','#27ae60','#2980b9','#8e44ad','#2c3e50','#f39c12','#f1c40f','#d35400','#c0392b','#7f8c8d'];

var current_language = "en";
var random_color = random_color;
var pattern = new RegExp("[^a-zA-Z0-9]");
if(window.location.href.indexOf('?id=') >= 0 && (window.location.href.length - window.location.href.indexOf('?id=')) == 10 && !pattern.test(extract_var('id')))
{
	random_id = extract_var('id').toUpperCase();

	firebase.database().ref('chatbot_ids/' + random_id).once('value').then(function(snapshot) {
		try {
			time = snapshot.val().time;
		} catch (e) {
			time = -1
		}

		if(time > 0 && !(new Date().getTime() - time >= 24*60*60*1000))
		{
			QA = snapshot.val().QA;
			lang = snapshot.val().lang;
			title = snapshot.val().title;
			random_color = snapshot.val().color;

      document.getElementById('chatbot_id').value = language_vars[lang]['chatbot_title'];


			document.getElementById('chatbot_title').value = addInvalidSymbols(title);

			document.getElementById("language").value = lang;
			question_sequence = Object.keys(QA);
			for(var q_id = 0; q_id < question_sequence.length; q_id++)
			{
				questions_so_far[addInvalidSymbols(question_sequence[q_id])] = addInvalidSymbols(QA[question_sequence[q_id]][0]);
				question_sequence[q_id] = addInvalidSymbols(question_sequence[q_id]);
			}
      document.getElementById("favcolor").value = random_color;
			set_text_color(random_color);
			languageChange();
		}else{
			random_color = color_choices[Math.floor(Math.random() * color_choices.length)];

      document.getElementById('chatbot_id').value = language_vars[current_language]['chatbot_title'];

      set_text_color(random_color);
		}
	});


  pageLoaded();

}else{
	random_length = 6;

	random_id = "";
	for(var i = 0; i < random_length; i++)
	{
		var randChoice = getRandomInt(36);
		if(randChoice < 10){
			random_id += randChoice;
		} else {
			random_id += String.fromCharCode(randChoice - 10 + 65);
		}
	}

	random_color = color_choices[Math.floor(Math.random() * color_choices.length)];


	if (history.pushState) {
	    window.history.pushState("object or string", "Page Title", "?id="+random_id);
	} else {
	    document.location.href = "?id="+random_id;
	}

  document.getElementById("favcolor").value = random_color;
  set_text_color(random_color);
  pageLoaded();
}


document.getElementById("chatbot_id").innerHTML = language_vars[current_language]['chatbot_title'];


var input = document.getElementById("new_question");
input.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {

    event.preventDefault();
    document.getElementById("submit_new").click();
		document.activeElement.blur();
  }
});

var input = document.getElementById("new_answer");
input.addEventListener("keyup", function(event) {
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {

    event.preventDefault();
    document.getElementById("submit_new").click();
		document.activeElement.blur();
  }
});

function change_random_color(){
  random_color = document.getElementById('favcolor').value;
  set_text_color(random_color);
}

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

  document.body.style.backgroundColor = color;
  document.getElementById('hor_bar').style.backgroundColor = pSBC(-0.5, color);
  document.getElementById('hor_bar').style.borderColor = pSBC(-0.5, color);
	document.getElementById('chatbot_title').style.borderBottomColor = pSBC(-0.5, color);
  document.getElementById('new_question').style.boxShadowColor = pSBC(-0.5, color);

  populate_table(question_sequence, questions_so_far);

  var hex_r = color.substring(1,3);
  var hex_g = color.substring(3,5);
  var hex_b = color.substring(5,7);

  var r = hex2num(hex_r);
  var g = hex2num(hex_g);
  var b = hex2num(hex_b);

  var intensity = (0.3*r + 0.59*g + 0.11*b)/255;

  if(intensity > intensity_threshold)
  {
    document.getElementById("chatbot_id").style.color='black';
    document.getElementById("chatbot_title").style.color='black';
    document.getElementById("language_label").style.color='black';

  } else {
    document.getElementById("chatbot_id").style.color='white';
    document.getElementById("chatbot_title").style.color='white';
    document.getElementById("language_label").style.color='white';

  }

  console.log(intensity);
}
