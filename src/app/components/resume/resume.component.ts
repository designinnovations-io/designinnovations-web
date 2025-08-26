import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-resume',
  templateUrl: './resume.component.html',
  styleUrls: ['./resume.component.css']
})
export class ResumeComponent implements OnInit {
  
  // Personal Information
  personalInfo = {
    name: 'Alex Johnson',
    title: 'Full Stack Developer & Creative Problem Solver',
    email: 'alex.johnson@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    website: 'www.alexjohnson.dev',
    linkedin: 'linkedin.com/in/alexjohnson',
    github: 'github.com/alexjohnson'
  };

  // Skills with proficiency levels
  skills = [
    { name: 'JavaScript/TypeScript', level: 95, category: 'Frontend' },
    { name: 'Angular/React', level: 90, category: 'Frontend' },
    { name: 'Node.js', level: 85, category: 'Backend' },
    { name: 'Python', level: 80, category: 'Backend' },
    { name: 'AWS/Cloud', level: 75, category: 'DevOps' },
    { name: 'Docker/Kubernetes', level: 70, category: 'DevOps' },
    { name: 'UI/UX Design', level: 85, category: 'Design' },
    { name: 'MongoDB/PostgreSQL', level: 80, category: 'Database' }
  ];

  // Work Experience
  experience = [
    {
      company: 'TechCorp Solutions',
      position: 'Senior Full Stack Developer',
      duration: '2022 - Present',
      location: 'San Francisco, CA',
      achievements: [
        'Led development of microservices architecture serving 1M+ users',
        'Reduced application load time by 40% through optimization',
        'Mentored 5 junior developers and established coding standards',
        'Implemented CI/CD pipelines reducing deployment time by 60%'
      ]
    },
    {
      company: 'StartupXYZ',
      position: 'Frontend Developer',
      duration: '2020 - 2022',
      location: 'Remote',
      achievements: [
        'Built responsive web applications using Angular and React',
        'Collaborated with design team to implement pixel-perfect UIs',
        'Increased user engagement by 35% through UX improvements',
        'Developed reusable component library used across 3 products'
      ]
    },
    {
      company: 'Digital Agency Pro',
      position: 'Junior Developer',
      duration: '2019 - 2020',
      location: 'Los Angeles, CA',
      achievements: [
        'Developed custom WordPress themes and plugins',
        'Maintained and optimized client websites',
        'Learned modern JavaScript frameworks and best practices',
        'Contributed to 15+ successful client projects'
      ]
    }
  ];

  // Education
  education = [
    {
      degree: 'Bachelor of Science in Computer Science',
      school: 'University of California, Berkeley',
      year: '2019',
      gpa: '3.8/4.0'
    }
  ];

  // Projects
  projects = [
    {
      name: 'EcoTracker App',
      description: 'A mobile-first web application for tracking personal carbon footprint',
      technologies: ['Angular', 'Node.js', 'MongoDB', 'Chart.js'],
      link: 'https://github.com/alexjohnson/ecotracker',
      highlights: ['10k+ active users', 'Featured in TechCrunch']
    },
    {
      name: 'AI Code Assistant',
      description: 'VS Code extension that provides intelligent code suggestions',
      technologies: ['TypeScript', 'OpenAI API', 'VS Code API'],
      link: 'https://marketplace.visualstudio.com/items?itemName=alex.ai-assistant',
      highlights: ['50k+ downloads', 'Open source']
    },
    {
      name: 'Real-time Chat Platform',
      description: 'Scalable chat application with video calling capabilities',
      technologies: ['React', 'Socket.io', 'WebRTC', 'Redis'],
      link: 'https://github.com/alexjohnson/chatplatform',
      highlights: ['Real-time messaging', 'Video calls', 'File sharing']
    }
  ];

  // Animation states
  isVisible = false;
  activeSection = 'about';

  constructor() { }

  ngOnInit(): void {
    // Trigger animations after component loads
    setTimeout(() => {
      this.isVisible = true;
    }, 100);

    // Handle scroll animations
    this.handleScrollAnimations();
  }

  // Handle scroll-based animations
  handleScrollAnimations(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          this.activeSection = entry.target.id;
        }
      });
    }, { threshold: 0.1 });

    // Observe all sections after a short delay to ensure DOM is ready
    setTimeout(() => {
      const sections = document.querySelectorAll('.section');
      sections.forEach(section => observer.observe(section));
    }, 200);
  }

  // Smooth scroll to section
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Download resume (mock function)
  downloadResume(): void {
    // In a real app, this would trigger a PDF download
    alert('Resume download would start here!');
  }

  // Get skill category color
  getSkillCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'Frontend': '#3b82f6',
      'Backend': '#10b981',
      'DevOps': '#f59e0b',
      'Design': '#8b5cf6',
      'Database': '#ef4444'
    };
    return colors[category] || '#6b7280';
  }
}