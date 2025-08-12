// pages/thanks.js (ES module)
const summary = document.getElementById('summary');

function row(label, value) {
  return `<dt>${label}</dt><dd>${value || '-'}</dd>`;
}

function init() {
  const sp = new URLSearchParams(window.location.search);
  const data = {
    first: sp.get('first'),
    last: sp.get('last'),
    email: sp.get('email'),
    mobile: sp.get('mobile'),
    organization: sp.get('organization'),
    timestamp: sp.get('timestamp')
  };

  summary.innerHTML = `
    ${row('First Name', data.first)}
    ${row('Last Name', data.last)}
    ${row('Email', data.email)}
    ${row('Mobile', data.mobile)}
    ${row('Organization', data.organization)}
    ${row('Submitted At', data.timestamp)}
  `;
}

init();
