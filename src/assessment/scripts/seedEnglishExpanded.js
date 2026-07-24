const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://dabirax:wxGZGHjXKi36XTmo@learnexo01.z4pleac.mongodb.net/";

const CLASSES = ["jss1", "jss2", "jss3", "ss1", "ss2", "ss3"];
const CATEGORIES = ["grammar", "comprehension", "vocabulary", "oral", "writing"];

const TOPIC_NAMES = {
  grammar: ["concord", "tenses", "articles", "prepositions", "sentence_structure"],
  comprehension: ["comprehension", "inference", "vocabulary_in_context", "summary", "reading_skills"],
  vocabulary: ["synonyms", "antonyms", "idioms", "word_formation", "spelling"],
  oral: ["vowel_sounds", "consonant_sounds", "stress", "intonation", "reading_skills"],
  writing: ["essay_writing", "letter_writing", "narrative_writing", "descriptive_writing", "summary"],
};

const NAMES = ["Chinedu","Ngozi","Adebayo","Fatima","Obinna","Amara","Emeka","Zainab","Olumide","Chioma","Ibrahim","Aisha","Tunde","Nkechi","Yusuf","Halima","Segun","Ifeoma","Bola","Kunle","Sade","Femi","Adaobi","Mohammed","Funke","Chukwuemeka","Hauwa","Tosin","Ebuka","Lola","Jide","Kemi"];
const PLACES = ["Lagos","Abuja","Ibadan","Kano","Port Harcourt","Benin City","Kaduna","Enugu","Owerri","Abeokuta","Sokoto","Calabar","Jos","Ilorin"];
const SCHOOLS = ["Government College","Unity School","Federal Government College","Model Secondary School","Science Secondary School","Community High School"];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function swap(str, dict) {
  let s = str;
  for (const [k, v] of Object.entries(dict)) s = s.split(k).join(v);
  return s;
}

function makeQuestion(template, vars = {}) {
  const t = typeof template === "function" ? template() : template;
  return {
    question: swap(t.q, vars),
    options: t.o.map((x) => ({ key: x.k, text: swap(x.t, vars) })),
    answer: t.a,
  };
}

