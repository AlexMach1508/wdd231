const courses = [
  {
    subject: 'CSE',
    number: 110,
    title: 'Introduction to Programming',
    credits: 2,
    certificate: 'Web and Computer Programming',
    description: 'This course will introduce students to programming...',
    technology: ['Python'],
    completed: false
  },
  {
    subject: 'WDD',
    number: 130,
    title: 'Web Fundamentals',
    credits: 2,
    certificate: 'Web and Computer Programming',
    description: 'This course introduces students to the World Wide Web...',
    technology: ['HTML', 'CSS'],
    completed: true
  },
  {
    subject: 'CSE',
    number: 111,
    title: 'Programming with Functions',
    credits: 2,
    certificate: 'Web and Computer Programming',
    description: 'Students become more organized, efficient, and powerful...',
    technology: ['Python'],
    completed: false
  },
  {
    subject: 'CSE',
    number: 210,
    title: 'Programming with Classes',
    credits: 2,
    certificate: 'Web and Computer Programming',
    description: 'This course introduces the notion of classes and objects...',
    technology: ['C#'],
    completed: false
  },
  {
    subject: 'WDD',
    number: 131,
    title: 'Dynamic Web Fundamentals',
    credits: 2,
    certificate: 'Web and Computer Programming',
    description: 'Students will learn to create dynamic websites using JS...',
    technology: ['HTML', 'CSS', 'JavaScript'],
    completed: true
  },
  {
    subject: 'WDD',
    number: 231,
    title: 'Frontend Web Development I',
    credits: 2,
    certificate: 'Web and Computer Programming',
    description: 'Students focus on user experience, accessibility...',
    technology: ['HTML', 'CSS', 'JavaScript'],
    completed: false
  }
];

const container = document.getElementById('course-container');
const creditOutput = document.getElementById('credit-count');

function renderCourses(courseList) {
  container.innerHTML = '';
  let totalCredits = 0;

  courseList.forEach(course => {
    const card = document.createElement('div');
    card.classList.add('course-card');
    if (course.completed) card.classList.add('completed');

    card.innerHTML = `
      <h3>${course.subject} ${course.number}</h3>
      <p><strong>${course.title}</strong></p>
      <p>${course.description}</p>
      <p><strong>Credits:</strong> ${course.credits}</p>
      <p><strong>Technologies:</strong> ${course.technology.join(', ')}</p>
    `;

    container.appendChild(card);
    totalCredits += course.credits;
  });

  creditOutput.textContent = totalCredits;
}

// Filters
document.getElementById('allBtn').addEventListener('click', () => {
  renderCourses(courses);
});

document.getElementById('wddBtn').addEventListener('click', () => {
  const filtered = courses.filter(c => c.subject === 'WDD');
  renderCourses(filtered);
});

document.getElementById('cseBtn').addEventListener('click', () => {
  const filtered = courses.filter(c => c.subject === 'CSE');
  renderCourses(filtered);
});

// Initial render
renderCourses(courses);
