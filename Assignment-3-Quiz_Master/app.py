from flask import Flask, render
_
template, request, session, redirect, url
_
import random
for
app = Flask(__
name
__)
app.secret
_
key =
'quizmaster
secret
_
_
key_
2024'
QUESTIONS = [
{
"id": 1,
"quesOon": "Which language is used for web scripOng on the client side?"
,
"opOons": ["Python"
,
"Java"
,
"JavaScript"
,
"C++"],
"answer": "JavaScript"
},
{
"id": 2,
"quesOon": "What does HTML stand for?"
,
"opOons": [
"Hyper Text Markup Language"
,
"High Tech Modern Language"
,
"Hyper Transfer Markup Language"
,
"Home Tool Markup Language"
],
"answer": "Hyper Text Markup Language"
},
{
"id": 3,
"quesOon": "Which Python framework is used to build web applicaOons?"
,
"opOons": ["Django only"
,
"Flask only"
,
"Both Flask and Django"
,
"Neither"],
"answer": "Both Flask and Django"
},
{
"id": 4,
"quesOon": "What does CSS stand for?"
,
"opOons": [
"Computer Style Sheets"
,
"Cascading Style Sheets"
,
"CreaOve Style Sheets"
,
"Colorful Style Sheets"
],
"answer": "Cascading Style Sheets"
},
{
"id": 5,
"quesOon": "Which HTTP method is used to submit a form?"
,
"opOons": ["GET"
"POST"
"PUT"
,
,
,
"DELETE"],
"answer": "POST"
},
{
"id": 6,
"quesOon": "What is the correct file extension for Python files?"
,
"opOons": ["
.pt"
,
"
.pyt"
,
"
.py"
"
,
.python"],
"answer": "
.py"
},
{
},
{
"id": 7,
"quesOon": "Which tag is used to create a hyperlink in HTML?"
,
"opOons": ["<link>"
"<href>"
"<a>"
,
,
,
"<url>"],
"answer": "<a>"
"id": 8,
"quesOon": "In Flask, which decorator is used to define a route?"
,
"opOons": ["@app.url()"
,
"@app.route()"
,
"@app.path()"
,
"@app.view()"],
"answer": "@app.route()"
},
{
"id": 9,
"quesOon": "What does JSON stand for?"
,
"opOons": [
"JavaScript Object NotaOon"
,
"Java Scripted Object Names"
,
"JavaScript Output Node"
,
"Java Simple Object NotaOon"
],
"answer": "JavaScript Object NotaOon"
},
{
"id": 10,
"quesOon": "Which of the following is NOT a valid CSS property?"
,
"opOons": ["color"
"font-size"
,
,
"text-weight"
,
"margin"],
"answer": "text-weight"
}
]
def get
_
feedback(score, total):
percentage = (score / total) * 100
if percentage == 100:
return "
🏆 Perfect Score! Outstanding!"
,
"perfect"
elif percentage >= 80:
return "
🌟 Excellent! Great job!"
,
"excellent"
elif percentage >= 60:
return "
👍 Good work! Keep it up!"
,
"good"
elif percentage >= 40:
return "
📚 Fair ahempt. More pracOce needed.
"
,
else:
return "
💪 Don't give up! Try again!"
,
"poor"
"fair"
@app.route('/')
def index():
return render
_
template('index.html')
@app.route('/start')
def start():
quesOons = QUESTIONS.copy()
random.shuﬄe(quesOons)
session['quesOons'] = quesOons
session['current'] = 0
session['score'] = 0
session['answers'] = []
session['negaOve'] = request.args.get('negaOve'
,
'false') ==
session['Ome
_
limit'] = int(request.args.get('Ome'
, 30))
return redirect(url
_
for('quiz'))
'true'
@app.route('/quiz'
, methods=['GET'
,
def quiz():
if 'quesOons' not in session:
return redirect(url
_
for('index'))
'POST'])
quesOons = session['quesOons']
current = session['current']
if request.method ==
'POST':
selected = request.form.get('answer')
correct
_
answer = quesOons[current]['answer']
answers = session.get('answers'
, [])
if selected == correct
answer:
_
session['score'] = session.get('score'
, 0) + 1
answers.append({'selected': selected,
else:
'correct': True})
if session.get('negaOve'):
session['score'] = session.get('score'
, 0) - 0.25
answers.append({'selected': selected,
'correct': False,
session['answers'] = answers
session['current'] = current + 1
current = session['current']
if current >= len(quesOons):
return redirect(url
_
for('result'))
return redirect(url
_
for('quiz'))
if current >= len(quesOons):
return redirect(url
_
for('result'))
q = quesOons[current]
opOons = q['opOons'].copy()
random.shuﬄe(opOons)
return render
_
template(
'quiz.html'
,
quesOon=q,
opOons=opOons,
current=current + 1,
total=len(quesOons),
Ome
_
limit=session.get('Ome
limit'
_
, 30),
negaOve=session.get('negaOve'
, False)
)
@app.route('/result')
def result():
if'quesOons'notinsession:
returnredirect(url
_
for('index'))
score=session.get('score'
, 0)
total=len(session.get('quesOons'
, []))
answers=session.get('answers'
, [])
quesOons=session.get('quesOons'
, [])
feedback,level=get
_
feedback(max(score, 0), total)
result
_
data = []
fori,qinenumerate(quesOons):
ans=answers[i]ifi<len(answers) else {}
result
_
data.append({
'quesOon':q['quesOon'],
'selected':ans.get('selected'
,
'correct
_
ans':q['answer'],
'is
_
correct':ans.get('correct'
, False)
'Not answered'),
})
return render
_
'result.html'
,
template(
score=score,
total=total,
feedback=feedback,
level=level,
result
data=result
data
_
_
)
@app.route('/restart')
def restart():
session.clear()
return redirect(url
_
for('index'))
if
'
name
==
main
__
__
__
__
app.run(debug=True)
':