// Question banks: 5 per difficulty per topic
const BANKS = {
  concord: {
    easy: [
      {q:"{{NAME}} ___ to school every day.",o:[{k:"a",t:"go"},{k:"b",t:"goes"},{k:"c",t:"going"},{k:"d",t:"gone"},{k:"e",t:"went"}],a:"b"},
      {q:"The boys ___ playing football in the field.",o:[{k:"a",t:"is"},{k:"b",t:"are"},{k:"c",t:"was"},{k:"d",t:"were"},{k:"e",t:"be"}],a:"b"},
      {q:"My mother ___ delicious meals on Sundays.",o:[{k:"a",t:"cook"},{k:"b",t:"cooks"},{k:"c",t:"cooking"},{k:"d",t:"cooked"},{k:"e",t:"have cooked"}],a:"b"},
      {q:"The dogs ___ barking loudly at the stranger.",o:[{k:"a",t:"is"},{k:"b",t:"are"},{k:"c",t:"was"},{k:"d",t:"were"},{k:"e",t:"be"}],a:"b"},
      {q:"Neither the teacher nor the students ___ happy with the result.",o:[{k:"a",t:"was"},{k:"b",t:"were"},{k:"c",t:"is"},{k:"d",t:"are"},{k:"e",t:"be"}],a:"b"},
    ],
    medium: [
      {q:"Each of the contestants ___ given a number.",o:[{k:"a",t:"were"},{k:"b",t:"are"},{k:"c",t:"was"},{k:"d",t:"have been"},{k:"e",t:"has been"}],a:"c"},
      {q:"The majority of the citizens of {{PLACE}} ___ in favour of the new law.",o:[{k:"a",t:"is"},{k:"b",t:"are"},{k:"c",t:"was"},{k:"d",t:"were"},{k:"e",t:"has"}],a:"b"},
      {q:"A pack of cards ___ on the table.",o:[{k:"a",t:"are"},{k:"b",t:"were"},{k:"c",t:"is"},{k:"d",t:"have been"},{k:"e",t:"have"}],a:"c"},
      {q:"The pair of shoes I bought ___ expensive.",o:[{k:"a",t:"are"},{k:"b",t:"were"},{k:"c",t:"is"},{k:"d",t:"have been"},{k:"e",t:"be"}],a:"c"},
      {q:"Not only the head boy but also the prefects ___ responsible for the noise.",o:[{k:"a",t:"is"},{k:"b",t:"was"},{k:"c",t:"are"},{k:"d",t:"were"},{k:"e",t:"has"}],a:"c"},
    ],
    hard: [
      {q:"None of the students ___ able to solve the equation.",o:[{k:"a",t:"was"},{k:"b",t:"were"},{k:"c",t:"is"},{k:"d",t:"are"},{k:"e",t:"has"}],a:"a"},
      {q:"The police ___ investigating the robbery case.",o:[{k:"a",t:"is"},{k:"b",t:"are"},{k:"c",t:"was"},{k:"d",t:"were"},{k:"e",t:"has"}],a:"b"},
      {q:"One of the boys who ___ here is my cousin.",o:[{k:"a",t:"work"},{k:"b",t:"works"},{k:"c",t:"is working"},{k:"d",t:"are working"},{k:"e",t:"worked"}],a:"a"},
      {q:"The news ___ shocking to everyone in {{PLACE}}.",o:[{k:"a",t:"are"},{k:"b",t:"were"},{k:"c",t:"is"},{k:"d",t:"have been"},{k:"e",t:"be"}],a:"c"},
      {q:"Between you and ___, this secret must not be told.",o:[{k:"a",t:"I"},{k:"b",t:"me"},{k:"c",t:"myself"},{k:"d",t:"we"},{k:"e",t:"us"}],a:"b"},
    ],
  },
  tenses: {
    easy: [
      {q:"She ___ her homework yesterday.",o:[{k:"a",t:"do"},{k:"b",t:"does"},{k:"c",t:"did"},{k:"d",t:"done"},{k:"e",t:"doing"}],a:"c"},
      {q:"I am ___ to the market now.",o:[{k:"a",t:"go"},{k:"b",t:"goes"},{k:"c",t:"going"},{k:"d",t:"gone"},{k:"e",t:"went"}],a:"c"},
      {q:"{{NAME}} ___ in {{PLACE}} since 2010.",o:[{k:"a",t:"live"},{k:"b",t:"lives"},{k:"c",t:"lived"},{k:"d",t:"has lived"},{k:"e",t:"is living"}],a:"d"},
      {q:"By this time tomorrow, we ___ the examination.",o:[{k:"a",t:"finish"},{k:"b",t:"will finish"},{k:"c",t:"will have finished"},{k:"d",t:"are finishing"},{k:"e",t:"finished"}],a:"c"},
      {q:"They ___ football when it started to rain.",o:[{k:"a",t:"play"},{k:"b",t:"played"},{k:"c",t:"were playing"},{k:"d",t:"have played"},{k:"e",t:"are playing"}],a:"c"},
    ],
    medium: [
      {q:"Before the teacher arrived, the students ___ the room.",o:[{k:"a",t:"clean"},{k:"b",t:"cleaned"},{k:"c",t:"have cleaned"},{k:"d",t:"had cleaned"},{k:"e",t:"are cleaning"}],a:"d"},
      {q:"I ___ for two hours before she came.",o:[{k:"a",t:"wait"},{k:"b",t:"waited"},{k:"c",t:"have waited"},{k:"d",t:"had been waiting"},{k:"e",t:"am waiting"}],a:"d"},
      {q:"{{NAME}} said she ___ visit her grandmother the following week.",o:[{k:"a",t:"will"},{k:"b",t:"would"},{k:"c",t:"shall"},{k:"d",t:"can"},{k:"e",t:"may"}],a:"b"},
      {q:"The bus ___ before I got to the park.",o:[{k:"a",t:"leave"},{k:"b",t:"left"},{k:"c",t:"has left"},{k:"d",t:"had left"},{k:"e",t:"was leaving"}],a:"d"},
      {q:"If I ___ hard, I would have passed the exam.",o:[{k:"a",t:"study"},{k:"b",t:"studied"},{k:"c",t:"had studied"},{k:"d",t:"have studied"},{k:"e",t:"studies"}],a:"c"},
    ],
    hard: [
      {q:"By the end of this year, I ___ in this school for five years.",o:[{k:"a",t:"will teach"},{k:"b",t:"will have taught"},{k:"c",t:"would teach"},{k:"d",t:"have taught"},{k:"e",t:"am teaching"}],a:"b"},
      {q:"He ___ the book before I asked for it.",o:[{k:"a",t:"read"},{k:"b",t:"has read"},{k:"c",t:"had read"},{k:"d",t:"was reading"},{k:"e",t:"reads"}],a:"c"},
      {q:"If it ___ tomorrow, the match will be cancelled.",o:[{k:"a",t:"rain"},{k:"b",t:"rains"},{k:"c",t:"rained"},{k:"d",t:"had rained"},{k:"e",t:"will rain"}],a:"b"},
      {q:"She wishes she ___ a car.",o:[{k:"a",t:"has"},{k:"b",t:"had"},{k:"c",t:"have"},{k:"d",t:"is having"},{k:"e",t:"will have"}],a:"b"},
      {q:"Hardly had the game begun ___ it started to rain.",o:[{k:"a",t:"than"},{k:"b",t:"when"},{k:"c",t:"before"},{k:"d",t:"after"},{k:"e",t:"as"}],a:"b"},
    ],
  },
  articles: {
    easy: [
      {q:"I saw ___ elephant at the zoo.",o:[{k:"a",t:"a"},{k:"b",t:"an"},{k:"c",t:"the"},{k:"d",t:"some"},{k:"e",t:"any"}],a:"b"},
      {q:"She is ___ best student in the class.",o:[{k:"a",t:"a"},{k:"b",t:"an"},{k:"c",t:"the"},{k:"d",t:"some"},{k:"e",t:"any"}],a:"c"},
      {q:"___ sun rises in the east.",o:[{k:"a",t:"A"},{k:"b",t:"An"},{k:"c",t:"The"},{k:"d",t:"Some"},{k:"e",t:"Any"}],a:"c"},
      {q:"He bought ___ honest man a drink.",o:[{k:"a",t:"a"},{k:"b",t:"an"},{k:"c",t:"the"},{k:"d",t:"some"},{k:"e",t:"any"}],a:"b"},
      {q:"My brother is ___ university student.",o:[{k:"a",t:"a"},{k:"b",t:"an"},{k:"c",t:"the"},{k:"d",t:"some"},{k:"e",t:"any"}],a:"a"},
    ],
    medium: [
      {q:"___ rich should help ___ poor.",o:[{k:"a",t:"A, a"},{k:"b",t:"The, the"},{k:"c",t:"An, an"},{k:"d",t:"Some, some"},{k:"e",t:"Any, any"}],a:"b"},
      {q:"What ___ beautiful dress she is wearing!",o:[{k:"a",t:"a"},{k:"b",t:"an"},{k:"c",t:"the"},{k:"d",t:"some"},{k:"e",t:"—"}],a:"a"},
      {q:"___ Sahara Desert is the largest hot desert in the world.",o:[{k:"a",t:"A"},{k:"b",t:"An"},{k:"c",t:"The"},{k:"d",t:"Some"},{k:"e",t:"Any"}],a:"c"},
      {q:"It takes ___ hour to get to {{PLACE}} from here.",o:[{k:"a",t:"a"},{k:"b",t:"an"},{k:"c",t:"the"},{k:"d",t:"some"},{k:"e",t:"any"}],a:"b"},
      {q:"He plays ___ guitar very well.",o:[{k:"a",t:"a"},{k:"b",t:"an"},{k:"c",t:"the"},{k:"d",t:"some"},{k:"e",t:"—"}],a:"c"},
    ],
    hard: [
      {q:"___ more you study, ___ more you know.",o:[{k:"a",t:"A, a"},{k:"b",t:"The, the"},{k:"c",t:"An, an"},{k:"d",t:"Some, some"},{k:"e",t:"Any, any"}],a:"b"},
      {q:"She is ___ European but speaks ___ Yoruba fluently.",o:[{k:"a",t:"a, the"},{k:"b",t:"an, the"},{k:"c",t:"a, —"},{k:"d",t:"an, —"},{k:"e",t:"the, —"}],a:"c"},
      {q:"___ accused was found guilty by the jury.",o:[{k:"a",t:"A"},{k:"b",t:"An"},{k:"c",t:"The"},{k:"d",t:"Some"},{k:"e",t:"Any"}],a:"c"},
      {q:"___ knowledge is power.",o:[{k:"a",t:"A"},{k:"b",t:"An"},{k:"c",t:"The"},{k:"d",t:"Some"},{k:"e",t:"—"}],a:"e"},
      {q:"I have never seen ___ such beautiful sunset.",o:[{k:"a",t:"a"},{k:"b",t:"an"},{k:"c",t:"the"},{k:"d",t:"some"},{k:"e",t:"—"}],a:"a"},
    ],
  },
  prepositions: {
    easy: [
      {q:"The book is ___ the table.",o:[{k:"a",t:"in"},{k:"b",t:"on"},{k:"c",t:"at"},{k:"d",t:"by"},{k:"e",t:"under"}],a:"b"},
      {q:"She lives ___ {{PLACE}}.",o:[{k:"a",t:"in"},{k:"b",t:"on"},{k:"c",t:"at"},{k:"d",t:"to"},{k:"e",t:"by"}],a:"a"},
      {q:"The meeting starts ___ 9 o'clock.",o:[{k:"a",t:"in"},{k:"b",t:"on"},{k:"c",t:"at"},{k:"d",t:"by"},{k:"e",t:"for"}],a:"c"},
      {q:"I was born ___ July.",o:[{k:"a",t:"in"},{k:"b",t:"on"},{k:"c",t:"at"},{k:"d",t:"by"},{k:"e",t:"for"}],a:"a"},
      {q:"The cat jumped ___ the fence.",o:[{k:"a",t:"in"},{k:"b",t:"on"},{k:"c",t:"over"},{k:"d",t:"at"},{k:"e",t:"by"}],a:"c"},
    ],
    medium: [
      {q:"She is married ___ a doctor.",o:[{k:"a",t:"with"},{k:"b",t:"to"},{k:"c",t:"for"},{k:"d",t:"by"},{k:"e",t:"at"}],a:"b"},
      {q:"I am not interested ___ playing football.",o:[{k:"a",t:"on"},{k:"b",t:"at"},{k:"c",t:"in"},{k:"d",t:"for"},{k:"e",t:"with"}],a:"c"},
      {q:"The teacher is angry ___ the students.",o:[{k:"a",t:"with"},{k:"b",t:"at"},{k:"c",t:"on"},{k:"d",t:"for"},{k:"e",t:"to"}],a:"a"},
      {q:"He was accused ___ stealing the money.",o:[{k:"a",t:"for"},{k:"b",t:"of"},{k:"c",t:"with"},{k:"d",t:"by"},{k:"e",t:"on"}],a:"b"},
      {q:"The house is made ___ mud bricks.",o:[{k:"a",t:"of"},{k:"b",t:"from"},{k:"c",t:"with"},{k:"d",t:"by"},{k:"e",t:"in"}],a:"a"},
    ],
    hard: [
      {q:"She prides herself ___ her ability to speak many languages.",o:[{k:"a",t:"in"},{k:"b",t:"on"},{k:"c",t:"at"},{k:"d",t:"with"},{k:"e",t:"for"}],a:"b"},
      {q:"The students were prevented ___ entering the hall.",o:[{k:"a",t:"for"},{k:"b",t:"from"},{k:"c",t:"by"},{k:"d",t:"at"},{k:"e",t:"in"}],a:"b"},
      {q:"He has no taste ___ music.",o:[{k:"a",t:"of"},{k:"b",t:"for"},{k:"c",t:"in"},{k:"d",t:"at"},{k:"e",t:"with"}],a:"b"},
      {q:"The noise prevented me ___ concentrating.",o:[{k:"a",t:"for"},{k:"b",t:"from"},{k:"c",t:"in"},{k:"d",t:"at"},{k:"e",t:"on"}],a:"b"},
      {q:"I prefer tea ___ coffee.",o:[{k:"a",t:"for"},{k:"b",t:"than"},{k:"c",t:"to"},{k:"d",t:"over"},{k:"e",t:"against"}],a:"c"},
    ],
  },
  sentence_structure: {
    easy: [
      {q:"Identify the subject in the sentence: \"The dog barked loudly.\"",o:[{k:"a",t:"barked"},{k:"b",t:"loudly"},{k:"c",t:"The dog"},{k:"d",t:"dog"},{k:"e",t:"The"}],a:"c"},
      {q:"Which of the following is a simple sentence?",o:[{k:"a",t:"Because it rained, we stayed indoors."},{k:"b",t:"I like rice and beans."},{k:"c",t:"When the bell rings, the students run out."},{k:"d",t:"Although she was tired, she finished her work."},{k:"e",t:"The boy who won the prize is my friend."}],a:"b"},
      {q:"Identify the verb in: \"She sings beautifully.\"",o:[{k:"a",t:"She"},{k:"b",t:"sings"},{k:"c",t:"beautifully"},{k:"d",t:"beautiful"},{k:"e",t:"song"}],a:"b"},
      {q:"Which sentence is in the passive voice?",o:[{k:"a",t:"The teacher praised the boy."},{k:"b",t:"The boy was praised by the teacher."},{k:"c",t:"She wrote the letter."},{k:"d",t:"They built the house."},{k:"e",t:"We eat rice every day."}],a:"b"},
      {q:"What type of sentence is this: \"Close the door!\"",o:[{k:"a",t:"Declarative"},{k:"b",t:"Interrogative"},{k:"c",t:"Imperative"},{k:"d",t:"Exclamatory"},{k:"e",t:"Conditional"}],a:"c"},
    ],
    medium: [
      {q:"Identify the object in: \"{{NAME}} gave her a book.\"",o:[{k:"a",t:"{{NAME}}"},{k:"b",t:"gave"},{k:"c",t:"her"},{k:"d",t:"a book"},{k:"e",t:"book"}],a:"d"},
      {q:"Which sentence contains a subordinate clause?",o:[{k:"a",t:"I went home."},{k:"b",t:"She is tall and beautiful."},{k:"c",t:"Before the rain started, we left the park."},{k:"d",t:"The sun is shining."},{k:"e",t:"They ate and slept."}],a:"c"},
      {q:"Change to active voice: \"The cake was eaten by the children.\"",o:[{k:"a",t:"The cake is eating the children."},{k:"b",t:"The children ate the cake."},{k:"c",t:"The children were eaten by the cake."},{k:"d",t:"The children are eating the cake."},{k:"e",t:"The cake has been eaten."}],a:"b"},
      {q:"Identify the complement in: \"She became a doctor.\"",o:[{k:"a",t:"She"},{k:"b",t:"became"},{k:"c",t:"a doctor"},{k:"d",t:"doctor"},{k:"e",t:"became a"}],a:"c"},
      {q:"Which is a complex sentence?",o:[{k:"a",t:"I ran."},{k:"b",t:"I ran and she walked."},{k:"c",t:"Although it was raining, I ran."},{k:"d",t:"I ran; she walked."},{k:"e",t:"Running is good exercise."}],a:"c"},
    ],
    hard: [
      {q:"Identify the adverbial clause in: \"He passed because he studied hard.\"",o:[{k:"a",t:"He passed"},{k:"b",t:"because he studied hard"},{k:"c",t:"he studied hard"},{k:"d",t:"studied hard"},{k:"e",t:"He passed because"}],a:"b"},
      {q:"Which sentence contains a noun phrase?",o:[{k:"a",t:"He runs fast."},{k:"b",t:"The tall boy in the blue shirt"},{k:"c",t:"She is happy."},{k:"d",t:"They left early."},{k:"e",t:"It rained heavily."}],a:"b"},
      {q:"Transform into indirect speech: \"I am tired,\" she said.",o:[{k:"a",t:"She said she is tired."},{k:"b",t:"She said she was tired."},{k:"c",t:"She said I am tired."},{k:"d",t:"She said I was tired."},{k:"e",t:"She says she is tired."}],a:"b"},
      {q:"Identify the relative clause: \"The man who drove the car is my uncle.\"",o:[{k:"a",t:"The man"},{k:"b",t:"who drove the car"},{k:"c",t:"is my uncle"},{k:"d",t:"drove the car"},{k:"e",t:"the car"}],a:"b"},
      {q:"Which sentence is in the future perfect continuous tense?",o:[{k:"a",t:"I will eat."},{k:"b",t:"I will have eaten."},{k:"c",t:"I will have been eating."},{k:"d",t:"I am eating."},{k:"e",t:"I have been eating."}],a:"c"},
    ],
  },

  // COMPREHENSION
  comprehension: {
    easy: [
      {q:"Read the passage: \"{{NAME}} woke up early and prepared for school. She ate breakfast and walked to the bus stop.\" What did she do first?",o:[{k:"a",t:"Walked to the bus stop"},{k:"b",t:"Ate breakfast"},{k:"c",t:"Prepared for school"},{k:"d",t:"Woke up early"},{k:"e",t:"Boarded the bus"}],a:"d"},
      {q:"In a story about a boy who lost his way home, the main problem is ___.",o:[{k:"a",t:"He found a treasure"},{k:"b",t:"He made new friends"},{k:"c",t:"He lost his way home"},{k:"d",t:"He went to the market"},{k:"e",t:"He visited his grandmother"}],a:"c"},
      {q:"The passage says the river is \"wide and calm.\" What does \"calm\" mean?",o:[{k:"a",t:"Angry"},{k:"b",t:"Noisy"},{k:"c",t:"Peaceful"},{k:"d",t:"Deep"},{k:"e",t:"Fast"}],a:"c"},
      {q:"According to the passage, where did the event take place?",o:[{k:"a",t:"In a hospital"},{k:"b",t:"At the school assembly"},{k:"c",t:"In a cinema"},{k:"d",t:"At the airport"},{k:"e",t:"In a restaurant"}],a:"b"},
      {q:"The writer describes the weather as \"scorching.\" This means it was ___.",o:[{k:"a",t:"cold"},{k:"b",t:"windy"},{k:"c",t:"very hot"},{k:"d",t:"rainy"},{k:"e",t:"cloudy"}],a:"c"},
    ],
    medium: [
      {q:"The passage implies that the main character is ___.",o:[{k:"a",t:"Selfish"},{k:"b",t:"Determined"},{k:"c",t:"Lazy"},{k:"d",t:"Careless"},{k:"e",t:"Rude"}],a:"b"},
      {q:"Why did the villagers celebrate at the end of the story?",o:[{k:"a",t:"They won a lottery"},{k:"b",t:"The rains finally came after a long drought"},{k:"c",t:"A new school was built"},{k:"d",t:"They travelled to the city"},{k:"e",t:"They found gold"}],a:"b"},
      {q:"The phrase \"a blessing in disguise\" in the passage means ___.",o:[{k:"a",t:"A hidden treasure"},{k:"b",t:"Something bad that turns out to be good"},{k:"c",t:"A secret plan"},{k:"d",t:"A religious ceremony"},{k:"e",t:"A surprise gift"}],a:"b"},
      {q:"The author's purpose in writing this passage is most likely to ___.",o:[{k:"a",t:"Entertain"},{k:"b",t:"Persuade"},{k:"c",t:"Inform about the importance of education"},{k:"d",t:"Describe a place"},{k:"e",t:"Criticise the government"}],a:"c"},
      {q:"From the passage, we can conclude that the boy's mother was ___.",o:[{k:"a",t:"Wealthy"},{k:"b",t:"Strict but caring"},{k:"c",t:"Uneducated"},{k:"d",t:"Absent"},{k:"e",t:"Famous"}],a:"b"},
    ],
    hard: [
      {q:"The passage uses irony when the character says he is \"happy\" to lose his job. What does this suggest?",o:[{k:"a",t:"He truly enjoyed losing his job"},{k:"b",t:"He is being sarcastic because he is actually upset"},{k:"c",t:"He found a better job immediately"},{k:"d",t:"He hates working"},{k:"e",t:"He won a lottery"}],a:"b"},
      {q:"The narrator's tone in describing the city of {{PLACE}} can best be described as ___.",o:[{k:"a",t:"Indifferent"},{k:"b",t:"Nostalgic and admiring"},{k:"c",t:"Angry"},{k:"d",t:"Confused"},{k:"e",t:"Sarcastic"}],a:"b"},
      {q:"The passage criticises the practice of child labour. Which literary device is used in the line: \"Their childhood was sold for a few naira\"?",o:[{k:"a",t:"Simile"},{k:"b",t:"Metaphor"},{k:"c",t:"Personification"},{k:"d",t:"Hyperbole"},{k:"e",t:"Alliteration"}],a:"b"},
      {q:"The passage suggests that the traditional festival in the village serves primarily to ___.",o:[{k:"a",t:"Entertain tourists"},{k:"b",t:"Preserve cultural heritage and strengthen community bonds"},{k:"c",t:"Generate revenue"},{k:"d",t:"Promote political candidates"},{k:"e",t:"Attract foreign investors"}],a:"b"},
      {q:"What is the thematic significance of the \"broken bridge\" in the story?",o:[{k:"a",t:"It shows poor infrastructure"},{k:"b",t:"It symbolises broken relationships and the need for reconciliation"},{k:"c",t:"It is just a setting detail"},{k:"d",t:"It represents economic decline"},{k:"e",t:"It foreshadows a flood"}],a:"b"},
    ],
  },
  inference: {
    easy: [
      {q:"{{NAME}} was sweating and breathing heavily when he arrived at school. What can you infer?",o:[{k:"a",t:"He was sick"},{k:"b",t:"He ran to school"},{k:"c",t:"He was afraid"},{k:"d",t:"He was sleeping"},{k:"e",t:"He was eating"}],a:"b"},
      {q:"The girl carried an umbrella although the sun was shining. She probably ___.",o:[{k:"a",t:"likes umbrellas"},{k:"b",t:"expected rain later"},{k:"c",t:"was going to the beach"},{k:"d",t:"was playing a game"},{k:"e",t:"was selling umbrellas"}],a:"b"},
      {q:"The kitchen smelled of burnt food. We can infer that ___.",o:[{k:"a",t:"Someone was cooking and it got burnt"},{k:"b",t:"The house was on fire"},{k:"c",t:"They were cleaning"},{k:"d",t:"Food was being delivered"},{k:"e",t:"Someone was painting"}],a:"a"},
      {q:"The students were whispering and looking at the door. The teacher had probably ___.",o:[{k:"a",t:"given them a gift"},{k:"b",t:"arrived unexpectedly"},{k:"c",t:"sent them home"},{k:"d",t:"cancelled the exam"},{k:"e",t:"brought food"}],a:"b"},
      {q:"The car had a flat tyre and the driver looked frustrated. We can infer ___.",o:[{k:"a",t:"The driver was happy"},{k:"b",t:"The driver was delayed"},{k:"c",t:"The driver was celebrating"},{k:"d",t:"The driver was shopping"},{k:"e",t:"The driver was sleeping"}],a:"b"},
    ],
    medium: [
      {q:"The politician's speech was full of promises but lacked specific plans. The author probably believes the politician is ___.",o:[{k:"a",t:"Honest"},{k:"b",t:"Insincere"},{k:"c",t:"Well-prepared"},{k:"d",t:"Educated"},{k:"e",t:"Popular"}],a:"b"},
      {q:"After reading the letter, Mary's hands trembled and she sat down slowly. We can infer that the letter contained ___.",o:[{k:"a",t:"Good news"},{k:"b",t:"Shocking or bad news"},{k:"c",t:"An invitation to a party"},{k:"d",t:"A shopping list"},{k:"e",t:"A recipe"}],a:"b"},
      {q:"The old man always sits by the window looking at the road. It can be inferred that he is ___.",o:[{k:"a",t:"Watching birds"},{k:"b",t:"Waiting for someone"},{k:"c",t:"Avoiding people"},{k:"d",t:"Counting cars"},{k:"e",t:"Selling goods"}],a:"b"},
      {q:"The company's profits increased while employee salaries remained the same. The writer implies that the company ___.",o:[{k:"a",t:"Values its workers"},{k:"b",t:"Is exploiting its workers"},{k:"c",t:"Is going bankrupt"},{k:"d",t:"Has no customers"},{k:"e",t:"Is closing down"}],a:"b"},
      {q:"When the results were announced, Ade kept his head down and walked out quickly. We can infer that Ade ___.",o:[{k:"a",t:"Was celebrating"},{k:"b",t:"Was disappointed with his results"},{k:"c",t:"Was eager to eat"},{k:"d",t:"Was looking for his friend"},{k:"e",t:"Was going to play football"}],a:"b"},
    ],
    hard: [
      {q:"The passage describes a character who smiles at everyone but never makes eye contact. This behaviour suggests ___.",o:[{k:"a",t:"Confidence"},{k:"b",t:"Social anxiety or dishonesty"},{k:"c",t:"Good manners"},{k:"d",t:"Poor vision"},{k:"e",t:"Happiness"}],a:"b"},
      {q:"The narrator describes the abandoned house as \"still holding its breath.\" This personification suggests that ___.",o:[{k:"a",t:"The house is haunted"},{k:"b",t:"The house is waiting for its owners to return"},{k:"c",t:"The house is dangerous"},{k:"d",t:"The house is new"},{k:"e",t:"The house is being repaired"}],a:"b"},
      {q:"The text states that \"the silence was louder than the explosion.\" This hyperbolic statement implies ___.",o:[{k:"a",t:"There was no explosion"},{k:"b",t:"The emotional impact of the silence was overwhelming"},{k:"c",t:"The explosion was quiet"},{k:"d",t:"People were deaf"},{k:"e",t:"The scene was boring"}],a:"b"},
      {q:"The author contrasts the busy streets of {{PLACE}} with the quiet village where the protagonist grew up. This contrast suggests the protagonist feels ___.",o:[{k:"a",t:"At home in the city"},{k:"b",t:"Nostalgic and disconnected"},{k:"c",t:"Angry"},{k:"d",t:"Excited"},{k:"e",t:"Rich"}],a:"b"},
      {q:"The passage mentions that the teacher \"corrected papers with red ink while humming old church hymns.\" What can be inferred about the teacher's character?",o:[{k:"a",t:"She is strict and religious"},{k:"b",t:"She is dedicated to her work and finds comfort in faith"},{k:"c",t:"She dislikes music"},{k:"d",t:"She is careless"},{k:"e",t:"She is impatient"}],a:"b"},
    ],
  },
  vocabulary_in_context: {
    easy: [
      {q:"In the sentence \"The farmers rejoiced when the rain came,\" the word \"rejoiced\" means ___.",o:[{k:"a",t:"shouted"},{k:"b",t:"celebrated with joy"},{k:"c",t:"ran away"},{k:"d",t:"cried"},{k:"e",t:"slept"}],a:"b"},
      {q:"\"The beggar looked famished.\" The word \"famished\" means ___.",o:[{k:"a",t:"rich"},{k:"b",t:"very hungry"},{k:"c",t:"tired"},{k:"d",t:"angry"},{k:"e",t:"happy"}],a:"b"},
      {q:"\"The thief was apprehended by the police.\" The word \"apprehended\" means ___.",o:[{k:"a",t:"helped"},{k:"b",t:"caught"},{k:"c",t:"warned"},{k:"d",t:"ignored"},{k:"e",t:"released"}],a:"b"},
      {q:"\"The child was trembling with fear.\" The word \"trembling\" means ___.",o:[{k:"a",t:"singing"},{k:"b",t:"shaking"},{k:"c",t:"laughing"},{k:"d",t:"eating"},{k:"e",t:"dancing"}],a:"b"},
      {q:"\"The students were jubilant after winning the match.\" The word \"jubilant\" means ___.",o:[{k:"a",t:"sad"},{k:"b",t:"very happy and excited"},{k:"c",t:"tired"},{k:"d",t:"angry"},{k:"e",t:"confused"}],a:"b"},
    ],
    medium: [
      {q:"\"The proposal was met with tacit approval.\" The word \"tacit\" means ___.",o:[{k:"a",t:"loud"},{k:"b",t:"silent or understood without being spoken"},{k:"c",t:"written"},{k:"d",t:"official"},{k:"e",t:"public"}],a:"b"},
      {q:"\"The government implemented stringent measures.\" The word \"stringent\" means ___.",o:[{k:"a",t:"weak"},{k:"b",t:"strict or severe"},{k:"c",t:"temporary"},{k:"d",t:"flexible"},{k:"e",t:"optional"}],a:"b"},
      {q:"The passage describes the leader as \"having an acerbic wit.\" The word \"acerbic\" means ___.",o:[{k:"a",t:"gentle"},{k:"b",t:"sharp and biting"},{k:"c",t:"boring"},{k:"d",t:"kind"},{k:"e",t:"slow"}],a:"b"},
      {q:"\"The athlete's performance was laudable.\" The word \"laudable\" means ___.",o:[{k:"a",t:"terrible"},{k:"b",t:"praiseworthy"},{k:"c",t:"average"},{k:"d",t:"unfair"},{k:"e",t:"illegal"}],a:"b"},
      {q:"The weather was described as \"inclement.\" This means the weather was ___.",o:[{k:"a",t:"perfect"},{k:"b",t:"unpleasant or severe"},{k:"c",t:"sunny"},{k:"d",t:"mild"},{k:"e",t:"dry"}],a:"b"},
    ],
    hard: [
      {q:"\"The diplomat's remarks were deliberately equivocal.\" The word \"equivocal\" means ___.",o:[{k:"a",t:"clear and direct"},{k:"b",t:"deliberately ambiguous or unclear"},{k:"c",t:"honest"},{k:"d",t:"angry"},{k:"e",t:"brief"}],a:"b"},
      {q:"\"The villagers showed obsequious respect to the visiting official.\" The word \"obsequious\" means ___.",o:[{k:"a",t:"genuine"},{k:"b",t:"excessively submissive or fawning"},{k:"c",t:"moderate"},{k:"d",t:"indifferent"},{k:"e",t:"hostile"}],a:"b"},
      {q:"The critic described the novel as \"soporific.\" This means the novel was ___.",o:[{k:"a",t:"exciting"},{k:"b",t:"boring or sleep-inducing"},{k:"c",t:"educational"},{k:"d",t:"funny"},{k:"e",t:"short"}],a:"b"},
      {q:"\"The politician's speech was filled with grandiloquent promises.\" The word \"grandiloquent\" means ___.",o:[{k:"a",t:"small"},{k:"b",t:"pompous or overly grand in expression"},{k:"c",t:"quiet"},{k:"d",t:"simple"},{k:"e",t:"honest"}],a:"b"},
      {q:"\"The evidence was incontrovertible.\" The word \"incontrovertible\" means ___.",o:[{k:"a",t:"weak"},{k:"b",t:"impossible to dispute or deny"},{k:"c",t:"confusing"},{k:"d",t:"hidden"},{k:"e",t:"temporary"}],a:"b"},
    ],
  },
  summary: {
    easy: [
      {q:"Which of these is the best summary of a story about a boy who finds a lost dog and returns it to its owner?",o:[{k:"a",t:"A boy finds a dog and keeps it"},{k:"b",t:"A boy finds a lost dog and returns it to its owner"},{k:"c",t:"A boy buys a dog from the market"},{k:"d",t:"A dog runs away from home"},{k:"e",t:"A boy is afraid of dogs"}],a:"b"},
      {q:"A passage describes how {{NAME}} studied hard and passed her WAEC exam. The best summary is:",o:[{k:"a",t:"{{NAME}} likes school"},{k:"b",t:"{{NAME}} studied hard and passed her WAEC exam"},{k:"c",t:"WAEC is difficult"},{k:"d",t:"{{NAME}} went to {{PLACE}}"},{k:"e",t:"School is important"}],a:"b"},
      {q:"Which sentence best summarises a text about the dangers of smoking?",o:[{k:"a",t:"Smoking is expensive"},{k:"b",t:"Smoking harms health and should be avoided"},{k:"c",t:"Many people smoke"},{k:"d",t:"Cigarettes are sold everywhere"},{k:"e",t:"Smoking is a habit"}],a:"b"},
      {q:"A story tells how a community built a well together. The best summary is:",o:[{k:"a",t:"Water is important"},{k:"b",t:"A community worked together to build a well"},{k:"c",t:"Wells are deep"},{k:"d",t:"People need water"},{k:"e",t:"The community lives in a village"}],a:"b"},
      {q:"Which is the best summary of a passage about the benefits of reading?",o:[{k:"a",t:"Books are sold in bookshops"},{k:"b",t:"Reading improves knowledge, vocabulary, and thinking skills"},{k:"c",t:"Children like stories"},{k:"d",t:"Libraries are quiet places"},{k:"e",t:"Paper is made from trees"}],a:"b"},
    ],
    medium: [
      {q:"A passage discusses deforestation, its causes, effects on climate, and possible solutions. The best summary is:",o:[{k:"a",t:"Trees are important"},{k:"b",t:"Deforestation affects climate, and solutions include reforestation and conservation laws"},{k:"c",t:"People cut trees"},{k:"d",t:"The climate is changing"},{k:"e",t:"Forests are beautiful"}],a:"b"},
      {q:"A text describes the history of education in Nigeria from colonial times to present. The best summary captures:",o:[{k:"a",t:"Nigeria has many schools"},{k:"b",t:"Nigerian education evolved from colonial systems to modern national curricula"},{k:"c",t:"Colonialism was bad"},{k:"d",t:"Children go to school"},{k:"e",t:"Teachers work hard"}],a:"b"},
      {q:"A passage explains how mobile phones have changed communication in rural Africa. The best summary is:",o:[{k:"a",t:"Mobile phones are expensive"},{k:"b",t:"Mobile phones have transformed communication and access to information in rural Africa"},{k:"c",t:"People like phones"},{k:"d",t:"Africa is rural"},{k:"e",t:"Phones have cameras"}],a:"b"},
      {q:"A story describes a girl's journey from poverty to becoming a doctor through scholarships and hard work. The best summary is:",o:[{k:"a",t:"The girl was poor"},{k:"b",t:"Through determination and scholarships, a girl overcame poverty to become a doctor"},{k:"c",t:"Doctors earn money"},{k:"d",t:"Scholarships exist"},{k:"e",t:"Hard work is good"}],a:"b"},
      {q:"A passage discusses corruption in governance, its effects on development, and anti-corruption measures. The best summary is:",o:[{k:"a",t:"Government is bad"},{k:"b",t:"Corruption hinders development, but anti-corruption agencies and transparency can help"},{k:"c",t:"People steal money"},{k:"d",t:"Nigeria has problems"},{k:"e",t:"Leaders are powerful"}],a:"b"},
    ],
    hard: [
      {q:"A complex passage analyses the relationship between urbanisation, unemployment, and crime rates in Nigerian cities. The best summary captures:",o:[{k:"a",t:"Cities are crowded"},{k:"b",t:"Urbanisation leads to unemployment, which contributes to rising crime rates in cities"},{k:"c",t:"Crime is bad"},{k:"d",t:"People move to cities"},{k:"e",t:"Unemployment exists"}],a:"b"},
      {q:"A text examines how colonial borders created ethnic tensions that persist in modern African politics. The best summary is:",o:[{k:"a",t:"Africa has many tribes"},{k:"b",t:"Arbitrary colonial borders created lasting ethnic tensions that continue to affect African politics"},{k:"c",t:"Politics is complicated"},{k:"d",t:"Colonialism happened"},{k:"e",t:"Ethnic groups fight"}],a:"b"},
      {q:"A passage critiques the over-reliance on oil exports, neglect of agriculture, and suggests diversification. The best summary is:",o:[{k:"a",t:"Oil is valuable"},{k:"b",t:"Over-reliance on oil and neglect of agriculture call for economic diversification"},{k:"c",t:"Farmers are poor"},{k:"d",t:"Oil prices change"},{k:"e",t:"Nigeria exports oil"}],a:"b"},
      {q:"A story uses multiple perspectives to show how a single event (a market fire) affects different characters differently. The best summary notes:",o:[{k:"a",t:"A market caught fire"},{k:"b",t:"A market fire impacts different characters in varied ways, revealing their individual struggles"},{k:"c",t:"Fires are dangerous"},{k:"d",t:"Markets sell goods"},{k:"e",t:"People lost money"}],a:"b"},
      {q:"A text argues that traditional medicine and modern healthcare should be integrated rather than seen as opposing systems. The best summary is:",o:[{k:"a",t:"Hospitals are better"},{k:"b",t:"Traditional medicine and modern healthcare should complement each other for better health outcomes"},{k:"c",t:"Herbs are natural"},{k:"d",t:"Doctors study medicine"},{k:"e",t:"People get sick"}],a:"b"},
    ],
  },
  reading_skills: {
    easy: [
      {q:"What should you do first when you start reading a comprehension passage?",o:[{k:"a",t:"Answer the questions immediately"},{k:"b",t:"Read the questions first, then skim the passage"},{k:"c",t:"Skip to the last paragraph"},{k:"d",t:"Guess the answers"},{k:"e",t:"Copy from a friend"}],a:"b"},
      {q:"Skimming a passage means reading it ___.",o:[{k:"a",t:"word by word carefully"},{k:"b",t:"quickly to get the main idea"},{k:"c",t:"backward"},{k:"d",t:"aloud"},{k:"e",t:"while sleeping"}],a:"b"},
      {q:"The topic sentence of a paragraph usually tells us ___.",o:[{k:"a",t:"every detail in the paragraph"},{k:"b",t:"the main idea of the paragraph"},{k:"c",t:"the author's name"},{k:"d",t:"the date of writing"},{k:"e",t:"the number of words"}],a:"b"},
      {q:"When you scan a text, you are looking for ___.",o:[{k:"a",t:"hidden meanings"},{k:"b",t:"specific information like dates or names"},{k:"c",t:"the author's opinion"},{k:"d",t:"grammatical errors"},{k:"e",t:"rhyme patterns"}],a:"b"},
      {q:"A good reader always ___.",o:[{k:"a",t:"reads as fast as possible"},{k:"b",t:"checks the meaning of unfamiliar words using context clues"},{k:"c",t:"skips long paragraphs"},{k:"d",t:"memorises every word"},{k:"e",t:"reads only at night"}],a:"b"},
    ],
    medium: [
      {q:"Which reading strategy helps you understand the author's attitude or tone?",o:[{k:"a",t:"Skimming"},{k:"b",t:"Analysing word choice and figurative language"},{k:"c",t:"Counting words"},{k:"d",t:"Copying sentences"},{k:"e",t:"Skipping paragraphs"}],a:"b"},
      {q:"When a passage uses words like \"however,\" \"on the other hand,\" and \"nevertheless,\" the author is probably ___.",o:[{k:"a",t:"listing items"},{k:"b",t:"introducing a contrast or opposing idea"},{k:"c",t:"telling a joke"},{k:"d",t:"describing a person"},{k:"e",t:"giving instructions"}],a:"b"},
      {q:"To identify the purpose of a text, a reader should ask:",o:[{k:"a",t:"How many pages is it?"},{k:"b",t:"Is the author trying to inform, persuade, entertain, or instruct?"},{k:"c",t:"Who printed it?"},{k:"d",t:"What colour is the cover?"},{k:"e",t:"When was it written?"}],a:"b"},
      {q:"A reader who makes inferences is ___.",o:[{k:"a",t:"copying text"},{k:"b",t:"reading between the lines to draw logical conclusions"},{k:"c",t:"reading aloud"},{k:"d",t:"skipping sections"},{k:"e",t:"translating the text"}],a:"b"},
      {q:"When reading argumentative texts, it is important to distinguish between ___.",o:[{k:"a",t:"facts and opinions"},{k:"b",t:"nouns and verbs"},{k:"c",t:"long and short sentences"},{k:"d",t:"proper and common nouns"},{k:"e",t:"vowels and consonants"}],a:"a"},
    ],
    hard: [
      {q:"Critical reading requires the reader to ___.",o:[{k:"a",t:"accept everything the author says"},{k:"b",t:"question assumptions, evaluate evidence, and recognise bias"},{k:"c",t:"memorise every detail"},{k:"d",t:"read only the introduction"},{k:"e",t:"ignore the conclusion"}],a:"b"},
      {q:"When an author uses rhetorical questions, the purpose is usually to ___.",o:[{k:"a",t:"confuse the reader"},{k:"b",t:"engage the reader and emphasise a point"},{k:"c",t:"fill space"},{k:"d",t:"ask for information"},{k:"e",t:"introduce a new topic"}],a:"b"},
      {q:"Synthesising information from multiple passages means ___.",o:[{k:"a",t:"copying from each passage"},{k:"b",t:"combining ideas from different sources to form new understanding"},{k:"c",t:"choosing the shortest passage"},{k:"d",t:"translating each passage"},{k:"e",t:"counting the words in each passage"}],a:"b"},
      {q:"An unreliable narrator is one who ___.",o:[{k:"a",t:"tells the truth"},{k:"b",t:"cannot be fully trusted due to bias, ignorance, or dishonesty"},{k:"c",t:"speaks loudly"},{k:"d",t:"uses simple language"},{k:"e",t:"is a child"}],a:"b"},
      {q:"When analysing a persuasive text, identifying logical fallacies helps the reader to ___.",o:[{k:"a",t:"agree with the author"},{k:"b",t:"recognise weak or deceptive arguments"},{k:"c",t:"write faster"},{k:"d",t:"ignore the text"},{k:"e",t:"find spelling errors"}],a:"b"},
    ],
  },

  // VOCABULARY
  synonyms: {
    easy: [
      {q:"Choose the synonym of \"happy\":",o:[{k:"a",t:"sad"},{k:"b",t:"joyful"},{k:"c",t:"angry"},{k:"d",t:"tired"},{k:"e",t:"hungry"}],a:"b"},
      {q:"Choose the synonym of \"begin\":",o:[{k:"a",t:"end"},{k:"b",t:"start"},{k:"c",t:"stop"},{k:"d",t:"close"},{k:"e",t:"finish"}],a:"b"},
      {q:"Choose the synonym of \"brave\":",o:[{k:"a",t:"cowardly"},{k:"b",t:"fearless"},{k:"c",t:"weak"},{k:"d",t:"shy"},{k:"e",t:"quiet"}],a:"b"},
      {q:"Choose the synonym of \"quickly\":",o:[{k:"a",t:"slowly"},{k:"b",t:"rapidly"},{k:"c",t:"carefully"},{k:"d",t:"quietly"},{k:"e",t:"suddenly"}],a:"b"},
      {q:"Choose the synonym of \"help\":",o:[{k:"a",t:"ignore"},{k:"b",t:"assist"},{k:"c",t:"hinder"},{k:"d",t:"delay"},{k:"e",t:"avoid"}],a:"b"},
    ],
    medium: [
      {q:"Choose the synonym of \"magnificent\":",o:[{k:"a",t:"ugly"},{k:"b",t:"splendid"},{k:"c",t:"small"},{k:"d",t:"broken"},{k:"e",t:"dirty"}],a:"b"},
      {q:"Choose the synonym of \"abundant\":",o:[{k:"a",t:"scarce"},{k:"b",t:"plentiful"},{k:"c",t:"tiny"},{k:"d",t:"weak"},{k:"e",t:"slow"}],a:"b"},
      {q:"Choose the synonym of \"hostile\":",o:[{k:"a",t:"friendly"},{k:"b",t:"aggressive"},{k:"c",t:"calm"},{k:"d",t:"helpful"},{k:"e",t:"gentle"}],a:"b"},
      {q:"Choose the synonym of \"diligent\":",o:[{k:"a",t:"lazy"},{k:"b",t:"hardworking"},{k:"c",t:"careless"},{k:"d",t:"noisy"},{k:"e",t:"rude"}],a:"b"},
      {q:"Choose the synonym of \"prudent\":",o:[{k:"a",t:"reckless"},{k:"b",t:"wise and careful"},{k:"c",t:"foolish"},{k:"d",t:"angry"},{k:"e",t:"quick"}],a:"b"},
    ],
    hard: [
      {q:"Choose the synonym of \"perspicacious\":",o:[{k:"a",t:"foolish"},{k:"b",t:"mentally sharp or insightful"},{k:"c",t:"slow"},{k:"d",t:"loud"},{k:"e",t:"careless"}],a:"b"},
      {q:"Choose the synonym of \"ebullient\":",o:[{k:"a",t:"sad"},{k:"b",t:"cheerful and full of energy"},{k:"c",t:"angry"},{k:"d",t:"tired"},{k:"e",t:"shy"}],a:"b"},
      {q:"Choose the synonym of \"sagacious\":",o:[{k:"a",t:"foolish"},{k:"b",t:"wise and discerning"},{k:"c",t:"young"},{k:"d",t:"weak"},{k:"e",t:"noisy"}],a:"b"},
      {q:"Choose the synonym of \"fortuitous\":",o:[{k:"a",t:"planned"},{k:"b",t:"happening by chance or luck"},{k:"c",t:"expected"},{k:"d",t:"unlucky"},{k:"e",t:"impossible"}],a:"b"},
      {q:"Choose the synonym of \"incorrigible\":",o:[{k:"a",t:"obedient"},{k:"b",t:"impossible to correct or reform"},{k:"c",t:"polite"},{k:"d",t:"careful"},{k:"e",t:"honest"}],a:"b"},
    ],
  },
  antonyms: {
    easy: [
      {q:"The antonym of \"brave\" is:",o:[{k:"a",t:"strong"},{k:"b",t:"fearless"},{k:"c",t:"cowardly"},{k:"d",t:"bold"},{k:"e",t:"heroic"}],a:"c"},
      {q:"The antonym of \"happy\" is:",o:[{k:"a",t:"joyful"},{k:"b",t:"cheerful"},{k:"c",t:"sad"},{k:"d",t:"excited"},{k:"e",t:"pleased"}],a:"c"},
      {q:"The antonym of \"rich\" is:",o:[{k:"a",t:"wealthy"},{k:"b",t:"prosperous"},{k:"c",t:"poor"},{k:"d",t:"successful"},{k:"e",t:"fortunate"}],a:"c"},
      {q:"The antonym of \"beautiful\" is:",o:[{k:"a",t:"pretty"},{k:"b",t:"attractive"},{k:"c",t:"ugly"},{k:"d",t:"lovely"},{k:"e",t:"elegant"}],a:"c"},
      {q:"The antonym of \"early\" is:",o:[{k:"a",t:"soon"},{k:"b",t:"quick"},{k:"c",t:"late"},{k:"d",t:"first"},{k:"e",t:"prompt"}],a:"c"},
    ],
    medium: [
      {q:"The antonym of \"generous\" is:",o:[{k:"a",t:"kind"},{k:"b",t:"giving"},{k:"c",t:"selfish"},{k:"d",t:"helpful"},{k:"e",t:"charitable"}],a:"c"},
      {q:"The antonym of \"ancient\" is:",o:[{k:"a",t:"old"},{k:"b",t:"traditional"},{k:"c",t:"modern"},{k:"d",t:"historic"},{k:"e",t:"aged"}],a:"c"},
      {q:"The antonym of \"arrogant\" is:",o:[{k:"a",t:"proud"},{k:"b",t:"boastful"},{k:"c",t:"humble"},{k:"d",t:"confident"},{k:"e",t:"bold"}],a:"c"},
      {q:"The antonym of \"permanent\" is:",o:[{k:"a",t:"lasting"},{k:"b",t:"eternal"},{k:"c",t:"temporary"},{k:"d",t:"forever"},{k:"e",t:"fixed"}],a:"c"},
      {q:"The antonym of \"vivid\" is:",o:[{k:"a",t:"bright"},{k:"b",t:"colourful"},{k:"c",t:"dull"},{k:"d",t:"clear"},{k:"e",t:"strong"}],a:"c"},
    ],
    hard: [
      {q:"The antonym of \"ephemeral\" is:",o:[{k:"a",t:"brief"},{k:"b",t:"short-lived"},{k:"c",t:"everlasting"},{k:"d",t:"fleeting"},{k:"e",t:"temporary"}],a:"c"},
      {q:"The antonym of \"ostentatious\" is:",o:[{k:"a",t:"showy"},{k:"b",t:"flashy"},{k:"c",t:"modest"},{k:"d",t:"expensive"},{k:"e",t:"grand"}],a:"c"},
      {q:"The antonym of \"benevolent\" is:",o:[{k:"a",t:"kind"},{k:"b",t:"charitable"},{k:"c",t:"malevolent"},{k:"d",t:"generous"},{k:"e",t:"caring"}],a:"c"},
      {q:"The antonym of \"verbose\" is:",o:[{k:"a",t:"wordy"},{k:"b",t:"talkative"},{k:"c",t:"concise"},{k:"d",t:"lengthy"},{k:"e",t:"detailed"}],a:"c"},
      {q:"The antonym of \"pragmatic\" is:",o:[{k:"a",t:"practical"},{k:"b",t:"realistic"},{k:"c",t:"idealistic"},{k:"d",t:"sensible"},{k:"e",t:"logical"}],a:"c"},
    ],
  },
  idioms: {
    easy: [
      {q:"What is the meaning of the idiom \"break a leg\"?",o:[{k:"a",t:"Actually break your leg"},{k:"b",t:"Good luck"},{k:"c",t:"Run fast"},{k:"d",t:"Stop performing"},{k:"e",t:"Be careful"}],a:"b"},
      {q:"\"It is raining cats and dogs\" means ___.",o:[{k:"a",t:"Animals are falling"},{k:"b",t:"It is raining very heavily"},{k:"c",t:"Dogs and cats are playing"},{k:"d",t:"The weather is calm"},{k:"e",t:"There is a flood"}],a:"b"},
      {q:"\"Bite off more than you can chew\" means ___.",o:[{k:"a",t:"Eat too much"},{k:"b",t:"Take on more responsibility than you can handle"},{k:"c",t:"Chew carefully"},{k:"d",t:"Share food"},{k:"e",t:"Cook a big meal"}],a:"b"},
      {q:"\"Hit the nail on the head\" means ___.",o:[{k:"a",t:"Build something"},{k:"b",t:"Say or do exactly the right thing"},{k:"c",t:"Hurt yourself"},{k:"d",t:"Miss the target"},{k:"e",t:"Work with tools"}],a:"b"},
      {q:"\"A piece of cake\" means something is ___.",o:[{k:"a",t:"delicious"},{k:"b",t:"very easy"},{k:"c",t:"expensive"},{k:"d",t:"rare"},{k:"e",t:"sweet"}],a:"b"},
    ],
    medium: [
      {q:"\"To cost an arm and a leg\" means ___.",o:[{k:"a",t:"To injure yourself"},{k:"b",t:"To be very expensive"},{k:"c",t:"To buy furniture"},{k:"d",t:"To travel far"},{k:"e",t:"To work hard"}],a:"b"},
      {q:"\"Don't count your chickens before they hatch\" means ___.",o:[{k:"a",t:"Don't keep chickens"},{k:"b",t:"Don't assume success before it happens"},{k:"c",t:"Count carefully"},{k:"d",t:"Hatch eggs quickly"},{k:"e",t:"Buy more chickens"}],a:"b"},
      {q:"\"Spill the beans\" means ___.",o:[{k:"a",t:"Cook beans"},{k:"b",t:"Reveal a secret"},{k:"c",t:"Eat messily"},{k:"d",t:"Plant beans"},{k:"e",t:"Buy food"}],a:"b"},
      {q:"\"Burn the midnight oil\" means ___.",o:[{k:"a",t:"Start a fire"},{k:"b",t:"Study or work late into the night"},{k:"c",t:"Waste oil"},{k:"d",t:"Sleep early"},{k:"e",t:"Cook dinner"}],a:"b"},
      {q:"\"Let the cat out of the bag\" means ___.",o:[{k:"a",t:"Release a pet"},{k:"b",t:"Accidentally reveal a secret"},{k:"c",t:"Buy groceries"},{k:"d",t:"Go shopping"},{k:"e",t:"Catch a thief"}],a:"b"},
    ],
    hard: [
      {q:"\"To throw caution to the wind\" means ___.",o:[{k:"a",t:"Be careful"},{k:"b",t:"Take a risk without worrying about consequences"},{k:"c",t:"Check the weather"},{k:"d",t:"Drive slowly"},{k:"e",t:"Plan carefully"}],a:"b"},
      {q:"\"A blessing in disguise\" refers to ___.",o:[{k:"a",t:"A hidden treasure"},{k:"b",t:"Something bad that turns out to be good"},{k:"c",t:"A religious event"},{k:"d",t:"A surprise gift"},{k:"e",t:"A secret plan"}],a:"b"},
      {q:"\"To have an axe to grind\" means ___.",o:[{k:"a",t:"Sharpen tools"},{k:"b",t:"Have a selfish reason for doing something"},{k:"c",t:"Work as a carpenter"},{k:"d",t:"Solve a problem"},{k:"e",t:"Help someone"}],a:"b"},
      {q:"\"To cut corners\" means ___.",o:[{k:"a",t:"Draw shapes"},{k:"b",t:"Do something poorly to save time or money"},{k:"c",t:"Take a shortcut on the road"},{k:"d",t:"Build furniture"},{k:"e",t:"Save food"}],a:"b"},
      {q:"\"To add fuel to the fire\" means ___.",o:[{k:"a",t:"Start a fire"},{k:"b",t:"Make a bad situation worse"},{k:"c",t:"Cook food"},{k:"d",t:"Warm the house"},{k:"e",t:"Save energy"}],a:"b"},
    ],
  },
  word_formation: {
    easy: [
      {q:"The word \"unhappy\" is formed by adding a ___.",o:[{k:"a",t:"suffix"},{k:"b",t:"prefix"},{k:"c",t:"root"},{k:"d",t:"compound"},{k:"e",t:"synonym"}],a:"b"},
      {q:"\"Teacher\" becomes \"teachers\" by adding a ___.",o:[{k:"a",t:"prefix"},{k:"b",t:"suffix"},{k:"c",t:"root"},{k:"d",t:"compound"},{k:"e",t:"antonym"}],a:"b"},
      {q:"What prefix turns \"do\" into its opposite?",o:[{k:"a",t:"re-"},{k:"b",t:"pre-"},{k:"c",t:"un-"},{k:"d",t:"dis-"},{k:"e",t:"mis-"}],a:"c"},
      {q:"The suffix \"-ness\" in \"happiness\" turns an adjective into a(n) ___.",o:[{k:"a",t:"verb"},{k:"b",t:"adverb"},{k:"c",t:"noun"},{k:"d",t:"pronoun"},{k:"e",t:"preposition"}],a:"c"},
      {q:"Which word is formed by compounding?",o:[{k:"a",t:"running"},{k:"b",t:"sunflower"},{k:"c",t:"unhappy"},{k:"d",t:"teachers"},{k:"e",t:"quickly"}],a:"b"},
    ],
    medium: [
      {q:"The prefix \"bio-\" in \"biology\" means ___.",o:[{k:"a",t:"earth"},{k:"b",t:"life"},{k:"c",t:"water"},{k:"d",t:"fire"},{k:"e",t:"air"}],a:"b"},
      {q:"What is the root word in \"impossible\"?",o:[{k:"a",t:"im-"},{k:"b",t:"possible"},{k:"c",t:"-ible"},{k:"d",t:"impos"},{k:"e",t:"pose"}],a:"b"},
      {q:"The suffix \"-ful\" in \"beautiful\" changes the word to a(n) ___.",o:[{k:"a",t:"verb"},{k:"b",t:"adjective"},{k:"c",t:"noun"},{k:"d",t:"adverb"},{k:"e",t:"conjunction"}],a:"b"},
      {q:"\"Telephone\" is formed from Greek/Latin roots meaning ___.",o:[{k:"a",t:"far + sound"},{k:"b",t:"far + voice"},{k:"c",t:"near + sound"},{k:"d",t:"near + voice"},{k:"e",t:"far + light"}],a:"b"},
      {q:"Which prefix means \"before\"?",o:[{k:"a",t:"post-"},{k:"b",t:"pre-"},{k:"c",t:"anti-"},{k:"d",t:"sub-"},{k:"e",t:"non-"}],a:"b"},
    ],
    hard: [
      {q:"The word \"photosynthesis\" is formed from Greek roots meaning ___.",o:[{k:"a",t:"light + sound"},{k:"b",t:"light + putting together"},{k:"c",t:"water + food"},{k:"d",t:"air + growth"},{k:"e",t:"sun + energy"}],a:"b"},
      {q:"What type of word formation is \"brexit\" (Britain + exit)?",o:[{k:"a",t:"Prefixation"},{k:"b",t:"Suffixation"},{k:"c",t:"Blending"},{k:"d",t:"Compounding"},{k:"e",t:"Conversion"}],a:"c"},
      {q:"The word \"unbelievable\" contains ___.",o:[{k:"a",t:"One prefix and one suffix"},{k:"b",t:"Two prefixes and one suffix"},{k:"c",t:"One prefix and two suffixes"},{k:"d",t:"No affixes"},{k:"e",t:"Only a root"}],a:"c"},
      {q:"\"Democracy\" comes from Greek meaning ___.",o:[{k:"a",t:"rule by the rich"},{k:"b",t:"rule by the people"},{k:"c",t:"rule by the king"},{k:"d",t:"rule by the army"},{k:"e",t:"rule by the gods"}],a:"b"},
      {q:"The word \"e-book\" is an example of ___.",o:[{k:"a",t:"Acronym"},{k:"b",t:"Clip + compound"},{k:"c",t:"Back-formation"},{k:"d",t:"Reduplication"},{k:"e",t:"Neologism"}],a:"b"},
    ],
  },
  spelling: {
    easy: [
      {q:"Which spelling is correct?",o:[{k:"a",t:"accomodate"},{k:"b",t:"accommodate"},{k:"c",t:"acommodate"},{k:"d",t:"accommodete"},{k:"e",t:"acommodete"}],a:"b"},
      {q:"Which spelling is correct?",o:[{k:"a",t:"definately"},{k:"b",t:"definitely"},{k:"c",t:"definetly"},{k:"d",t:"definitley"},{k:"e",t:"defiantly"}],a:"b"},
      {q:"Which spelling is correct?",o:[{k:"a",t:"occurance"},{k:"b",t:"occurrence"},{k:"c",t:"occurrance"},{k:"d",t:"ocurence"},{k:"e",t:"occurance"}],a:"b"},
      {q:"Which spelling is correct?",o:[{k:"a",t:"seperate"},{k:"b",t:"separate"},{k:"c",t:"seperete"},{k:"d",t:"separrate"},{k:"e",t:"seperrate"}],a:"b"},
      {q:"Which spelling is correct?",o:[{k:"a",t:"recieve"},{k:"b",t:"receive"},{k:"c",t:"receeve"},{k:"d",t:"receve"},{k:"e",t:"recive"}],a:"b"},
    ],
    medium: [
      {q:"Which spelling is correct?",o:[{k:"a",t:"indispensible"},{k:"b",t:"indispensable"},{k:"c",t:"indispencable"},{k:"d",t:"indespensable"},{k:"e",t:"indispensble"}],a:"b"},
      {q:"Which spelling is correct?",o:[{k:"a",t:"consciencious"},{k:"b",t:"conscientious"},{k:"c",t:"consciensious"},{k:"d",t:"conscentious"},{k:"e",t:"conscientous"}],a:"b"},
      {q:"Which spelling is correct?",o:[{k:"a",t:"hygeine"},{k:"b",t:"hygiene"},{k:"c",t:"hygine"},{k:"d",t:"higeine"},{k:"e",t:"hygeene"}],a:"b"},
      {q:"Which spelling is correct?",o:[{k:"a",t:"paralell"},{k:"b",t:"parallel"},{k:"c",t:"parrallel"},{k:"d",t:"paralel"},{k:"e",t:"parralel"}],a:"b"},
      {q:"Which spelling is correct?",o:[{k:"a",t:"maintainance"},{k:"b",t:"maintenance"},{k:"c",t:"maintanance"},{k:"d",t:"maintenence"},{k:"e",t:"maintainence"}],a:"b"},
    ],
    hard: [
      {q:"Which spelling is correct?",o:[{k:"a",t:"acquaintance"},{k:"b",t:"aquaintance"},{k:"c",t:"acquaintence"},{k:"d",t:"aquaintence"},{k:"e",t:"acquaintanse"}],a:"a"},
      {q:"Which spelling is correct?",o:[{k:"a",t:"rhythym"},{k:"b",t:"rhythm"},{k:"c",t:"rythm"},{k:"d",t:"rythym"},{k:"e",t:"rhithm"}],a:"b"},
      {q:"Which spelling is correct?",o:[{k:"a",t:"millennium"},{k:"b",t:"millenium"},{k:"c",t:"milleniumm"},{k:"d",t:"milennum"},{k:"e",t:"milleniumn"}],a:"a"},
      {q:"Which spelling is correct?",o:[{k:"a",t:"supersede"},{k:"b",t:"supercede"},{k:"c",t:"superseed"},{k:"d",t:"superceed"},{k:"e",t:"supersseed"}],a:"a"},
      {q:"Which spelling is correct?",o:[{k:"a",t:"liaison"},{k:"b",t:"liason"},{k:"c",t:"liaizon"},{k:"d",t:"liasion"},{k:"e",t:"liaisn"}],a:"a"},
    ],
  },

  // ORAL
  vowel_sounds: {
    easy: [
      {q:"How many pure vowel sounds are there in standard English?",o:[{k:"a",t:"5"},{k:"b",t:"10"},{k:"c",t:"12"},{k:"d",t:"20"},{k:"e",t:"26"}],a:"c"},
      {q:"Which of these is a vowel sound?",o:[{k:"a",t:"/p/"},{k:"b",t:"/k/"},{k:"c",t:"/iː/"},{k:"d",t:"/t/"},{k:"e",t:"/d/"}],a:"c"},
      {q:"The word \"cat\" contains which vowel sound?",o:[{k:"a",t:"/iː/"},{k:"b",t:"/æ/"},{k:"c",t:"/ɑː/"},{k:"d",t:"/ɔː/"},{k:"e",t:"/uː/"}],a:"b"},
      {q:"The diphthong /aɪ/ is found in which word?",o:[{k:"a",t:"cat"},{k:"b",t:"see"},{k:"c",t:"boy"},{k:"d",t:"my"},{k:"e",t:"book"}],a:"d"},
      {q:"Which word contains the vowel sound /ɔː/?",o:[{k:"a",t:"cat"},{k:"b",t:"cup"},{k:"c",t:"caught"},{k:"d",t:"cite"},{k:"e",t:"cut"}],a:"c"},
    ],
    medium: [
      {q:"The vowel sound in \"bird\" is classified as a(n) ___.",o:[{k:"a",t:"pure vowel"},{k:"b",t:"diphthong"},{k:"c",t:"triphthong"},{k:"d",t:"schwa"},{k:"e",t:"consonant"}],a:"d"},
      {q:"Which word contains the diphthong /eɪ/?",o:[{k:"a",t:"go"},{k:"b",t:"day"},{k:"c",t:"boy"},{k:"d",t:"cow"},{k:"e",t:"buy"}],a:"b"},
      {q:"The triphthong /aʊə/ is found in which word?",o:[{k:"a",t:"hour"},{k:"b",t:"fire"},{k:"c",t:"tower"},{k:"d",t:"boy"},{k:"e",t:"say"}],a:"c"},
      {q:"In Nigerian English, the vowel sound in \"fork\" is often pronounced as ___.",o:[{k:"a",t:"/ɔː/"},{k:"b",t:"/o/"},{k:"c",t:"/ɒ/"},{k:"d",t:"/əʊ/"},{k:"e",t:"/uː/"}],a:"b"},
      {q:"Which word does NOT contain a diphthong?",o:[{k:"a",t:"house"},{k:"b",t:"goat"},{k:"c",t:"beard"},{k:"d",t:"loud"},{k:"e",t:"pay"}],a:"c"},
    ],
    hard: [
      {q:"The Central Vowel (schwa) /ə/ occurs most frequently in ___.",o:[{k:"a",t:"Stressed syllables"},{k:"b",t:"Unstressed syllables"},{k:"c",t:"Word-initial position"},{k:"d",t:"Word-final stressed position"},{k:"e",t:"Syllabic consonants"}],a:"b"},
      {q:"In the word \"queue,\" the vowel sound is ___.",o:[{k:"a",t:"A diphthong"},{k:"b",t:"A triphthong"},{k:"c",t:"A long monophthong /juː/"},{k:"d",t:"A short vowel"},{k:"e",t:"A schwa"}],a:"c"},
      {q:"The vowel length distinction in \"bit\" /ɪ/ versus \"beat\" /iː/ is an example of ___.",o:[{k:"a",t:"Tone"},{k:"b",t:"Quantity"},{k:"c",t:"Stress"},{k:"d",t:"Pitch"},{k:"e",t:"Intonation"}],a:"b"},
      {q:"Which of the following is a back vowel?",o:[{k:"a",t:"/iː/"},{k:"b",t:"/e/"},{k:"c",t:"/ɑː/"},{k:"d",t:"/æ/"},{k:"e",t:"/ɪ/"}],a:"c"},
      {q:"The vowel in the Nigerian pronunciation of \"herb\" as /hɛb/ instead of /hɜːb/ demonstrates ___.",o:[{k:"a",t:"Rhoticity"},{k:"b",t:"Rhotacism"},{k:"c",t:"The absence of /ɜː/ in many Nigerian accents"},{k:"d",t:"A spelling pronunciation"},{k:"e",t:"Vowel reduction"}],a:"c"},
    ],
  },
  consonant_sounds: {
    easy: [
      {q:"Which of these is a voiced consonant?",o:[{k:"a",t:"p"},{k:"b",t:"t"},{k:"c",t:"k"},{k:"d",t:"b"},{k:"e",t:"f"}],a:"d"},
      {q:"The sound /ŋ/ is found at the end of which word?",o:[{k:"a",t:"sing"},{k:"b",t:"sin"},{k:"c",t:"sink"},{k:"d",t:"singer"},{k:"e",t:"singe"}],a:"a"},
      {q:"Which of these is a fricative consonant?",o:[{k:"a",t:"p"},{k:"b",t:"b"},{k:"c",t:"v"},{k:"d",t:"d"},{k:"e",t:"g"}],a:"c"},
      {q:"The sound /ʃ/ is found in which word?",o:[{k:"a",t:"ship"},{k:"b",t:"sip"},{k:"c",t:"chip"},{k:"d",t:"zip"},{k:"e",t:"tip"}],a:"a"},
      {q:"Which pair are bilabial consonants?",o:[{k:"a",t:"t, d"},{k:"b",t:"p, b"},{k:"c",t:"k, g"},{k:"d",t:"f, v"},{k:"e",t:"s, z"}],a:"b"},
    ],
    medium: [
      {q:"The consonant cluster /str/ in \"street\" contains how many phonemes?",o:[{k:"a",t:"2"},{k:"b",t:"3"},{k:"c",t:"4"},{k:"d",t:"5"},{k:"e",t:"1"}],a:"b"},
      {q:"Which word contains the voiced palatal affricate /dʒ/?",o:[{k:"a",t:"ship"},{k:"b",t:"chip"},{k:"c",t:"jump"},{k:"d",t:"thin"},{k:"e",t:"think"}],a:"c"},
      {q:"The glottal stop /ʔ/ is commonly heard in Nigerian English when a speaker says:",o:[{k:"a",t:"butter"},{k:"b",t:"mutton"},{k:"c",t:"bottle"},{k:"d",t:"All of the above"},{k:"e",t:"None of the above"}],a:"d"},
      {q:"A syllabic consonant occurs in which word?",o:[{k:"a",t:"bottle"},{k:"b",t:"button"},{k:"c",t:"bottom"},{k:"d",t:"All of the above"},{k:"e",t:"None of the above"}],a:"d"},
      {q:"Which of these is a nasal consonant?",o:[{k:"a",t:"l"},{k:"b",t:"r"},{k:"c",t:"m"},{k:"d",t:"w"},{k:"e",t:"y"}],a:"c"},
    ],
    hard: [
      {q:"The sound /θ/ as in \"think\" is often substituted with /t/ or /f/ in Nigerian English. This is an example of ___.",o:[{k:"a",t:"Code-switching"},{k:"b",t:"Interference from L1 phonology"},{k:"c",t:"Hypercorrection"},{k:"d",t:"Elision"},{k:"e",t:"Assimilation"}],a:"b"},
      {q:"Which consonant is NOT present in most Nigerian languages but exists in English?",o:[{k:"a",t:"/p/"},{k:"b",t:"/θ/"},{k:"c",t:"/m/"},{k:"d",t:"/k/"},{k:"e",t:"/b/"}],a:"b"},
      {q:"The process where /n/ becomes /ŋ/ before /k/ (as in \"bank\") is called ___.",o:[{k:"a",t:"Elision"},{k:"b",t:"Assimilation"},{k:"c",t:"Dissimilation"},{k:"d",t:"Metathesis"},{k:"e",t:"Epenthesis"}],a:"b"},
      {q:"A retroflex consonant is produced with the tongue touching ___.",o:[{k:"a",t:"The upper teeth"},{k:"b",t:"The hard palate"},{k:"c",t:"The alveolar ridge"},{k:"d",t:"The soft palate"},{k:"e",t:"The uvula"}],a:"c"},
      {q:"In the word \"strengths,\" how many consonant sounds are there?",o:[{k:"a",t:"5"},{k:"b",t:"6"},{k:"c",t:"7"},{k:"d",t:"8"},{k:"e",t:"4"}],a:"c"},
    ],
  },
  stress: {
    easy: [
      {q:"In the word \"PHOtograph,\" which syllable is stressed?",o:[{k:"a",t:"pho-"},{k:"b",t:"-to-"},{k:"c",t:"-graph"},{k:"d",t:"None"},{k:"e",t:"All equally"}],a:"a"},
      {q:"Stress in English can change the ___.",o:[{k:"a",t:"Spelling"},{k:"b",t:"Meaning or grammatical function"},{k:"c",t:"Number of letters"},{k:"d",t:"Origin of the word"},{k:"e",t:"Vowel sounds only"}],a:"b"},
      {q:"Which word has the stress on the first syllable?",o:[{k:"a",t:"reCORD"},{k:"b",t:"PREsent"},{k:"c",t:"deCIDE"},{k:"d",t:"beGIN"},{k:"e",t:"aRRIVE"}],a:"b"},
      {q:"In compound nouns like \"BLACKboard,\" stress usually falls on ___.",o:[{k:"a",t:"The second element"},{k:"b",t:"The first element"},{k:"c",t:"Both equally"},{k:"d",t:"No stress"},{k:"e",t:"The last syllable"}],a:"b"},
      {q:"Primary stress is indicated in dictionaries by a ___.",o:[{k:"a",t:"comma"},{k:"b",t:"small dot or vertical line before the syllable"},{k:"c",t:"bold letter"},{k:"d",t:"capital letter"},{k:"e",t:"number"}],a:"b"},
    ],
    medium: [
      {q:"The noun \"perMIT\" and the verb \"PERmit\" are distinguished by ___.",o:[{k:"a",t:"Spelling"},{k:"b",t:"Stress placement"},{k:"c",t:"Vowel quality only"},{k:"d",t:"Consonant sounds"},{k:"e",t:"Pitch only"}],a:"b"},
      {q:"In the word \"unbelievable,\" the primary stress is on the syllable ___.",o:[{k:"a",t:"un-"},{k:"b",t:"-be-"},{k:"c",t:"-LIE-"},{k:"d",t:"-va-"},{k:"e",t:"-ble"}],a:"c"},
      {q:"Which word has stress on the third syllable?",o:[{k:"a",t:"understand"},{k:"b",t:"education"},{k:"c",t:"beautiful"},{k:"d",t:"wonderful"},{k:"e",t:"happiness"}],a:"b"},
      {q:"In phrasal verbs like \"put UP with,\" the stress typically falls on ___.",o:[{k:"a",t:"The verb"},{k:"b",t:"The particle"},{k:"c",t:"The preposition"},{k:"d",t:"All equally"},{k:"e",t:"No stress"}],a:"b"},
      {q:"The stress pattern of \"PHOtograph, phoTOgraphy, photoGRAphic\" demonstrates that ___.",o:[{k:"a",t:"Stress never changes"},{k:"b",t:"Stress can shift depending on suffixes"},{k:"c",t:"Suffixes have no effect"},{k:"d",t:"Only prefixes affect stress"},{k:"e",t:"Stress always moves forward"}],a:"b"},
    ],
    hard: [
      {q:"In the sentence \"I didn't say he stole the money,\" stressing different words changes the meaning. If you stress \"say,\" it implies ___.",o:[{k:"a",t:"Someone else said it"},{k:"b",t:"I didn't say it, but I might have implied it"},{k:"c",t:"He didn't steal it"},{k:"d",t:"The money wasn't stolen"},{k:"e",t:"I said someone else stole it"}],a:"b"},
      {q:"Which stress pattern is characteristic of French loanwords in English?",o:[{k:"a",t:"Stress on the first syllable"},{k:"b",t:"Stress on the final syllable"},{k:"c",t:"No stress"},{k:"d",t:"Equal stress on all syllables"},{k:"e",t:"Stress on the root only"}],a:"b"},
      {q:"In the word \"uncharacteristically,\" the primary stress falls on the syllable ___.",o:[{k:"a",t:"un-"},{k:"b",t:"-char-"},{k:"c",t:"-ac-"},{k:"d",t:"-ter-"},{k:"e",t:"-is-"}],a:"d"},
      {q:"The rhythm of English tends toward ___.",o:[{k:"a",t:"Syllable-timed rhythm"},{k:"b",t:"Stress-timed rhythm"},{k:"c",t:"Mora-timed rhythm"},{k:"d",t:"No rhythm"},{k:"e",t:"Vowel-timed rhythm"}],a:"b"},
      {q:"Nigerian English is often described as more syllable-timed than British English. This means ___.",o:[{k:"a",t:"Nigerians speak faster"},{k:"b",t:"Syllables tend to receive more equal stress and timing"},{k:"c",t:"Nigerians use fewer syllables"},{k:"d",t:"Stress is always on the first syllable"},{k:"e",t:"Consonants are stronger"}],a:"b"},
    ],
  },
  intonation: {
    easy: [
      {q:"Rising intonation at the end of a sentence usually indicates ___.",o:[{k:"a",t:"A statement"},{k:"b",t:"A command"},{k:"c",t:"A question"},{k:"d",t:"Anger"},{k:"e",t:"Happiness"}],a:"c"},
      {q:"Falling intonation is commonly used in ___.",o:[{k:"a",t:"Yes/no questions"},{k:"b",t:"Statements and commands"},{k:"c",t:"Lists (except the last item)"},{k:"d",t:"Expressions of doubt"},{k:"e",t:"Surprise"}],a:"b"},
      {q:"Which intonation pattern is typical for a tag question expecting agreement?",o:[{k:"a",t:"Rising-rising"},{k:"b",t:"Falling-rising"},{k:"c",t:"Falling-falling"},{k:"d",t:"Rising-falling"},{k:"e",t:"Level-level"}],a:"c"},
      {q:"Intonation refers to the ___.",o:[{k:"a",t:"Volume of speech"},{k:"b",t:"Rise and fall of pitch in speaking"},{k:"c",t:"Speed of speech"},{k:"d",t:"Clarity of consonants"},{k:"e",t:"Length of vowels"}],a:"b"},
      {q:"A speaker uses falling intonation when saying \"Really?\" after surprising news. This expresses ___.",o:[{k:"a",t:"A genuine question"},{k:"b",t:"Skepticism or disbelief"},{k:"c",t:"Boredom"},{k:"d",t:"Agreement"},{k:"e",t:"A command"}],a:"b"},
    ],
    medium: [
      {q:"In a list like \"I bought rice, beans, garri, and plantains,\" the intonation typically ___.",o:[{k:"a",t:"Falls on every item"},{k:"b",t:"Rises on each item except the last, which falls"},{k:"c",t:"Stays level throughout"},{k:"d",t:"Falls only on the first item"},{k:"e",t:"Rises only on the last item"}],a:"b"},
      {q:"Which sentence would likely have a rising-falling intonation pattern?",o:[{k:"a",t:"Are you coming?"},{k:"b",t:"What a beautiful day!"},{k:"c",t:"Close the door."},{k:"d",t:"Wait, what did you say?"},{k:"e",t:"Please sit down."}],a:"b"},
      {q:"In Nigerian Pidgin English, intonation often carries more grammatical meaning than in Standard English because ___.",o:[{k:"a",t:"It is a tonal language"},{k:"b",t:"It has fewer grammatical markers"},{k:"c",t:"It uses more words"},{k:"d",t:"It is slower"},{k:"e",t:"It is louder"}],a:"b"},
      {q:"\"You're coming, aren't you?\" with rising intonation on the tag suggests ___.",o:[{k:"a",t:"The speaker is certain"},{k:"b",t:"The speaker is genuinely unsure"},{k:"c",t:"The speaker is angry"},{k:"d",t:"The speaker is giving a command"},{k:"e",t:"The speaker is bored"}],a:"b"},
      {q:"A high-rising terminal (HRT) at the end of declarative sentences is a feature sometimes associated with ___.",o:[{k:"a",t:"Anger"},{k:"b",t:"Australian and some young urban accents globally"},{k:"c",t:"Whispering"},{k:"d",t:"Formal speeches"},{k:"e",t:"Religious chanting"}],a:"b"},
    ],
    hard: [
      {q:"The attitudinal function of intonation allows a speaker to express emotions. Saying \"Thank you\" with a low, narrow pitch range suggests ___.",o:[{k:"a",t:"Genuine gratitude"},{k:"b",t:"Sarcasm or lack of enthusiasm"},{k:"c",t:"Surprise"},{k:"d",t:"Fear"},{k:"e",t:"Excitement"}],a:"b"},
      {q:"In discourse intonation, the \"tonicity\" refers to ___.",o:[{k:"a",t:"The tone of voice"},{k:"b",t:"The placement of the nuclear tone (main stress) within an intonation unit"},{k:"c",t:"The speed of speech"},{k:"d",t:"The volume"},{k:"e",t:"The rhythm"}],a:"b"},
      {q:"Which of the following is a typical intonation pattern for a compound sentence with a contrastive conjunction?",o:[{k:"a",t:"Falling throughout"},{k:"b",t:"Rising before the conjunction, falling after"},{k:"c",t:"Falling before the conjunction, rising after"},{k:"d",t:"Level throughout"},{k:"e",t:"Random pitch changes"}],a:"b"},
      {q:"In the tone languages of Nigeria (Yoruba, Igbo, Hausa), the interaction between lexical tone and English intonation often results in ___.",o:[{k:"a",t:"Perfect British intonation"},{k:"b",t:"A distinctive Nigerian intonation pattern where pitch choices are influenced by L1 tone systems"},{k:"c",t:"No intonation at all"},{k:"d",t:"Monotone speech"},{k:"e",t:"Whispered speech"}],a:"b"},
      {q:"The \"comma intonation\" in English typically involves ___.",o:[{k:"a",t:"A fall in pitch"},{k:"b",t:"A slight rise or level pitch indicating more information follows"},{k:"c",t:"A loud volume"},{k:"d",t:"A pause without pitch change"},{k:"e",t:"A fall followed by a rise"}],a:"b"},
    ],
  },

  // WRITING
  essay_writing: {
    easy: [
      {q:"Which of these is NOT a type of essay?",o:[{k:"a",t:"Narrative"},{k:"b",t:"Descriptive"},{k:"c",t:"Argumentative"},{k:"d",t:"Circular"},{k:"e",t:"Expository"}],a:"d"},
      {q:"The introduction of an essay should ___.",o:[{k:"a",t:"List every point in detail"},{k:"b",t:"Introduce the topic and state the main argument"},{k:"c",t:"Give the conclusion"},{k:"d",t:"Be left blank"},{k:"e",t:"List references only"}],a:"b"},
      {q:"A good essay title should be ___.",o:[{k:"a",t:"Very long"},{k:"b",t:"Clear and relevant to the topic"},{k:"c",t:"Written in all caps"},{k:"d",t:"A question only"},{k:"e",t:"A famous quote"}],a:"b"},
      {q:"The body paragraphs of an essay should each ___.",o:[{k:"a",t:"Repeat the introduction"},{k:"b",t:"Focus on one main idea with supporting details"},{k:"c",t:"Be one sentence long"},{k:"d",t:"Introduce a new topic"},{k:"e",t:"Contain only questions"}],a:"b"},
      {q:"Which is essential for a strong argumentative essay?",o:[{k:"a",t:"Personal opinions only"},{k:"b",t:"Evidence and logical reasoning"},{k:"c",t:"Emotional language only"},{k:"d",t:"Short paragraphs"},{k:"e",t:"No conclusion"}],a:"b"},
    ],
    medium: [
      {q:"The thesis statement in an essay should appear ___.",o:[{k:"a",t:"Only in the conclusion"},{k:"b",t:"In the introduction, usually as the last sentence"},{k:"c",t:"Only in the body paragraphs"},{k:"d",t:"In the title"},{k:"e",t:"Nowhere"}],a:"b"},
      {q:"A topic sentence in a paragraph ___.",o:[{k:"a",t:"Appears only at the end"},{k:"b",t:"States the main idea of the paragraph"},{k:"c",t:"Is always a question"},{k:"d",t:"Is optional"},{k:"e",t:"Must be a quote"}],a:"b"},
      {q:"In essay writing, \"transitions\" are used to ___.",o:[{k:"a",t:"Decorate the essay"},{k:"b",t:"Connect ideas and paragraphs smoothly"},{k:"c",t:"Increase word count"},{k:"d",t:"Replace arguments"},{k:"e",t:"Confuse the reader"}],a:"b"},
      {q:"Which is a characteristic of a formal essay?",o:[{k:"a",t:"Use of slang and abbreviations"},{k:"b",t:"Objective tone and standard English"},{k:"c",t:"First-person narration throughout"},{k:"d",t:"Short, choppy sentences"},{k:"e",t:"No paragraphs"}],a:"b"},
      {q:"A counterargument in an argumentative essay ___.",o:[{k:"a",t:"Should be ignored"},{k:"b",t:"Strengthens the essay by addressing opposing views"},{k:"c",t:"Shows weakness"},{k:"d",t:"Is always wrong"},{k:"e",t:"Belongs in the introduction"}],a:"b"},
    ],
    hard: [
      {q:"In academic essay writing, the use of hedging language (e.g., \"may,\" \"could,\" \"it is possible that\") serves to ___.",o:[{k:"a",t:"Weaken the argument"},{k:"b",t:"Make claims more cautious and academically appropriate"},{k:"c",t:"Confuse the reader"},{k:"d",t:"Avoid taking a position"},{k:"e",t:"Fill word count"}],a:"b"},
      {q:"The rhetorical triangle (ethos, pathos, logos) in persuasive writing refers to ___.",o:[{k:"a",t:"Three types of essays"},{k:"b",t:"Appeals to credibility, emotion, and logic"},{k:"c",t:"Three paragraph structures"},{k:"d",t:"Three citation styles"},{k:"e",t:"Three essay lengths"}],a:"b"},
      {q:"In Nigerian secondary school essay competitions, judges often penalise essays that ___.",o:[{k:"a",t:"Use complex vocabulary"},{k:"b",t:"Lack clear organisation, coherence, and relevance to the topic"},{k:"c",t:"Are too long"},{k:"d",t:"Use Nigerian examples"},{k:"e",t:"Discuss social issues"}],a:"b"},
      {q:"A synthesis essay requires the writer to ___.",o:[{k:"a",t:"Copy from sources"},{k:"b",t:"Combine information from multiple sources to support a coherent argument"},{k:"c",t:"Use only one source"},{k:"d",t:"Avoid citations"},{k:"e",t:"Write about synthesis chemistry"}],a:"b"},
      {q:"\"Coherence\" in essay writing means that ___.",o:[{k:"a",t:"The essay has many words"},{k:"b",t:"The ideas are logically connected and flow smoothly"},{k:"c",t:"The essay is interesting"},{k:"d",t:"The essay is long"},{k:"e",t:"The essay uses big words"}],a:"b"},
    ],
  },
  letter_writing: {
    easy: [
      {q:"A formal letter to a government official should begin with:",o:[{k:"a",t:"Hi there,"},{k:"b",t:"Dear Sir/Madam,"},{k:"c",t:"Hey you,"},{k:"d",t:"What's up,"},{k:"e",t:"Yo,"}],a:"b"},
      {q:"The address in a formal letter is usually placed at the ___.",o:[{k:"a",t:"bottom"},{k:"b",t:"top right corner"},{k:"c",t:"middle"},{k:"d",t:"left margin only"},{k:"e",t:"back of the envelope"}],a:"b"},
      {q:"Which of these is a feature of an informal letter?",o:[{k:"a",t:"Strict format"},{k:"b",t:"Conversational tone and personal expressions"},{k:"c",t:"No greeting"},{k:"d",t:"Only official language"},{k:"e",t:"Must be typed"}],a:"b"},
      {q:"A letter of complaint should ___.",o:[{k:"a",t:"Use abusive language"},{k:"b",t:"State the problem clearly and request a solution politely"},{k:"c",t:"Be very short"},{k:"d",t:"Not mention the problem"},{k:"e",t:"Be written in Pidgin"}],a:"b"},
      {q:"The subscription \"Yours faithfully\" is used when you ___.",o:[{k:"a",t:"Know the recipient's name"},{k:"b",t:"Don't know the recipient's name"},{k:"c",t:"Are writing to a friend"},{k:"d",t:"Are sending an email"},{k:"e",t:"Are writing a postcard"}],a:"b"},
    ],
    medium: [
      {q:"In a formal letter, the subject heading should be ___.",o:[{k:"a",t:"Long and detailed"},{k:"b",t:"Brief and specific"},{k:"c",t:"Written as a question"},{k:"d",t:"Underlined in red"},{k:"e",t:"Omitted"}],a:"b"},
      {q:"A job application letter should include all EXCEPT:",o:[{k:"a",t:"Your qualifications"},{k:"b",t:"Why you are suitable for the job"},{k:"c",t:"Your favourite hobbies unrelated to the job"},{k:"d",t:"Contact details"},{k:"e",t:"Reference to the advertised position"}],a:"c"},
      {q:"The postscript (P.S.) in a letter is placed ___.",o:[{k:"a",t:"At the top"},{k:"b",t:"After the signature"},{k:"c",t:"In the middle"},{k:"d",t:"Before the address"},{k:"e",t:"On the envelope"}],a:"b"},
      {q:"Which salutation is most appropriate for a letter to the Principal of {{SCHOOL}}?",o:[{k:"a",t:"Dear Bro,"},{k:"b",t:"The Principal, {{SCHOOL}}, {{PLACE}}"},{k:"c",t:"Hi Principal,"},{k:"d",t:"Yo Principal,"},{k:"e",t:"Hey Sir,"}],a:"b"},
      {q:"A circular letter is written to ___.",o:[{k:"a",t:"One person only"},{k:"b",t:"A group of people to convey the same information"},{k:"c",t:"The government"},{k:"d",t:"A newspaper"},{k:"e",t:"A bank"}],a:"b"},
    ],
    hard: [
      {q:"In formal correspondence, \"block format\" means that ___.",o:[{k:"a",t:"The letter is handwritten"},{k:"b",t:"All paragraphs are aligned to the left margin with no indentation"},{k:"c",t:"The letter is written in capital letters"},{k:"d",t:"Only bullet points are used"},{k:"e",t:"The letter is very short"}],a:"b"},
      {q:"A letter to the editor of a newspaper should ___.",o:[{k:"a",t:"Be anonymous"},{k:"b",t:"Be concise, relevant, and include the writer's contact details"},{k:"c",t:"Be as long as possible"},{k:"d",t:"Use only Pidgin English"},{k:"e",t:"Not have a subject"}],a:"b"},
      {q:"The difference between \"Yours sincerely\" and \"Yours faithfully\" depends on ___.",o:[{k:"a",t:"The length of the letter"},{k:"b",t:"Whether you used the recipient's name (sincerely) or a generic title (faithfully)"},{k:"c",t:"The topic of the letter"},{k:"d",t:"The sender's gender"},{k:"e",t:"The country"}],a:"b"},
      {q:"In a business letter, \"Enclosure\" or \"Enc.\" at the bottom indicates ___.",o:[{k:"a",t:"The letter is sealed"},{k:"b",t:"Additional documents are attached"},{k:"c",t:"The letter is private"},{k:"d",t:"The letter is urgent"},{k:"e",t:"The letter was copied"}],a:"b"},
      {q:"A memo (memorandum) differs from a formal letter in that it ___.",o:[{k:"a",t:"Is longer"},{k:"b",t:"Is used for internal communication within an organisation and doesn't need a formal salutation or subscription"},{k:"c",t:"Is always handwritten"},{k:"d",t:"Requires a stamp"},{k:"e",t:"Must be notarised"}],a:"b"},
    ],
  },
  narrative_writing: {
    easy: [
      {q:"In a narrative essay, the sequence of events should be:",o:[{k:"a",t:"Random"},{k:"b",t:"Logical and chronological"},{k:"c",t:"Alphabetical"},{k:"d",t:"By length"},{k:"e",t:"By colour"}],a:"b"},
      {q:"The \"plot\" of a story refers to ___.",o:[{k:"a",t:"The setting"},{k:"b",t:"The sequence of events that make up the story"},{k:"c",t:"The characters' names"},{k:"d",t:"The moral lesson"},{k:"e",t:"The title"}],a:"b"},
      {q:"A good narrative should have a clear ___.",o:[{k:"a",t:"List of ingredients"},{k:"b",t:"Beginning, middle, and end"},{k:"c",t:"Table of contents"},{k:"d",t:"Index"},{k:"e",t:"Bibliography"}],a:"b"},
      {q:"\"Show, don't tell\" in narrative writing means ___.",o:[{k:"a",t:"Write everything in dialogue"},{k:"b",t:"Use descriptive details and actions rather than just stating facts"},{k:"c",t:"Use pictures"},{k:"d",t:"Write only what you see"},{k:"e",t:"Avoid descriptions"}],a:"b"},
      {q:"The \"climax\" of a story is the point where ___.",o:[{k:"a",t:"The story begins"},{k:"b",t:"The tension or conflict reaches its peak"},{k:"c",t:"The characters are introduced"},{k:"d",t:"The setting is described"},{k:"e",t:"The author writes the title"}],a:"b"},
    ],
    medium: [
      {q:"A flashback in a narrative is used to ___.",o:[{k:"a",t:"Confuse the reader"},{k:"b",t:"Provide background information by going back in time"},{k:"c",t:"End the story"},{k:"d",t:"Introduce a new character"},{k:"e",t:"Skip boring parts"}],a:"b"},
      {q:"The \"point of view\" in a narrative refers to ___.",o:[{k:"a",t:"The author's opinion"},{k:"b",t:"The perspective from which the story is told"},{k:"c",t:"The setting"},{k:"d",t:"The moral"},{k:"e",t:"The title"}],a:"b"},
      {q:"\"Foreshadowing\" in a narrative is a technique where ___.",o:[{k:"a",t:"The author goes back in time"},{k:"b",t:"The author gives hints about what will happen later"},{k:"c",t:"The story ends suddenly"},{k:"d",t:"Two stories are told together"},{k:"e",t:"The setting changes"}],a:"b"},
      {q:"A frame narrative is one in which ___.",o:[{k:"a",t:"The story is written on paper"},{k:"b",t:"A story is told within another story"},{k:"c",t:"The story has no ending"},{k:"d",t:"Only one character speaks"},{k:"e",t:"The story is very short"}],a:"b"},
      {q:"In first-person narration, the narrator ___.",o:[{k:"a",t:"Is all-knowing"},{k:"b",t:'Is a character in the story using "I"'},{k:"c",t:"Never makes mistakes"},{k:"d",t:"Knows everything about all characters"},{k:"e",t:"Is the author"}],a:"b"},
    ],
    hard: [
      {q:"\"Unreliable narration\" occurs when ___.",o:[{k:"a",t:"The narrator tells the truth"},{k:"b",t:"The narrator's credibility is compromised by bias, ignorance, or dishonesty"},{k:"c",t:"The story is too long"},{k:"d",t:"The story has no plot"},{k:"e",t:"The narrator is a child"}],a:"b"},
      {q:"The \"in media res\" technique means starting a story ___.",o:[{k:"a",t:"At the very beginning"},{k:"b",t:"In the middle of the action"},{k:"c",t:"At the end"},{k:"d",t:"With a description"},{k:"e",t:"With a dialogue"}],a:"b"},
      {q:"A stream of consciousness narrative attempts to ___.",o:[{k:"a",t:"Tell a logical story"},{k:"b",t:"Reproduce the continuous flow of a character's thoughts and feelings"},{k:"c",t:"Describe the setting"},{k:"d",t:"Teach a lesson"},{k:"e",t:"List events chronologically"}],a:"b"},
      {q:"In Nigerian oral storytelling traditions, the griot (storyteller) often uses call-and-response. This technique serves to ___.",o:[{k:"a",t:"Confuse the audience"},{k:"b",t:"Engage the audience and create communal participation"},{k:"c",t:"Shorten the story"},{k:"d",t:"Hide the moral"},{k:"e",t:"Avoid descriptions"}],a:"b"},
      {q:"\"Chekhov's gun\" is a narrative principle stating that ___.",o:[{k:"a",t:"Every story needs a weapon"},{k:"b",t:"Every element in a story must be necessary; irrelevant elements should be removed"},{k:"c",t:"Stories should be violent"},{k:"d",t:"Guns are important props"},{k:"e",t:"Stories need suspense"}],a:"b"},
    ],
  },
  descriptive_writing: {
    easy: [
      {q:"Which element is essential in descriptive writing?",o:[{k:"a",t:"Mathematical formulas"},{k:"b",t:"Vivid sensory details"},{k:"c",t:"Legal arguments"},{k:"d",t:"Chemical equations"},{k:"e",t:"Phone numbers"}],a:"b"},
      {q:"Descriptive writing should appeal to the ___.",o:[{k:"a",t:"reader's senses (sight, sound, smell, touch, taste)"},{k:"b",t:"reader's calculator"},{k:"c",t:"reader's dictionary only"},{k:"d",t:"reader's fears"},{k:"e",t:"reader's wallet"}],a:"a"},
      {q:"A simile compares two things using ___.",o:[{k:"a",t:"is"},{k:"b",t:"like or as"},{k:"c",t:"was"},{k:"d",t:"and"},{k:"e",t:"but"}],a:"b"},
      {q:"\"The sun was a golden coin in the sky\" is an example of ___.",o:[{k:"a",t:"Simile"},{k:"b",t:"Metaphor"},{k:"c",t:"Personification"},{k:"d",t:"Alliteration"},{k:"e",t:"Onomatopoeia"}],a:"b"},
      {q:"Which is a feature of good descriptive writing?",o:[{k:"a",t:"Using vague words"},{k:"b",t:"Using specific, concrete details"},{k:"c",t:"Listing facts only"},{k:"d",t:"Avoiding adjectives"},{k:"e",t:"Writing very short sentences"}],a:"b"},
    ],
    medium: [
      {q:"Personification gives human qualities to ___.",o:[{k:"a",t:"animals only"},{k:"b",t:"non-human things"},{k:"c",t:"people"},{k:"d",t:"numbers"},{k:"e",t:"verbs"}],a:"b"},
      {q:"The \"dominant impression\" in a descriptive essay is ___.",o:[{k:"a",t:"The longest paragraph"},{k:"b",t:"The overall mood or feeling the writer wants to convey"},{k:"c",t:"The first sentence"},{k:"d",t:"The title"},{k:"e",t:"The last word"}],a:"b"},
      {q:"Which technique uses words whose sounds suggest their meanings?",o:[{k:"a",t:"Simile"},{k:"b",t:"Metaphor"},{k:"c",t:"Onomatopoeia"},{k:"d",t:"Alliteration"},{k:"e",t:"Hyperbole"}],a:"c"},
      {q:"Alliteration is the repetition of ___.",o:[{k:"a",t:"vowel sounds"},{k:"b",t:"consonant sounds at the beginning of words"},{k:"c",t:"whole words"},{k:"d",t:"sentences"},{k:"e",t:"paragraphs"}],a:"b"},
      {q:"Hyperbole is a figure of speech that ___.",o:[{k:"a",t:"understates something"},{k:"b",t:"exaggerates for emphasis or effect"},{k:"c",t:"compares using \"like\""},{k:"d",t:"gives human traits to objects"},{k:"e",t:"repeats sounds"}],a:"b"},
    ],
    hard: [
      {q:"A pathetic fallacy is when ___.",o:[{k:"a",t:"A character cries"},{k:"b",t:"Nature reflects the emotions of the characters (e.g., rain during sadness)"},{k:"c",t:"Animals speak"},{k:"d",t:"The weather is described"},{k:"e",t:"The setting is indoors"}],a:"b"},
      {q:"Synaesthesia in descriptive writing involves ___.",o:[{k:"a",t:"Describing only visual details"},{k:"b",t:"Blending sensory descriptions (e.g., \"a loud colour\")"},{k:"c",t:"Writing about dreams"},{k:"d",t:"Using medical terms"},{k:"e",t:"Describing food only"}],a:"b"},
      {q:"The difference between a metaphor and a simile is that ___.",o:[{k:"a",t:"A metaphor is longer"},{k:"b",t:"A simile uses \"like\" or \"as\" while a metaphor directly states the comparison"},{k:"c",t:"A metaphor is always about nature"},{k:"d",t:"A simile is always funny"},{k:"e",t:"There is no difference"}],a:"b"},
      {q:"\"Purple prose\" refers to writing that is ___.",o:[{k:"a",t:"Short and simple"},{k:"b",t:"Overly ornate, elaborate, or flowery"},{k:"c",t:"About royalty"},{k:"d",t:"Scientific"},{k:"e",t:"Written in purple ink"}],a:"b"},
      {q:"In descriptive writing, \"showing\" rather than \"telling\" often requires the use of ___.",o:[{k:"a",t:"Abstract nouns"},{k:"b",t:"Concrete nouns, sensory details, and active verbs"},{k:"c",t:"Long sentences only"},{k:"d",t:"Technical vocabulary"},{k:"e",t:"Passive voice"}],a:"b"},
    ],
  },
};

