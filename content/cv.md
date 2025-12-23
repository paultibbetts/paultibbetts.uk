+++
title = "CV"
type = "resume"

[resume]
  website = "https://paultibbetts.uk"
  photo   = "/icon.png"

  region  = "North Wales"
  country = "UK"
  email   = "hire@paultibbetts.uk"

  summary = [
    "Senior software engineer with experience spanning full-stack web development, cloud infrastructure, and operational tooling.",
    "I have spent my career developing and operating long-lived production systems, moving comfortably between application code, delivery pipelines, and platform concerns while supporting teams shipping real products at scale.",
  ]

  [[resume.profile]]
    label = "Website"
    url   = "https://paultibbetts.uk"
    rel   = "me"

  [[resume.profile]]
    label = "GitHub"
    url   = "https://github.com/paultibbetts"
    rel   = "me"

  [[resume.profile]]
    label = "LinkedIn"
    url   = "https://linkedin.com/in/your-handle"
    rel   = "me"

  [[resume.skills]]
    name = "Programming"
    items = [
      "Go",
      "Python - FastAPI, Flask",
      "JavaScript, TypeScript - Vue.js, React",
      "PHP - Laravel"
    ]

  [[resume.skills]]
    name = "Cloud & Infrastructure"
    items = [
      "Kubernetes ecosystem: Kubernetes, K3s, Helm, Talos",
      "Cloud-native application design principles",
      "Infrastructure as code (IaC): Terraform, Ansible",
      "Cloud platforms: AWS, Linode, DigitalOcean",
      "Linux server administration",
      "Ingress & traffic management: Traefik, ingress-nginx (RIP), Caddy, Nginx, Apache",
      "Virtualisation: Proxmox, KVM/QEMU, LXC",
      "Networking fundamentals"
    ]

  [[resume.skills]]
    name = "Observability"
    items = [
      "Instrumentation: OpenTelemetry (manual + auto)",
      "Logs, Metrics and Traces: Loki, Prometheus, Tempo",
      "Dashboards and visualisation: Grafana",
      "Observability pipelines: OpenTelemetry Collector, Alloy, Grafana Cloud ingestion"
    ]

  [[resume.skills]]
    name = "CI/CD & Automation"
    items = [
      "CI systems: GitHub Actions, Woodpecker CI, Gitea Actions",
      "Container image automation and optimisation: Docker, BuildKit, multi-arch builds",
      "Release automation and versioning",
      "Dependency automation: Renovate, Dependabot",
      "GitOps: Argo CD",
      "Secrets management: Kubernetes secrets, Sealed Secrets",
      "Shell scripting",
      "Make"
    ]

  [[resume.skills]]
    name = "Databases & Storage"
    items = [
      "PostgreSQL",
      "MySQL",
      "Redis",
      "Object storage: S3, MinIO"
    ]

  [[resume.experience]]
  company = "Professional Development"

  [[resume.experience.role]]
  title = "Independent Engineer"
  start = "2025-04"
  current = true

  summary = [
    "Full-time independent engineering work focused on building and operating production-style systems."
  ]

  highlights = [
    "Built and operated production-style personal and open-source systems across application code and infrastructure."
  ]

  [[resume.experience]]  
  company = "Stickee"

  [[resume.experience.role]]
  title = "DevOps Engineer"
  start = "2022-03"
  end   = "2025-04"

  summary = [
    "Built shared tooling and internal platforms to support application delivery, observability, and operational consistency across multiple teams."
  ]

  highlights = [
    "Led the rollout of application observability using Grafana Cloud APM, onboarding teams and establishing shared monitoring and alerting practices.",
    "Built a Kubernetes-based self-service preview environment, enabling per-pull-request deployments via GitHub Actions, Argo CD, Helm, and shared automation.",
    "Designed and standardised CI/CD pipelines across multiple repositories, aligning build, test, and deployment workflows with preview environments.",
    "Developed shared Laravel instrumentation to provide consistent application metrics and job queue visibility across services.",
    "Created and maintained a company-wide code quality and standards package, integrating PHP CS Fixer, Larastan, and Rector into local and CI workflows.",
    "Worked closely with application teams to align development and operational practices, providing hands-on support with delivery, reliability, and complex technical issues."
  ]

  [[resume.experience.role]]
  title = "Full Stack Developer"
  start = "2019-01"
  end   = "2022-03"

  summary = [
    "Delivered and maintained client and internal web applications over multiple years in an agency environment, moving across multiple projects while retaining ownership of long-lived systems alongside new feature delivery."
  ]

  highlights = [
    "Primary developer on an affiliate network platform, responsible for the majority of full-stack implementation across application logic, data flows, and ongoing maintenance.",
    "Built and maintained services to ingest and normalise external data, making it reliable and reusable across multiple client and internal products.",
    "Contributed to an in-house product used by globally recognised enterprise customers."
  ]

  [[resume.experience]]
  company = "Caters News Group"

  [[resume.experience.role]]
  title = "Full Stack Developer"
  start = "2018-04"
  end   = "2018-08"

  summary = [
    "Joined an established team to provide hands-on development support and technical oversight, reviewing external agency output and advising on maintainability and delivery."
  ]

  [[resume.experience]]
  company  = "Inganta Limited"

  [[resume.experience.role]]
  title = "CTO / Co-Founder"
  start = "2016-06"
  end   = "2018-01"

  summary = [
    "Led the technical development of a data-driven SaaS product built on UK Companies House iXBRL data."
  ]

  highlights = [
    "Built and operated the core data processing and enrichment pipelines, transforming regulatory filings into commercially usable financial signals.",
    "Designed and iterated on a turnover estimation system, using a distributed tree-based model implemented with H2O, with end-to-end ownership of architecture and operations in a resource-constrained startup."
  ]

  [[resume.experience]]
  company  = "Blue Cube Communications Limited"

  [[resume.experience.role]]
  title = "Lead Software Engineer"
  start = "2014-10"
  end   = "2016-06"

  summary = [
    "Led end-to-end delivery of multiple client-facing web projects, owning implementation through to production release."
  ]

  highlights = [
    "Established repeatable development and deployment workflows using Vagrant and Ansible.",
    "Acted as a technical lead and mentor, introducing Atomic Design and shared patterns to improve consistency and delivery."
  ]

  [[resume.experience]]
  company  = "Sixth Story Creative Limited"

  [[resume.experience.role]]
  title = "Software Engineer"
  start = "2012-09"
  end   = "2014-05"

  summary = [
    "Delivered client-facing websites and e-commerce platforms in a fast-paced agency environment, collaborating closely with in-house designers."
  ]

  highlights = [
    "Developed a strong foundation in shipping work with real-world constraints and deadlines."
  ]

  [[resume.education]]
  name = "BA (Hons) Business Management"
  institution = "University of Cumbria"
  start = "2009"
  end = "2012"

+++
