# Windows Support Lab

**Work in progress · PowerShell · Windows troubleshooting · networking**

This is a hands-on learning project for entry-level IT support and service-desk skills.

The goal is not to build a flashy frontend. The goal is to practise a repeatable troubleshooting process and produce small PowerShell tools that I can explain line by line.

## Skills this lab will cover

- collecting basic Windows system information
- checking IP configuration
- DNS resolution
- testing network reachability
- checking TCP ports
- inspecting Windows services
- reading useful event/log information
- documenting symptoms, hypotheses, tests and conclusions
- writing small PowerShell functions with predictable output

## Planned labs

### Lab 1 — Network triage
Scenario: a user says “the internet is down”.

Checklist:
- [ ] inspect local IP configuration
- [ ] identify default gateway
- [ ] test loopback and local stack
- [ ] test gateway reachability
- [ ] test public IP reachability
- [ ] test DNS resolution separately
- [ ] document what each result tells us

### Lab 2 — DNS troubleshooting
Scenario: IP connectivity works, but websites do not open by name.

Checklist:
- [ ] inspect configured DNS servers
- [ ] resolve a known hostname
- [ ] compare name resolution with direct IP connectivity
- [ ] flush DNS cache and explain when that is useful
- [ ] document likely causes

### Lab 3 — Service troubleshooting
Scenario: an application depends on a Windows service that is stopped.

Checklist:
- [ ] find the service
- [ ] inspect status and startup type
- [ ] start/restart it safely in the lab
- [ ] record errors
- [ ] explain the difference between symptom and root cause

### Lab 4 — Support data collector
Build a PowerShell script that outputs a compact support report containing:
- [ ] hostname / Windows version
- [ ] uptime
- [ ] active network adapters
- [ ] IP / gateway / DNS information
- [ ] selected service states
- [ ] recent relevant errors

## Repository rules

For this project I will keep a short learning log. Each finished script should include:
1. what problem it solves,
2. how I tested it,
3. one limitation,
4. one improvement I would make next.

Starter files contain TODOs intentionally. Completing those TODOs is part of the project.

## Start here

- [Learning log](./LEARNING_LOG.md)
- [Network triage lab](./labs/01-network-triage.md)
- [System info script starter](./scripts/Get-SupportSnapshot.ps1)
- [Network test script starter](./scripts/Test-NetworkBasics.ps1)
