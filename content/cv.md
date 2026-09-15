+++
title = "CV"
type = "resume"
show_in_pages_nav = true

[resume]
  website = "https://paultibbetts.uk"
  photo   = "/icon.png"

  region  = "North Wales"
  country = "UK"
  email   = "hire@paultibbetts.uk"

  summary = [
    "Platform engineer with a software engineering background spanning application development, infrastructure, CI/CD, observability, automation and developer tooling.",
    "Hands-on across Linux, Infrastructure as Code, Kubernetes, cloud platforms and virtualisation, with a track record of improving platform reliability and developer experience through automation, standardisation, and close collaboration with development teams.",
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
    url   = "https://www.linkedin.com/in/paultibbetts"
    rel   = "me"

  [[resume.skills]]
    name = "Platform & Infrastructure"
    items = [
      "Linux server administration",
      "Cloud platforms: AWS, Linode, DigitalOcean",
      "Virtualisation: Proxmox, LXC",
      "Cloud-native application architecture",
      "Networking fundamentals",
      "Ingress & traffic management: Traefik, ingress-nginx, Caddy, Nginx, Apache",
    ]

  [[resume.skills]]
    name = "Infrastructure as Code & Automation"
    items = [
      "IaC: Terraform, Ansible",
      "Bash / shell scripting"
    ]

  [[resume.skills]]
    name = "CI/CD & Source Control"
    items = [
      "Source control: Git, GitHub, Gitea, GitLab",
      "CI: GitHub Actions, Gitea Actions, Woodpecker CI",
      "GitOps: Argo CD",
      "Release automation and versioning",
      "Dependency automation: Renovate, Dependabot"
    ]

  [[resume.skills]]
    name = "Containers & Orchestration"
    items = [
      "Kubernetes ecosystem: Kubernetes, Helm, Talos, K3s",
      "Container image automation and optimisation: Docker, BuildKit, multi-arch builds",
      "Secrets management: Kubernetes Secrets, Sealed Secrets"
    ]

  [[resume.skills]]
    name = "Observability"
    items = [
      "Instrumentation: OpenTelemetry (manual + automatic)",
      "Logs, metrics and traces: Loki, Prometheus, Tempo",
      "Dashboards and visualisation: Grafana",
      "Observability pipelines: OpenTelemetry Collector, Alloy, Grafana Cloud ingestion"
    ]

  [[resume.skills]]
    name = "Databases & Storage"
    items = [
      "PostgreSQL, MySQL/MariaDB",
      "Redis",
      "Object storage: Amazon S3, MinIO"
    ]

  [[resume.skills]]
    name = "Programming"
    items = [
      "Go",
      "Python - FastAPI, Flask",
      "JavaScript, TypeScript - Vue.js, React",
      "PHP - Laravel, SlimPHP"
    ]

  [[resume.experience]]
  company = ""

  [[resume.experience.role]]
  title = "Professional Development"
  start = "2025-04"
  current = true

  summary = [
    "Hands-on engineering through the ongoing operation and evolution of a persistent self-hosted infrastructure environment."
  ]

  highlights = [
    "Operate and maintain Linux infrastructure across Proxmox virtualisation and a Talos Kubernetes cluster.",
    "Manage infrastructure configuration and application deployments using Terraform, Ansible, Helm, Argo CD, and Git-based workflows.",
    "Configure and maintain networking, DNS, ingress, TLS certificate management, secrets management and identity/SSO across self-hosted services.",
    "Operate monitoring and observability using Grafana, Prometheus and related tooling.",
    "Maintain persistent storage and backup workflows using TrueNAS, Proxmox Backup Server and S3-compatible object storage."
  ]

  [[resume.experience]]  
  company = "Stickee"

  [[resume.experience.role]]
  title = "DevOps Engineer"
  start = "2022-03"
  end   = "2025-04"

  summary = [
    "Built shared tooling and internal platforms to improve application delivery, observability, and operational consistency across multiple teams."
  ]

  highlights = [
    "Built a Kubernetes-based self-service preview environment, enabling per-pull-request deployments via GitHub Actions, Argo CD, Helm, and shared automation.",
    "Designed and standardised CI/CD pipelines across multiple repositories, aligning build, test, and deployment workflows with preview environments.",
    "Led the rollout of application observability using Grafana Cloud APM, onboarding teams and establishing shared monitoring and alerting practices.",
    "Developed shared Laravel instrumentation to provide consistent application metrics and job queue visibility across services.",
    "Worked directly with application teams to align development and operational practices, troubleshoot delivery and reliability issues, and provide support for complex technical problems.",
    "Created and maintained a company-wide code quality and standards package, integrating PHP CS Fixer, Larastan, and Rector into local and CI workflows."
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
