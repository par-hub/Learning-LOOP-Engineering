const form = document.querySelector('#topicForm');
const topicInput = document.querySelector('#topic');
const runButton = document.querySelector('#runButton');
const statusBox = document.querySelector('#status');
const results = document.querySelector('#results');
const timeline = document.querySelector('#timeline');
const summaryBadge = document.querySelector('#summaryBadge');
const finalAnswer = document.querySelector('#finalAnswer');
const finalDecision = document.querySelector('#finalDecision');

const agentNames = { writer: 'Writer · first draft', reviewer: 'Reviewer · quality check', reviser: 'Reviser · improved draft' };

function showStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.classList.toggle('error', isError);
  statusBox.classList.remove('hidden');
}

function addEvent(event, index) {
  const card = document.createElement('article');
  card.className = 'event-card';
  const meta = document.createElement('div');
  meta.className = 'event-meta';
  const label = document.createElement('span');
  label.className = 'agent-label';
  label.textContent = agentNames[event.agent] || event.agent;
  const count = document.createElement('span');
  count.className = 'event-count';
  count.textContent = `Step ${index + 1}`;
  meta.append(label, count);
  card.append(meta);

  const text = event.agent === 'reviewer'
    ? (event.decision === 'PASS' ? 'The answer meets the review criteria.' : 'The draft needs another pass.')
    : event.draft;
  if (text) {
    const copy = document.createElement('p');
    copy.className = 'event-copy';
    copy.textContent = text;
    card.append(copy);
  }
  if (event.agent === 'reviewer' && event.feedback) {
    const feedback = document.createElement('p');
    feedback.className = 'feedback';
    const title = document.createElement('strong');
    title.textContent = 'Feedback: ';
    feedback.append(title, document.createTextNode(event.feedback));
    card.append(feedback);
  }
  timeline.append(card);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const topic = topicInput.value.trim();
  if (topic.length < 2) {
    topicInput.focus();
    showStatus('Please enter a topic with at least 2 characters.', true);
    return;
  }

  runButton.disabled = true;
  runButton.querySelector('.button-label').textContent = 'Agents are working…';
  statusBox.classList.add('hidden');
  results.classList.add('hidden');
  timeline.replaceChildren();
  showStatus('The writer is preparing a draft, then the reviewer will check it.');

  try {
    const response = await fetch('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ topic }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'The agent run failed. Please try again.');

    (data.events || []).forEach(addEvent);
    finalAnswer.textContent = data.final_answer || 'No answer was returned.';
    const passed = data.final_decision === 'PASS';
    finalDecision.textContent = passed ? '✓ Reviewed' : 'Review limit reached';
    finalDecision.classList.toggle('revise', !passed);
    summaryBadge.textContent = `${data.revision_count ?? 0} ${(data.revision_count ?? 0) === 1 ? 'revision' : 'revisions'} · ${data.model || 'AI model'}`;
    results.classList.remove('hidden');
    statusBox.classList.add('hidden');
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    showStatus(error.message || 'Could not connect to the server. Check that the app is running and try again.', true);
  } finally {
    runButton.disabled = false;
    runButton.querySelector('.button-label').textContent = 'Run agent loop';
  }
});