// Ensure all topics have banks
for (const cat of CATEGORIES) {
  for (const topic of TOPIC_NAMES[cat]) {
    if (!BANKS[topic]) {
      console.warn(`Missing bank for topic: ${topic}`);
    }
  }
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const subjects = mongoose.connection.db.collection("subjects");
    const topics = mongoose.connection.db.collection("topics");
    const topicInstances = mongoose.connection.db.collection("topicinstances");
    const assessmentQuestions = mongoose.connection.db.collection("assessmentquestions");

    const english = await subjects.findOne({ name: "english" });
    if (!english) {
      console.error("English subject not found");
      process.exit(1);
    }
    const subjectId = english._id;

    // Build topic map
    const topicMap = new Map();
    for (const category of CATEGORIES) {
      const names = TOPIC_NAMES[category];
      for (let i = 0; i < names.length; i++) {
        const name = names[i];
        let topic = await topics.findOne({ name, subject: subjectId });
        if (!topic) {
          const result = await topics.insertOne({
            name,
            slug: name,
            subject: subjectId,
            category,
            description: `${name.replace(/_/g, " ")} for English Language`,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          topic = { _id: result.insertedId, name, category };
          console.log(`Created topic: ${name} (${category})`);
        }
        topicMap.set(`${category}_${i}`, topic._id);
      }
    }

    let globalCounter = 1;
    const docs = [];

    for (const klass of CLASSES) {
      console.log(`Generating questions for ${klass.toUpperCase()}...`);
      for (const category of CATEGORIES) {
        const names = TOPIC_NAMES[category];
        for (let ti = 0; ti < names.length; ti++) {
          const topicName = names[ti];
          const topicId = topicMap.get(`${category}_${ti}`);

          let instance = await topicInstances.findOne({ topic: topicId, subject: subjectId, class: klass });
          if (!instance) {
            const result = await topicInstances.insertOne({
              topic: topicId,
              subject: subjectId,
              class: klass,
              difficultyLevel: "mixed",
              order: ti + 1,
              isCore: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            instance = { _id: result.insertedId };
          }

          const bank = BANKS[topicName];
          if (!bank) {
            console.warn(`No question bank for ${topicName}, skipping...`);
            continue;
          }

          for (const difficulty of ["easy", "medium", "hard"]) {
            const questions = bank[difficulty];
            if (!questions || questions.length < 5) {
              console.warn(`Not enough ${difficulty} questions for ${topicName} (${klass})`);
              continue;
            }
            for (let q = 0; q < 5; q++) {
              const base = questions[q];
              const vars = {
                NAME: pick(NAMES),
                PLACE: pick(PLACES),
                SCHOOL: pick(SCHOOLS),
              };
              const generated = makeQuestion(base, vars);
              const qNum = `${klass.toUpperCase()}-${topicName.substring(0, 3).toUpperCase()}-${difficulty.substring(0, 1).toUpperCase()}${String(q + 1).padStart(2, "0")}-${String(globalCounter).padStart(4, "0")}`;
              docs.push({
                questionNumber: qNum,
                subject: subjectId,
                class: klass,
                topicInstanceId: instance._id,
                category,
                question: generated.question,
                options: generated.options,
                answer: generated.answer,
                difficulty,
                explanation: `${generated.question} — Correct answer is ${generated.answer.toUpperCase()}.`,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
              globalCounter++;
            }
          }
        }
      }
    }

    console.log(`Total questions to insert: ${docs.length}`);
    if (docs.length === 0) {
      console.log("No questions to insert.");
      process.exit(0);
    }

    // Insert in batches of 500
    const BATCH_SIZE = 500;
    for (let i = 0; i < docs.length; i += BATCH_SIZE) {
      const batch = docs.slice(i, i + BATCH_SIZE);
      await assessmentQuestions.insertMany(batch, { ordered: false });
      console.log(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(docs.length / BATCH_SIZE)} (${batch.length} docs)`);
    }

    console.log("Seeding complete!");
    console.log(`Inserted ${docs.length} questions across ${CLASSES.length} classes.`);
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
